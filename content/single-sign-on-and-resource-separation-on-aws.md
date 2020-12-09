---
date: 2020-10-23T13:21:00+01:00
lastmod: 2020-10-23T13:21:00+01:00
title: "Single Sign-On and Resource Separation on AWS"
description: ""
authors: ["manuelkiessling"]
slug: 2020/10/23/single-sign-on-and-resource-separation-on-aws
lang: en
---

Most AWS projects start small, with just a single AWS account that contains all the resources and services to build, deploy, and run a project. Up to a certain point, this is just fine. And even with just one account, resources can be isolated from each other - for example, you can run the EC2 instances of your preproduction stage in a different VPC than the instances of your production stage.

But the best practices recommended by AWS suggest a more thorough isolation: Put everything that belongs together in one AWS account, and everything that doesn't into another one. Thus, for example, one dedicated AWS account for preproduction, another one for production. Getting from resources within preproduction into resources within production, either by mistake or maliciously, becomes near-impossible.

Once you realize how an AWS account is simply a very high-level namespace, the decision to create yet another account whenever it seems fit comes easily, and rightly so. Got 4 projects consisting of 3 stages each? Cut that into 12 AWS accounts, no need to be squeamish. You even get cleanly separated billing, and therefore precise per-project cost management, for free (while you can still receive just one consolidated invoice, if that's what you prefer).

There is a downside to this approach, however: without the right approach, access and rights management quickly becomes a mess: You certainly don't want to use the "root" user of each account to do stuff in each account, and might consider creating one personal IAM user for each of your team members within each AWS account, linking them to the least-privilege IAM policies that are relevant for they work within each AWS account; that's a secure approach, but not one that can be easily managed, even by the users themselves, as every team member now has 12 IAM users.

[{{<
    figure src="/images/single-sign-on-and-resource-separation-on-aws/single_sign_on_and_resource_separation_on_aws_1.svg"
>}}](/images/single-sign-on-and-resource-separation-on-aws/single_sign_on_and_resource_separation_on_aws_1.svg)


[{{<
    figure src="/images/single-sign-on-and-resource-separation-on-aws/single_sign_on_and_resource_separation_on_aws.svg"
>}}](/images/single-sign-on-and-resource-separation-on-aws/single_sign_on_and_resource_separation_on_aws.svg)


Note how this is a two-way construct: The IAM policy in the source account allow the IAM users to leave their own account and assume a role in the target account - this opens a door **out of** the source account, so to speak.

On the other side, the Trusted Entities entry on the role in the target account allows incoming assume-role requests from the source account - this opens a door **into** the target account, so to speak.

These two measures create a bridge between IAM users in one account and roles in another account.
