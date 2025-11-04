---
date: 2025-11-04T00:00:01+02:03
lastmod: 2025-11-04T00:00:01+02:03
title: "What if software shipped with a software engineer?"
description: ""
authors: ["manuelkiessling"]
slug: 2025/11/04/what-if-software-shipped-with-a-software-engineer
lang: en
---


A recent experiment made the rounds showing an LLM acting as the whole application: every HTTP request is handled by the model, which designs schemas, renders HTML, and mutates state through tool calls. It worked — barely. It was slow, expensive, and visually inconsistent. But it surfaced a useful question: if inference keeps getting cheaper and faster, why generate code at all?

My answer is a middle path: keep shipping software — but ship it with an embedded software engineer.

{{< sidenote title="Context" >}}
This idea was sparked by a discussion on Hacker News: [“Why write code if the LLM can just do the thing?”](https://news.ycombinator.com/item?id=45783640).{{< /sidenote >}}

## The third way

Today we have two extremes:

- **Classical delivery**: developers write code, deploy, and hand you the result. Changes require a ticket, a sprint, and a release.
- **LLM-as-runtime**: the model “is” the app. Every request becomes a design/build/execute cycle. Novel, but brittle.

There is a third way that blends reliability with on-demand change: a conventional application with a built-in “Develop” mode. When users need something the application doesn’t offer, they ask the embedded engineer.

## Example

You’re working in a straightforward inventory management system: SKUs, counts, suppliers, filters; nothing exotic. You use the software, and realize that you need a new feature: CSV export.

In a classical setup, you’d file a ticket and wait for a release. In an LLM‑as‑runtime setup, the model would reinvent the feature on each request — fast to try, but inconsistent and hard to govern.

With the approach that I have in mind, it works like this:

You open Develop mode and ask: “Add a feature that allows to export the inventory as a CSV file”.

The agent implements the feature where it belongs, adds tests, runs checks, migrates a snapshot, and gives you a preview. You approve; the changes are merged. Next week, it’s still there — a normal, versioned feature of your software.


## How it would work

- **Enter Develop mode**: a special button in the application opens a focused AI chat, scoped to the app’s codebase, tests, infrastructure, and style guide.
- **Request the change**: “Add CSV export for inventory.” The request targets the software itself.
- **Behind the scenes**:
  - A branch-like workspace is created with a full data snapshot.
  - The agent edits code where it belongs, runs linters, tests, and security checks.
  - Migrations run against the snapshot; failure rolls back automatically.
  - A dedicated preview instance spins up with your copied data.
- **Promote when ready**: approve to merge and deploy; or iterate, or discard.

This keeps the virtues of shipped software — repeatability, versioning, stability — while lowering the cost of small, local changes.

## Why this is promising

At its best, software is a frozen conversation: a chain of decisions captured in code, tests, and migrations. The third way keeps that property while letting the conversation continue inside the product.

- **Shorter idea‑to‑feature loop**: users become power users who can steer the product without leaving it.
- **Safer than “the model is the app”**: changes are durably encoded in code and tests, not ephemeral prompts.
- **Governable**: every change has ownership, review, audit logs, and rollbacks; org policy still applies.
- **Pragmatic**: especially good for internal tools and domain UIs where requests are concrete and impact is local.

## Hard problems to solve

- **Concurrency**: what if two users change overlapping parts at once? You need workspaces, locks, and merge policies.
- **Data safety**: snapshotting and migrating large, sensitive datasets quickly and safely.
- **Cost and performance**: previews, builds, and model calls need budgets and quotas.
- **Boundaries**: which parts are agent-editable, and which are off-limits without human review?

These are not showstoppers. They are product and platform work, the kind we already know how to do when we care enough.

More interestingly, they hint at a shift in what software engineers deliver. Less “finished features,” more “systems that safely produce features on demand.” The output becomes meta‑software: guard rails, previews, migrations, policies, tests, and style guides that let users and agents evolve the product without breaking its shape.

We already do parts of this. CI/CD, typed interfaces, schema migration frameworks, linters, and design systems are all tools for making change repeatable. The third way asks us to pull these threads together and treat change itself as a first‑class product: who may change what; how state is copied, migrated, and merged; which invariants are enforced by tests; what must be reviewed by humans; how traceability and rollback work.

Done well, this elevates the role. Engineers become designers of the interface for change. We shape boundaries and contracts; we encode domain rules as tests; we make the safe path the easy path; we optimize the ergonomics of evolving the system. Users get agency. The system gets consistency. And fewer ideas die in tickets.

## Ship the product, plus its engineer

I don’t expect “no-code via LLM-at-runtime” to replace robust systems. But I do expect many systems to ship with an embedded virtual engineer. Users get a reliable application for everyday work — and a tightly scoped way to make it better, right when the need arises.

In other words: keep shipping software. Just ship it with a software engineer.
