---
date: 2020-10-23T13:21:00+01:00
lastmod: 2020-10-23T13:21:00+01:00
title: "Single Sign-On and Resource Separation on AWS"
description: ""
authors: ["manuelkiessling"]
slug: 2020/10/23/single-sign-on-and-resource-separation-on-aws
lang: en
---



[{{<
    figure src="/images/single-sign-on-and-resource-separation-on-aws/single_sign_on_and_resource_separation_on_aws_1.svg"
>}}](/images/single-sign-on-and-resource-separation-on-aws/single_sign_on_and_resource_separation_on_aws_1.svg)


[{{<
    figure src="/images/single-sign-on-and-resource-separation-on-aws/single_sign_on_and_resource_separation_on_aws.svg"
>}}](/images/single-sign-on-and-resource-separation-on-aws/single_sign_on_and_resource_separation_on_aws.svg)


Note how this is a two-way construct: The IAM policy in the source account allow the IAM users to leave their own account and assume a role in the target account - this opens a door **out of** the source account, so to speak.

On the other side, the Trusted Entities entry on the role in the target account allows incoming assume-role requests from the source account - this opens a door **into** the target account, so to speak.

These two measures create a bridge between IAM users in one account and roles in another account.
