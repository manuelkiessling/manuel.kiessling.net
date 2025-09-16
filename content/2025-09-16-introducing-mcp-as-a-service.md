---
date: 2025-09-16T00:00:01+02:00
lastmod: 2025-09-16T00:00:01+02:00
title: "Introducing MCP as a Service: an open MCP server management platform"
description: "A robust, containerized platform for running MCP servers with browser access, secure routing, and a clear path to scale — available as Fair‑code to self‑host or use as a hosted service."
authors: ["manuelkiessling"]
slug: 2025/09/16/introducing-mcp-as-a-service
lang: en
---

# Introduction & Context

Over the last months I have been building MCP as a Service — an open platform with the goal to allow for deploying and operating MCP servers without having to think about infrastructure.

The goal is simple: give AI agents a reliable way to use real tools through MCP servers that you can launch in seconds, observe visually, secure properly, and connect from anywhere.

**MCP as a Service is available to self‑host under a Fair‑code model and as a hosted service you can try for free.**

- **Source**: [github.com/dx-tooling/maas-webapp](https://github.com/dx-tooling/maas-webapp)
- **Hosted service**: [app.mcp-as-a-service.com](https://app.mcp-as-a-service.com)


# What problem it solves

Simply put: it lets developers spin up and run dedicated MCP servers on demand without owning the surrounding infrastructure problems.

Concretely, MCP as a Service takes care of:

- **Routing and TLS**: subdomain‑based endpoints per instance with certificate handling
- **Authentication**: bearer‑token gate at the edge (ForwardAuth) before traffic reaches instances
- **Lifecycle**: create, recreate, and teardown with predictable startup sequencing
- **Observability for humans**: an embedded VNC viewer to see what is happening while an AI agent uses tools like Playwright or a Linux command line
- **Resource isolation**: per‑instance containers with fixed internal ports and health checks

You get a reproducible MCP runtime that is reachable from anywhere — including other cloud systems — while remaining private to you and your workflows.


# What it is today

At the moment, the platform is a small but complete system composed of an edge proxy and per‑instance containers. Instances are self‑describing through labels; the edge discovers them and wires routing and security.

- **Containerized instances**: For example, Chrome + Playwright MCP + VNC tooling orchestrated via supervisord for Playwright instances
- **Traefik at the edge**: subdomain‑based routing, TLS termination, and ForwardAuth
- **Per‑instance labels**: the container declares its own routing and security contract

Traffic flow in production is straightforward:

```
Internet (80/443) → Traefik → {
  app.mcp-as-a-service.com → native Symfony webapp
  mcp-{id}.mcp-as-a-service.com  → instance:8080 (MCP)
  vnc-{id}.mcp-as-a-service.com  → instance:6080 (noVNC)
}
```

Implementation details for the containerization and routing are captured in the Docker rewrite changeset:

- [Platform Rewrite: Switching from OS processes to Docker containers](https://github.com/dx-tooling/maas-webapp/pull/2/files#diff-67d093872ff839bab6e12e9bdea477d79c94d077e6ca89fd2f0ebd92ac00e49a)


# Edge routing and auth

Routing is enforced by Traefik using per‑container labels, and access to MCP endpoints is protected via a ForwardAuth callback in the app:

```text
traefik.http.routers.mcp-{instance}.rule=Host(`mcp-{instance}.mcp-as-a-service.com`)
traefik.http.services.mcp-{instance}.loadbalancer.server.port=8080
traefik.http.middlewares.mcp-{instance}-auth.forwardauth.address=https://app.mcp-as-a-service.com/auth/mcp-bearer-check
```


# Multiple Instance Types

Once the base was reliable, I generalized the instance model. The platform now supports **Multiple Instance Types** through a small type registry: each type declares its image/build, required services, and health probes. Readiness moves from ad‑hoc checks to type‑driven contracts.

For now, there are two types — intentionally minimal — to prove that the platform can run fundamentally different MCP servers:

- **Playwright**: a Chrome‑backed environment for browser automation and agent workflows — and you can watch the AI agent browsing the web through the embedded VNC viewer
- **Linux Command Line**: a headless shell for fast, reproducible command execution — and you can watch the AI agent running the shell commands through the embedded VNC viewer

The catalog will grow; the structure is in place to introduce more MCP server variants safely.

Operationally, the web UI grew a bit of muscle: clearer flows, **one‑click recreate**, and an **auto‑connecting VNC viewer** that flips live as soon as readiness is achieved.

- [Feature: Multiple Instance Types](https://github.com/dx-tooling/maas-webapp/pull/6)


# How the pieces fit together

From a high level, the platform separates concerns so each part can evolve independently:

- **Instance lifecycle vs. orchestration**: domain decisions (what to run, when) are decoupled from how a container is executed and wired up
- **Type config vs. management UI**: types live in their own module; UI consumes their declarative contracts
- **Health by config**: readiness is not hard‑coded — each type ships its own probes

The result is boring in all the right ways: a registry maps type → container spec → routing labels → health contract, and the rest follows.


# The journey so far

The first iteration used plain OS processes (Xvfb, x11vnc, websockify, a Node‑based MCP server) started and supervised directly on the host. That was enough to validate the idea, but it hit predictable limits:

- **Fragile lifecycle**: processes could die silently; restart and dependency ordering were brittle
- **Dynamic port chaos**: each instance grabbed host ports, creating conflicts and complex bookkeeping
- **Weak isolation**: workloads influenced each other; hard to reason about resources and failures
- **Operational sprawl**: configuration was spread across the host and hard to reproduce

The rewrite to containers and a subdomain‑based edge fixed these problems and established a foundation for multiple instance types.

# What you can do today

- **Try the hosted service**: create an instance, connect an agent via MCP, watch it drive a real browser or a Linux command line through the embedded VNC viewer
- **Self‑host**: clone the repo, bring up Traefik and the app, and launch instances locally
- **Contribute**: new instance types are intentionally straightforward to add

Helpful entry points:

- Webapp source repository: [github.com/dx-tooling/maas-webapp](https://github.com/dx-tooling/maas-webapp)
- Hosted SaaS offering: [app.mcp-as-a-service.com](https://app.mcp-as-a-service.com)
- Fair‑code model: [faircode.io](https://faircode.io)


# Roadmap

Short term:

- More instance types (data‑oriented, CLI‑oriented, and specialized browser profiles)
- Tighter observability for health and performance
- Hardened quotas and isolation defaults

Medium term:

- Team features (shared instances, tokens, and audit trails)
- Pluggable auth and per‑tenant routing policies


# Closing thoughts

The interesting part of MCP as a Service isn’t any one feature — it’s the shape of the system. Putting containers, subdomain routing, and type‑driven health behind a small UI yields a platform that is both easy to use and honest to operate.

As with most of my work, this project leans on proven engineering practices: explicit contracts, separation of concerns, and guard rails that let the rest move fast. If you’re curious, take it for a spin — and if you build on it, I’d love to hear what you ship.
