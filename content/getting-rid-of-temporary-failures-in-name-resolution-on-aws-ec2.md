---
date: 2022-01-22T16:37:00+01:00
lastmod: 2022-01-22T16:37:00+01:00
title: "Getting rid of temporary failures in name resolution on AWS EC2"
description: "The applications on our EC2-based virtual machines started to show repeatedly show 'temporary failure in name resolution' errors. Here is how we identified and solved this problem."
authors: ["manuelkiessling"]
slug: 2022/01/22/getting-rid-of-temporary-failures-in-name-resolution-on-aws-ec2
lang: en
---

# Introduction

At Joboo.de, we are running nearly all of our infrastructure on AWS. This includes a couple of PHP-based Symfony applications running on virtual Linux servers on EC2.

A couple of weeks ago, we saw elevated error levels from these applications, and they all boiled down to the same problem: in order to connect to a couple of AWS-managed services like MariaDB (on AWS Relational Database Service), ElasticSearch (on AWS OpenSearch), SMTP (on AWS Simple Email Service), and Redis (on AWS ElastiCache), these applications wanted to resolve the DNS names of those service endpoints to their underlying IP addresses - and these lookups failed multiple times per day.

The problems occurred in "chunks" - that is, we saw zero problems for a couple of hours, and then up to a couple of hundred errors within a very short time frame of only several of minutes, again followed by multiple hours without any issues:

[{{< figure src="/images/getting-rid-of-temporary-failures-in-name-resolution-on-aws-ec2/2022-01-22-getting-rid-of-temporary-failures-in-name-resolution-on-aws-ec2-error-grap.png" width="100%" class="m-5" >}}](/images/getting-rid-of-temporary-failures-in-name-resolution-on-aws-ec2/2022-01-22-getting-rid-of-temporary-failures-in-name-resolution-on-aws-ec2-error-grap.png)

When investigating the problem, one quickly ends up on this [AWS documentation about the DNS quota within Amazon Virtual Private Cloud (VPC)](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-limits), which states the following:

<blockquote>
Each EC2 instance can send 1024 packets per second per network interface to Route 53 Resolver (specifically the .2 address, such as 10.0.0.2, and 169.254.169.253). This quota cannot be increased.
</blockquote>

"Route 53" is the managed DNS service of AWS which among other things provides the aforementioned Resolver as the DNS server which can be used by EC2 instances within a VPC to resolve DNS names. It looked like we were running into the mentioned quota limit. 

An important detail is that we run a setup where we manage our own CNAME records for some of the service endpoints our application needs, and do so within a private Route 53 Hosted Zone. Because that zone is private, only Route 53 itself can resolve names within this zone. We thus could not simply switch name resolution from AWS's VPC Resolver to a public DNS service like Google's 8.8.8.8 or Cloudflare's 1.1.1.1, as those simply don't have these DNS records.

We were already doing what AWS describes in [How can I avoid DNS resolution failures with an Amazon EC2 Linux instance?](https://aws.amazon.com/de/premiumsupport/knowledge-center/dns-resolution-failures-ec2-linux/), which recommends to set up a DNS cache on each EC2 instance to limit the number of DNS queries to the Route 53 Resolver - this way, each record is looked up through the Resolver once, and subsequent lookups are answered by the local cache, without going to the Resolver again.

However, this only works until the Time-to-live (TTL) value of the record is reached; when this is the case, the record is considered stale, and has to be retrieved again through the Resolver.

This means that the "saving potential" of using a cache depends on the TTL of frequently-needed records. And of course, the DNS records of the AWS-managed services are the most frequently requested ones *and* they have extremely low TTLs. A record for an RDS-hosted database, for example, is "good" for only 5 seconds. And these values are set by AWS and cannot be influenced by the AWS customer.

Having extremely short-lived records makes sense with regards to minimizing service downtime - if and when the RDS database runs into a problem and needs to invoke a failover process, it potentially must be moved to another server (and therefore another network segment) somewhere in AWS's cloud, which would result in a new IP address.

An application using this database would of course be interested to learn about the new IP address as quickly as possible, in order to avoid connection attempts to the old, and now wrong, IP address.

While we sure like high availability and low downtimes too, a failover time of only 5 seconds is way less than we need, especially when it has the side effect of making our applications run into Route 53's DNS quota multiple times a day. 

However, we cannot change the TTL of the records in question - while we control the records (including the TTL) of our own private hosted zone, like `db.prod.jooboo.internal`, these are only CNAME records to an actual A record like `675467832656467.cfengesemfrs.eu-central-1.rds.amazonaws.com`, and records in the `amazonaws.com` zone are of course controlled by AWS. 

We thus needed a way to "virtually" increase the TTL of those records, to somehow ensure that our own servers talked to the Resolver, say, only every minute instead of every 5 seconds.

Luckily, such a solution 