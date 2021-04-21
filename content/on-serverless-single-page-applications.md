---
date: 2021-03-27T08:30:00+01:00
lastmod: 2021-03-27T08:30:00+01:00
title: "On Single Page Applications with a Serverless Backend"
description: ""
authors: ["manuelkiessling"]
slug: 2021/03/27/on-single-page-applications-spa-with-a-serverless-lambda-backend
lang: en
---

I've recently took part in building [LogBuddy.io](https://logbuddy.io), in the role of principal software and systems engineer.

The project not only scratched one of my own itches (how do you get log data on the web quickly and easily when a big enterprise solution is simply overkill, but you also don't want to duct-tape together something brittle on the spot), I also wanted to use it as an excuse to finally build my first software and systems project that was 100% serverless in the backend and 100% an SPA on the frontend.

That's how all the really great software projects start, right? CV-driven development anyone?

As if that wasn't enough, I'm also the guy with this tweet:

> Never underestimate how far web apps with Server-Side Page Rendering that do Full Page Reloads On Every Click powered by a One Thread Per Request Language running as a Monolithic Service On A Non-Distributed System can get you in terms of generating real value for real customers.

[Source](https://twitter.com/manuelkiessling/status/1083642207758962688)

Now, I wouldn't say that what I wrote back then was wrong (who am I to criticize people on Twitter?), but...

Part of this is "know your enemy": I have no problem disliking something passionately, but I hate the feeling that maybe I hate something for the wrong reasons or because I'm not well-informed enough about it.


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
