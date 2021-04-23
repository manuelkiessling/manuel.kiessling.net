---
date: 2021-04-21T08:30:00+01:00
lastmod: 2021-04-21T08:30:00+01:00
title: "Tutorial: Single Page Applications with a Serverless Backend and Infrastructure as Code"
description: ""
authors: ["manuelkiessling"]
slug: 2021/04/21/tutorial-react-single-page-applications-spa-with-a-serverless-aws-lambda-backend-and-terraform-infrastructure-as-code
lang: en
---

# About

I've recently taken part in building [LogBuddy.io](https://logbuddy.io), in the role of principal software and systems engineer.

The project not only scratched one of my own itches (how do I get the log output of [my bash-based Continuous Delivery tool](https://github.com/manuelkiessling/simplecd/) into a web browser?), I also wanted to use it as an excuse to finally build my first software-and-systems project that was 100% serverless in the backend and 100% an SPA on the frontend.

After all, that's how all great software projects start: with [CV Driven Development](https://www.clairecodes.com/blog/2019-05-15-cv-driven-development/)!

As if that wasn't enough, I'm also the guy with [this tweet](https://twitter.com/manuelkiessling/status/1083642207758962688):

> Never underestimate how far web apps with Server-Side Page Rendering that do Full Page Reloads On Every Click powered by a One Thread Per Request Language running as a Monolithic Service On A Non-Distributed System can get you in terms of generating real value for real customers.

Now, I wouldn't say that what I wrote back then was wrong (who am I to criticize people on Twitter?), but let's say that I'm well aware of the limitations of the stack described above.

And part of this is driven by a "know your enemy" attitude: I have no problem disliking something passionately, but I really don't want to dislike it for the wrong reasons or because I'm not well-informed enough.

I was sure that there are plenty of very valid reasons to use an SPA + serverless architecture, and I wanted to finally embrace it for good, making it part of my toolbox.

This tutorial is the result of that journey. It describes a target setup for a simple but fully-functional web app, and guides you through all steps required to have this setup up and running in your own AWS account.


# The project

When all steps of this tutorial have been followed, the result is a React/Redux frontend served via CloudFront (in front of S3) that talks to a backend running on AWS Lambda, and which, too, is served via CloudFront (in front of API Gateway), with data written to and read from a DynamoDB table.

A complete and fully working code base for this setup is [available on GitHub](https://github.com/manuelkiessling/react-typescript-lambda-app). However, some notes regarding this code base:

- It's much better to follow the step-by-step tutorial below than to only check out the finished result.
- The code base represents what I consider a best-practice *approach* for the given target architecture; however, in order to ensure a level of brevity required for a concise tutorial that doesn't overwhelm its readers, it is not a best-practice *implementation* down to the last detail! For example, it is lacking software tests, which is a no-go for any serious software project.

The bottom line is this: take the *ideas* and use what you *learn* from this tutorial and its final code base, but do not simply take the code base as the foundation of your next web app project.


# Prerequisites

In order to follow along, you will need the following:

**A macOS or Linux system**

While it's certainly possible to develop the required code base on a Microsoft Windows system, my resources only allow to ensure that the tutorial and its result will work on a Unix-like operating system.

Note that we are going to do a lot of work on the command line, so make sure that you have a terminal application available.


**An Amazon AWS account**

A simple personal account is perfectly fine, but for the sake of simplicity you need full access to all resources in this account (i.e., an AWS account root user or an IAM user attached to the "AdministratorAccess" policy). Create a new account at https://aws.amazon.com if necessary, or use an existing one.

This, of course, isn't the best practice approach when working with AWS, but the best-practice approach would go beyond the scope of this tutorial. See my [Single Sign-On and Resource Separation on AWS](/2020/12/29/single-sign-on-and-resource-separation-on-aws/) guide for more information on this topic.

While not all resources that need to be created fall under the AWS Free Tier offering, AWS costs will be minimal to non-existent - after all, that's exactly the idea when building a serverless project that doesn't receive any relevant amount of traffic. And thanks to the Infrastructure as Code approach of the tutorial, everything we deploy can be torn down and removed with a single command.

However, all of this still means that ultimately, *you alone* are responsible for managing and monitoring your AWS costs.


**AWS Command Line Interface version 2**

If you do not yet have the AWS CLI installed on your system, then please refer to the official [Installing, updating, and uninstalling the AWS CLI version 2](https://docs.aws.amazon.com/de_de/cli/latest/userguide/install-cliv2.html) guide.

In case you are working on a macOS system that uses Homebrew, it's as simple as `brew install awscli`.


**Terraform**

During this tutorial, we will create a small but full-fledged SPA + serverless infrastructure on AWS, but we are not going to do this via manually through the web-based AWS console. Instead, our infrastructure will be defined with HashiCorp Configuration Language (HCL) code files. These code files are then read and interpreted via Terraform; this tool talks to AWS and does the actual heavy lifting of getting our infrastructure deployed.

This approach is called "Infrastructure as Code". If you are new to this concept, feel free to head over to my [Healthy Continuous Delivery: Infrastructure-as-Code](https://develop-build-deploy.com/tutorials/healthy-continuous-delivery-infrastructure-as-code/) guide first.

Don't worry though - I will explain everything Terraform-related in detail below.

Just make sure to install the most recent version of the Terraform CLI command for your platform, available at https://www.terraform.io/downloads.html.


**Node Version Manager - NVM**

To ensure that you have just the right version of Node.js and NPM, you need to have NVM installed on your machine. The [official NVM installation guide](https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating) has all the details.


# Preparation

As a final check that everything we will need is available and working, make sure that running `aws --version`, `terraform -version`, and `nvm --version` on your command line all look good.

If these look encouraging, we can start by setting up the AWS credentials on the local system. This allows AWS CLI and Terraform to talk to AWS.

Log into your AWS account on https://console.aws.amazon.com, and afterwards, head over to "My Security Credentials" at https://console.aws.amazon.com/iam/home#/security_credentials.

Under the "Access keys for CLI, SDK, & API access" headline, hit the "Create access key" button. This gives you an Access key ID and a Secret access key. Keep the page open in order to copy-and-paste these in the next step.

Open your terminal application and run `aws configure` and paste the key ID and access key, like this:

    > aws configure
    AWS Access Key ID [****************]: AKIAUCFPZVBYGKDEGPNF
    AWS Secret Access Key [****************]: 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
    Default region name []: us-east-1
    Default output format []: text

Make sure to set the default region to `us-east-1` and the output format to `text`.


# Terraforming the infrastructure

We can now start to build our AWS infrastructure. To do so, create a project directory and open it in your favourite programming editor or IDE.

Within the project folder, create a subfolder `infrastructure`, and in this subfolder, create file `main.tf`.

Put the following HCL code into this file:

    provider "aws" {
      region = "us-east-1"
    }

This tells Terraform that we want it to be able to talk to AWS in region "us-east-1".

Next, create file `variables.tf` with this content:

    variable "project_name" {
      type    = string
      default = "PLEASE-CHANGE-ME"
    }

While an AWS account is mostly an isolated thing, some resources like S3 bucket names must be globally unique. Therefore, our project needs its own, unique name which we can then use when naming these kinds of resources.

This means that you MUST change the `PLEASE-CHANGE-ME` part of this file into something that is guaranteed to be unique; for example, your name and something weird, like `default = "john-doe-frumbazel"`.

At this point, we can run Terraform for the first time, in order to initialize the project. It should look like this:

    > terraform init

    Initializing the backend...

    Initializing provider plugins...
    - Finding latest version of hashicorp/aws...
    - Installing hashicorp/aws v3.37.0...
    - Installed hashicorp/aws v3.37.0 (signed by HashiCorp)

    Terraform has created a lock file .terraform.lock.hcl to record the provider
    selections it made above. Include this file in your version control repository
    so that Terraform can guarantee to make the same selections by default when
    you run "terraform init" in the future.

    Terraform has been successfully initialized!

    You may now begin working with Terraform. Try running "terraform plan" to see
    any changes that are required for your infrastructure. All Terraform commands
    should now work.

    If you ever set or change modules or backend configuration for Terraform,
    rerun this command to reinitialize your working directory. If you forget, other
    commands will detect it and remind you to do so if necessary.

With this, Terraform is prepared to do some real work, so let's give it something to work on. We start by defining our S3 setup, in file `s3.tf`:

    resource "aws_s3_bucket" "frontend" {
      bucket        = "${var.project_name}-frontend"
      force_destroy = "false"
      website {
        index_document = "index.html"
        error_document = "error.html"
      }
      acl = "public-read"
    }

    resource "aws_s3_bucket_public_access_block" "frontend" {
      bucket = aws_s3_bucket.frontend.id

      block_public_acls       = false
      block_public_policy     = false
      ignore_public_acls      = false
      restrict_public_buckets = false
    }


    resource "aws_s3_bucket" "backend" {
      bucket        = "${var.project_name}-backend"
      force_destroy = "false"
      acl           = "private"
    }

    resource "aws_s3_bucket_public_access_block" "backend" {
      bucket = aws_s3_bucket.backend.id

      block_public_acls       = true
      block_public_policy     = true
      ignore_public_acls      = true
      restrict_public_buckets = true
    }

Our application will have a frontend (React) and a backend (Node.js), and the code for these needs to be made available to the user's browser (frontend) and to AWS Lambda (backend). This is achieved by putting the code into an S3 bucket, one for the frontend code and one for the backend code.

We therefore define these buckets with Terraform, using the resource statement `aws_s3_bucket`. As said, each bucket needs to have a globally unique name, which is why we prepend our unique `project_name` variable to their names.

An additional resource, `aws_s3_bucket_public_access_block`, ensures that the frontend code is accessible from the outside (CloudFront will need to access the files in order to serve them to the user's browser), while the backend code should be treated as confidential, and any public access will be denied. Internally, AWS Lambda will still be able to load these code files.




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


- Ansatz bewerten auf den Dimensionen UX, DX, RX (Rollout Experience), HX (Hosting Experience, mit Verweis auf Machtlosigkeit zB CloudFront S3 DNS Problem)
