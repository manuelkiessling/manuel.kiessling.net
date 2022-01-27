---
date: 2022-01-22T16:37:00+01:00
lastmod: 2022-01-27T08:26:00+01:00
title: "Getting rid of temporary failures in name resolution on Amazon Elastic Compute Cloud"
description: "The applications on our EC2-based virtual machines started to repeatedly show 'temporary failure in name resolution' errors. Here is how we solved the problem."
authors: ["manuelkiessling"]
slug: 2022/01/27/getting-rid-of-temporary-failures-in-name-resolution-on-aws-ec2
lang: en
---

# Introduction

At Joboo.de, we are running nearly all of our production infrastructure on AWS. This includes several web applications running on virtualized Linux servers hosted via EC2.

A couple of weeks ago, we saw elevated error levels from these applications, and they all boiled down to the same problem: in order to connect to some of our AWS-managed services like MariaDB (on AWS Relational Database Service), ElasticSearch (on AWS OpenSearch), SMTP (on AWS Simple Email Service), and Redis (on AWS ElastiCache), the applications wanted to resolve the DNS names of those service endpoints to their underlying IP addresses – and these lookups failed multiple times per day.

The problems occurred in "chunks" – that is, we saw zero problems for a couple of hours, and then up to a couple of hundred errors within a very short time frame of only several minutes, again followed by multiple hours without any issues:

[{{< figure src="/images/getting-rid-of-temporary-failures-in-name-resolution-on-aws-ec2/2022-01-22-getting-rid-of-temporary-failures-in-name-resolution-on-aws-ec2-error-grap.png" width="100%" class="m-5" >}}](/images/getting-rid-of-temporary-failures-in-name-resolution-on-aws-ec2/2022-01-22-getting-rid-of-temporary-failures-in-name-resolution-on-aws-ec2-error-grap.png)

When investigating the problem, one quickly ends up on this [AWS documentation about the DNS quota within Amazon Virtual Private Cloud (VPC)](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-limits), which states the following:

<blockquote>
Each EC2 instance can send 1024 packets per second per network interface to Route 53 Resolver (specifically the .2 address, such as 10.0.0.2, and 169.254.169.253). This quota cannot be increased.
</blockquote>

"Route 53" is the managed DNS service of AWS which among other things provides the aforementioned Resolver as the DNS server which can be used by EC2 instances within a VPC. It looked like we were running into the mentioned quota limit. 

An important detail is that we run a setup where we manage our own CNAME records for most of the service endpoints our application needs, and do so within a private Route 53 Hosted Zone. Because that zone is private, only Route 53 itself can resolve names within this zone. We thus could not simply switch name resolution from AWS's VPC Resolver to a public DNS service like Google's 8.8.8.8 or Cloudflare's 1.1.1.1, as those simply cannot look up these private DNS records.

We were already doing what AWS describes in [How can I avoid DNS resolution failures with an Amazon EC2 Linux instance?](https://aws.amazon.com/de/premiumsupport/knowledge-center/dns-resolution-failures-ec2-linux/), which recommends to set up a DNS cache on each EC2 instance to limit the number of DNS queries to the Route 53 Resolver - this way, each record is looked up through the Resolver once, and subsequent lookups are answered by the local cache, without the need to go to the Resolver again.

However, this only works until the Time-to-live (TTL) value of the record is reached; when this is the case, the record is considered stale, and has to be retrieved again through the Resolver.

This means that the "saving potential" of using a cache depends on the TTL of frequently-needed records. And of course, the DNS records of the AWS-managed services are the most frequently requested ones *and* they have extremely low TTLs. A record for an RDS-hosted database, for example, is "good" for only 5 seconds. And these values are set by AWS and cannot be influenced by the AWS customer.

Having extremely short-lived records makes sense with regards to minimizing service downtime - if and when the RDS database runs into a problem and needs to invoke a failover process, it potentially must be moved to another server (and therefore another network segment) somewhere in AWS's cloud, which would result in a new IP address.

An application using this database would of course be interested to learn about the new IP address as soon as possible, in order to avoid connection attempts to the old, and now wrong, IP address.

While we sure like high availability and low downtimes too, a failover time of only 5 seconds is way less than we need, especially when it has the side effect of making our applications run into Route 53's DNS quota multiple times a day. 

However, we cannot change the TTL of the records in question - while we control the records (including the TTL) of our own private hosted zone, like `db.prod.jooboo.internal`, these are only CNAME records to an actual A record like `675467832656467.cfengesemfrs.eu-central-1.rds.amazonaws.com`, and records in the `amazonaws.com` zone are of course controlled by AWS. 

We thus needed a way to "virtually" increase the TTL of those records - a way to somehow ensure that our own servers talked to the Resolver, say, only every minute instead of every 5 seconds.

Here is what we came up with.

The local DNS cache we use on our EC2 Linux systems is [systemd-resolved](https://www.freedesktop.org/software/systemd/man/systemd-resolved.service.html). While it doesn't offer a way to override TTLs of records in its cache, it has one feature that turned out to be handy: as long as configuration setting `ReadEtcHosts` is set to `yes`, entries in file `/etc/hosts` are honored.

Thanks to this, we were able to build a solution where we run a bash script every minute which resolves the IP address of a record like `db.prod.jooboo.internal` by requesting the Resolver directly, and write the result into file `/etc/hosts`. Any other application trying to resolve this DNS name still uses the local DNS cache, which in turn will resolve the IP address using the hosts file entry instead of going to the Resolver itself.

That way, each DNS record is in practice cached locally for 1 minute, resulting in only one Resolver request per minute, keeping us well below the VPC's DNS quota.

Here's how that script looks for `db.prod.jooboo.internal` and `redis.prod.jooboo.internal`:

    #!/usr/bin/env bash
    
    HOSTSFILE=/etc/hosts
    
    function valid_ip()
    {
        local ip=$1
        local stat=1
    
        if [[ $ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            OIFS=$IFS
            IFS='.'
            ip=($ip)
            IFS=$OIFS
            [[ ${ip[0]} -le 255 && ${ip[1]} -le 255 && ${ip[2]} -le 255 && ${ip[3]} -le 255 ]]
            stat=$?
        fi
        return $stat
    }
    
    OUTPUT="127.0.0.1 localhost
    
    ::1 ip6-localhost ip6-loopback
    fe00::0 ip6-localnet
    ff00::0 ip6-mcastprefix
    ff02::1 ip6-allnodes
    ff02::2 ip6-allrouters
    ff02::3 ip6-allhosts
    "
    
    
    for IP in $(dig A "db.prod.jooboo.internal" @10.0.0.2 +multiline +noall +answer +nocmd | grep -v "CNAME" | grep "A" | cut -d "A" -f 2)
    do
        if valid_ip "$IP"
        then
            OUTPUT="$OUTPUT
    $IP $DATABASE_HOSTNAME"
        fi
    done
    
    
    for IP in $(dig A "redis.prod.jooboo.internal" @10.0.0.2 +multiline +noall +answer +nocmd | grep -v "CNAME" | grep "A" | cut -d "A" -f 2)
    do
        if valid_ip "$IP"
        then
            OUTPUT="$OUTPUT
    $IP $REDIS_HOSTNAME"
        fi
    done

The script takes care to never result in a hosts file that would break DNS lookups by making sure that entries are only written if the lookup result really is an IP address (and not some gibberish resulting from a failed `dig` run), and always writes the complete new content out into the hosts file in one go. It also works whether there is only one A record for a name or multiple records.
