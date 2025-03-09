---
date: 2025-03-09T00:00:01+02:03
lastmod: 2025-03-09T00:00:01+02:03
title: "New project: Platform Problem Monitoring"
description: "A proactive monitoring solution that automatically analyzes your ELK logs, detects patterns, and delivers concise email reports about your platform's health."
authors: ["manuelkiessling"]
slug: 2025/03/09/new-project-plaform-problem-monitoring
lang: en
---

# Introducing Platform Problem Monitoring

I'd like to share a new open-source project I've been working on: **Platform Problem Monitoring**. In essence, it's a powerful tool that helps DevOps and platform engineering teams understand what's going wrong in their systems without active effort or manual analysis.

## The Problem

If you're running a complex platform with many components, you're likely already collecting logs in an ELK (Elasticsearch, Logstash, Kibana) stack. But there's a fundamental challenge with this approach: the sheer volume of data makes it difficult to separate signal from noise.

The typical monitoring workflow looks something like this:

1. Something breaks or behaves oddly
2. Someone notices (hopefully)
3. Engineers actively search logs for clues
4. Time passes while piecing together what happened

This reactive approach puts the burden on engineers to constantly check dashboards or wait for threshold-based alerts that often come too late.

## A Different Approach

What if you could receive a concise, automatically generated email report that summarizes emerging problems, shows how existing issues are trending, and highlights which problems have disappeared since the last check?

That's exactly what Platform Problem Monitoring does:

- It **automatically analyzes** your existing Elasticsearch logs at regular intervals
- It **normalizes** log messages by replacing dynamic parts (UUIDs, timestamps, etc.) with placeholders to reveal patterns
- It **identifies trends** by comparing current problems with previous runs
- It **generates well-designed reports** that deliver a clear picture of your platform's health directly to your inbox

Here's what the report looks like:

[{{< figure src="/images/2025-03-09-new-project-platform-problem-monitoring-sample-mail-report.png" alt="Platform Problem Monitoring Email Report" >}}](/images/2025-03-09-new-project-platform-problem-monitoring-sample-mail-report.png)

## How It Works

Under the hood, Platform Problem Monitoring follows a clean, modular architecture with 12 distinct processing steps that handle everything from querying Elasticsearch to sending the final report:

1. It downloads problem-related log messages from your ELK stack
2. Using the excellent [drain3 library](https://github.com/logpai/Drain3), it intelligently normalizes messages to identify patterns (e.g., "error for user j.doe@example.com: wrong password" becomes "error for user <*>: wrong password")
3. It compares these patterns with previous runs to track changes
4. It generates a well-designed, easily scannable HTML email report with links to Kibana for deeper inspection

The application is designed as a command-line tool that can be triggered manually or scheduled with cron, making it very flexible. It's self-contained and requires minimal setup.

## Is This Tool Right For Me?

If your team:

- Already has an ELK stack collecting logs
- Wants to reduce the cognitive load of monitoring
- Prefers receiving regular summaries rather than constant alerts
- Needs to understand patterns and trends in platform issues

...then Platform Problem Monitoring might be exactly what you need.

## Getting Started

The setup is straightforward:

```bash
git clone https://github.com/dx-tooling/platform-problem-monitoring-core.git
cd platform-problem-monitoring-core
python3 -m venv venv
source venv/bin/activate
pip3 install -e .
```

Then create a configuration file pointing to your Elasticsearch server, S3 bucket (for state storage), and SMTP server, and you're ready to go.

See [the project README](https://github.com/dx-tooling/platform-problem-monitoring-core?tab=readme-ov-file#platform-problem-monitoring--core-application) for more details.

## The Technical Side

For those interested in the implementation details, the project is built with Python 3 and follows a clean, modular architecture where each step in the process can be executed independently. This approach ensures the code remains maintainable and testable.

The code adheres to strict quality standards enforced by tools like mypy, Black, and Ruff. The entire process is designed to be efficient even with large volumes of data, using streaming and pagination techniques when interacting with Elasticsearch.

## Open Source

Platform Problem Monitoring is available under the MIT License, and I welcome contributions from the community. Whether you're interested in enhancing the email template, improving the normalization logic, or adding support for additional data sources, there's plenty of room for collaboration.

You can find the project on GitHub at [dx-tooling/platform-problem-monitoring-core](https://github.com/dx-tooling/platform-problem-monitoring-core).

## Conclusion

In my experience, the best tools are those that quietly do their job without requiring constant attention. Platform Problem Monitoring aims to be exactly that — a reliable companion that helps you understand your platform's health without the need to actively hunt for problems.

By delivering concise, actionable reports directly to your inbox, it transforms the way teams monitor their platforms, shifting from a reactive to a proactive approach.

Give it a try, and let me know what you think!
