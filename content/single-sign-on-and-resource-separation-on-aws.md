---
date: 2020-10-23T13:21:00+01:00
lastmod: 2020-10-23T13:21:00+01:00
title: "Single Sign-On and Resource Separation on AWS"
description: ""
authors: ["manuelkiessling"]
slug: 2020/10/23/single-sign-on-and-resource-separation-on-aws
lang: en
---

Most AWS projects start small and simple, with just a single AWS account that contains all the resources and services to build, deploy, and run one or more software projects. Up to a certain point, this is just fine. And even with just one account, resources can be isolated from each other – for example, you can run the EC2 instances of your preproduction stage in a different VPC than the instances of your production stage.

But the best practices recommended by AWS suggest a more thorough isolation: Put everything that belongs together in one AWS account, and everything that doesn't into another one. Thus, for example, one dedicated AWS account for preproduction, another one for production. This way, getting from resources/services within preproduction into resources within production, either by mistake or maliciously, becomes near-impossible.

Once you realize how an AWS account is simply a very-high-level namespace, the decision to create yet another account whenever it seems fit comes easily, and rightly so. Got 4 projects consisting of 3 stages each? Cut that into 12 AWS accounts, no need to be squeamish. You even get cleanly separated billing, and therefore precise per-project cost management, for free (while you can still receive just one consolidated invoice, if that's what you prefer).

There is a downside to this approach, however: without a well-designed approach, access and rights management quickly becomes a mess: You certainly don't want to use the "root" user of each AWS account to do stuff within each account, and might consider creating one personal IAM user for each of your team members within each AWS account, and then linking them to the least-privilege IAM policies that are necessary for they work within each AWS account. That's a secure approach – but not one that can be easily managed, even by the users themselves, as every team member now has 12 IAM users.

Here is a better solution: Create exactly one IAM user for each team member, and enable these IAM users to switch into specific roles within each of your AWS accounts.

Let's say you have team members Alice and Bob, and you run AWS services in two different AWS accounts called "webapp" and "analytics".

Within your team, Alice fulfills the role of a full-stack developer for the web app, and she's also a "serverless" developer for the computational parts of the analytics project. She thus needs full access to all resources and services within the "webapp" AWS account, and full access to AWS Lambda within the "analytics" account.

On the other hand, Bob's area of responsibility is limited to full-stack development of the web app, thus he too needs full access to all resources and services within "webapp", but no access to any resources within "analytics".

Using the approach proposed here, Alice and Bob will be enabled to switch into specific roles – "LambdaManager" in "analytics" and "AccountManager" in "webapp" for Alice, and "AccountManager" in "webapp" for Bob.

Let's now look at how this can be designed and implementes within AWS. The basic design can be visualized like this:

[{{<
    figure src="/images/single-sign-on-and-resource-separation-on-aws/single_sign_on_and_resource_separation_on_aws_1.svg"
>}}](/images/single-sign-on-and-resource-separation-on-aws/single_sign_on_and_resource_separation_on_aws_1.svg)

This diagram illustrates the following steps:

- You create a dedicated AWS "source" account where all your IAM users live, typically called "users"
- Within this "users" account, you create one IAM user for each team member
- For each role within a "target" account (like "LambdaManager" in target account "analytics"), you create one IAM policy within the "users" account – this policy is what allows IAM users to make a role switch into another AWS account
- You then map these IAM policies to your IAM users as required – in our example, IAM user "Alice" needs to be mapped to the policy for role "LambdaManager" in account "analytics" and to the policy for role "AccountManager" in account "webapp", while IAM user "Bob" only needs to be mapped to the policy for role "AccountManager" in account "webapp"

Everything created so far lives in the source account, the dedicated "users" account – now we need to create resources within our target accounts:

- Within each target account, you need to create the roles that are referenced within the IAM policies of the "source" account – e.g., role "LambdaManager" in target account "analytics"
- For each role, you configure the source account as a "Trusted Entity"
- Each role then needs to be mapped to one or more IAM policies – these define the actual access right which an IAM user who switched into the role gains within the target account



[{{<
    figure src="/images/single-sign-on-and-resource-separation-on-aws/single_sign_on_and_resource_separation_on_aws.svg"
>}}](/images/single-sign-on-and-resource-separation-on-aws/single_sign_on_and_resource_separation_on_aws.svg)


Note how this is a two-way construct: The IAM policy in the source account allows the IAM users to leave their own account and assume a role in the target account - this opens a door **out of** the source account, so to speak.

On the other side, the Trusted Entities entry on the role in the target account allows incoming assume-role requests from the source account - this opens a door **into** the target account, so to speak.

These two measures create a bridge between IAM users in one account and roles in another account.
