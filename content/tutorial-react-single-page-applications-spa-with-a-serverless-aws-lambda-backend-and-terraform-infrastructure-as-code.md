---
date: 2021-04-21T08:30:00+01:00
lastmod: 2021-04-21T08:30:00+01:00
title: "Tutorial: Single Page Applications with a Serverless Backend and Infrastructure as Code"
description: ""
authors: ["manuelkiessling"]
slug: 2021/04/21/tutorial-react-single-page-applications-spa-with-a-serverless-aws-lambda-backend-and-terraform-infrastructure-as-code
lang: en
---

I've recently taken part in building [LogBuddy.io](https://logbuddy.io), in the role of principal software and systems engineer.

The project not only scratched one of my own itches (how do I get the log output of [my bash-based Continuous Delivery tool](https://github.com/manuelkiessling/simplecd/) into a web browser?), I also wanted to use it as an excuse to finally build my first software-and-systems project that was 100% serverless in the backend and 100% an SPA on the frontend.

After all, that's how all great software projects start: with [CV Driven Development](https://www.clairecodes.com/blog/2019-05-15-cv-driven-development/)!

As if that wasn't enough, I'm also the guy with [this tweet](https://twitter.com/manuelkiessling/status/1083642207758962688):

> Never underestimate how far web apps with Server-Side Page Rendering that do Full Page Reloads On Every Click powered by a One Thread Per Request Language running as a Monolithic Service On A Non-Distributed System can get you in terms of generating real value for real customers.

Now, I wouldn't say that what I wrote back then was wrong (who am I to criticize people on Twitter?), but...

Part of this is "know your enemy": I have no problem disliking something passionately, but I hate the feeling that maybe I hate something for the wrong reasons or because I'm not well-informed enough about it.


- Not a starter-template for your app - for educational purposes only!


Prerequisites:

- AWS CLI
- Terraform 0.15
- NVM

- create AWS account
- create IAM user with AdministratorAccess policy (or more fine-grained)
- note on best practice: https://manuel.kiessling.net/2020/12/29/single-sign-on-and-resource-separation-on-aws/
- create project folder
- create infrastructure/terraform/main.tf
- variables.tf -> change to UNIQUE project name!
- s3.tf
- aws configure with API credentials
- terraform init
- terraform apply
- create "fake" zipfiles
- aws s3 cp ./rest_apis_default.zip s3://kiessling-rtla-backend-rest-apis/initial/
- aws s3 cp ./dynamodb_workers_wordcounter.zip s3://kiessling-rtla-backend-dynamodb-workers/initial/
- npx create-react-app react-typescript-lambda-demo --template redux-typescript
- Add .nvmrc
