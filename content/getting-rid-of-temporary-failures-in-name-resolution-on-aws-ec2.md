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

A couple of weeks ago, we saw elevated error levels from these applications, and they all boiled down to the same problem: in order to connect to a couple of AWS-managed services like MariaDB (on AWS Relational Database Service), ElasticSearch (on AWS OpenSearch), SMTP (on AWS Simple Email Service), and Redis (on AWS ElastiCache), they had to resolve DNS names of these endpoint to an IP address - and these lookups failed multiple times per day.

The problems occured in "chunks" - that is, we saw zero problems for a couple of hours, and then up to a couple of hundred errors within a very short time frame of only a couple of minutes: 

[{{< figure src="/images/getting-rid-of-temporary-failures-in-name-resolution-on-aws-ec2/2022-01-22-getting-rid-of-temporary-failures-in-name-resolution-on-aws-ec2-error-grap.png" width="100%" class="m-5" >}}](/images/getting-rid-of-temporary-failures-in-name-resolution-on-aws-ec2/2022-01-22-getting-rid-of-temporary-failures-in-name-resolution-on-aws-ec2-error-grap.png)
