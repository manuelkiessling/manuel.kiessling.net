---
date: 2025-04-03T00:00:01+02:03
lastmod: 2025-04-03T00:00:01+02:03
title: "Senior Developer Skills in the AI Age: Leveraging Experience for Better Results"
description: "How time-tested software engineering practices amplify the effectiveness of AI coding assistants."
authors: ["manuelkiessling"]
slug: 2025/03/31/how-seasoned-developers-can-achieve-great-results-with-ai-coding-agents
lang: en
---

> There is a lively discussion about this post over at HackerNews:<br>https://news.ycombinator.com/item?id=43573755
> 
> I've integrated some of the points made there into this article.

# Introduction

Over the past few months, I have been experimenting with AI-powered coding tools in both my personal and professional projects. The experience has been overwhelmingly positive, both for me and my team of software engineers at work.

We've achieved better results in less time, and in many cases, the quality of our output has significantly improved.

Interestingly, this experience contrasts with the feedback I've received from some fellow software developers who report that AI tools aren't working well for them.

I'm now convinced that AI-assisted software development has the potential to elevate our craft to the next level in terms of productivity. This is why I believe our community should embrace it sooner rather than later — but like all tools and practices, with the right perspective and a measured approach.

My motivation for sharing these experiences and the best practices I've identified is to help move the needle forward in terms of AI adoption within the broader software development community — even if realistically, it's only by some micrometers.

> **A Note on Learning & Productivity:** As some commenters on HackerNews rightly pointed out, AI can also be a powerful learning accelerator. By asking the AI to explain concepts, patterns, or generated code, developers (both junior and senior) can deepen their understanding more rapidly. While this post focuses on leveraging AI for implementation, its role in learning is equally significant and contributes to overall productivity.

# The Current State of AI Coding

## Beyond "Vibe Coding"

My Twitter feed suggests that AI-powered coding tools are already generating significant buzz in a specific niche: non-professional developers who are having great fun building software products. For them, these tools primarily serve as enablers, allowing them to tackle projects they might never have considered without such assistance.

More power to them — it's exciting to witness their journey of struggles and breakthroughs.

However, this represents just one segment of potential users, and certainly not the only group for whom these tools can provide immense value.

## The Senior Developer Advantage

My current conclusion, though preliminary in this rapidly evolving field, is that not only can seasoned developers benefit from this technology — they are actually in the optimal position to harness its power.

**Here's the fascinating part: The very experience and accumulated know-how in software engineering and project management — which might seem obsolete in the age of AI — are precisely what enable the most effective use of these tools.**

# The AI Assistant: A Senior Coder, Junior Colleague

While I haven't found the perfect metaphor for these LLM-based programming agents in an AI-assisted coding setup, I currently think of them as "an absolute senior when it comes to programming knowledge, but an absolute junior when it comes to architectural oversight *in your specific context*."

This means that **it takes some strategic effort to make them save you a tremendous amount of work**.

And who better to invest that effort in the right way than a senior software engineer?

As we'll see, while we're dealing with cutting-edge technology, it's the time-tested, traditional practices and tools that enable us to wield this new capability most effectively.

# Key Areas of Expertise

I've identified three critical areas of expertise needed when working with AI-assisted coding:

- **Well-structured Requirements**
- **Tool-based Guard Rails**
- **File-based Keyframing**

Before diving into these concepts, let me share some real-world examples of how I've used AI in my projects.

I will give examples for two categories of projects: green-field and brown-field.

For both categories, I'll focus on cases where AI handled the entire implementation, or very nearly so.

While I do sometimes use AI as a "better autocomplete" or as a chat-only companion for general discussions, this article focuses on what I call the "real deal" — where AI tooling operates in an agentic mode and handles all the heavy lifting.

## Development Environment

My current tool of choice for these projects is [Cursor](https://www.cursor.com/), powered by Anthropic's Claude Sonnet 3.7 model. For optimal developer experience, I prefer not to manually copy-paste generated code into my codebase and need the AI assistant to execute commands directly on my local command line. Cursor provides this capability, and I expect similar products would yield comparable results.

## Example 1: Platform Problem Monitoring

This setup, combined with the expertise areas I'll discuss, enabled me to create and fully implement a green-field application: *Platform Problem Monitoring*. You can find the source code at https://github.com/dx-tooling/platform-problem-monitoring-core.

The application connects hourly to our ELK stack's Elasticsearch server, reads the latest error messages, and sends us a well-formatted email summarizing the current state of problems on our web platform:

[{{< figure src="/images/2025-03-09-new-project-platform-problem-monitoring-sample-mail-report.png" alt="Platform Problem Monitoring Email Report" >}}](/images/2025-03-09-new-project-platform-problem-monitoring-sample-mail-report.png)

For more details, check out the ["New project: Platform Problem Monitoring"](../../../../2025/03/09/new-project-plaform-problem-monitoring/) post.

**What makes this example particularly interesting is that the core implementation logic was written by Cursor/Claude, requiring minimal manual code intervention from my side.**

> **Context on Code Quality (via HackerNews):** The HackerNews discussion included valid critiques regarding the code quality in this specific Python project example (e.g., logger configuration, custom config parsing, potential race conditions). It's a fair point, especially given I'm not a Python expert. For this particular green-field project, my primary goal was rapid prototyping and achieving a *working solution* in an *unfamiliar stack*, prioritizing the functional outcome over idiomatic code perfection or optimizing for long-term maintainability in this specific instance. It served as an experiment to see how far AI could bridge a knowledge gap. In brown-field projects within my areas of expertise, or projects demanding higher long-term maintainability, the human review, refinement, and testing process (using the guardrails discussed later) is necessarily much more rigorous. The critiques highlight the crucial role of experienced oversight in evaluating and refining AI-generated code to meet specific quality standards.

This is especially noteworthy because I don't actually know Python. Yes, with 25+ years of software development experience, I could probably write a few lines of working Python code if pressed — but I don't truly *know* the language. I lack the muscle memory and intimate knowledge of its conventions and best practices.

However, my broad understanding of software architecture, engineering best practices, system operations, and what makes for excellent software projects made this development process remarkably smooth.

## Example 2: Process Management UI Integration

While I can't share the source code for this brown-field example, it demonstrates a different yet equally valuable use case:

I had a legacy PHP/Symfony application with a "backend-only" process coordination feature — think service classes, enums, Doctrine entities, and CLI commands running via cron. While functional, it lacked a user interface.

Though not strictly necessary, having a web-based view of this process coordination feature would be valuable — allowing users to monitor current operations, investigate failures, and manage process execution.

For strategic reasons, I wanted this UI to live in our newer application — the one with the better-designed codebase, more recent framework versions, improved testing capabilities, and superior frontend architecture with a comprehensive living styleguide.

The task involved:

- Integrating the legacy and new applications via HTTP API
- Implementing data transfer between systems
- Creating an intuitive UI that aligned with our design system
- Building a generalized API client in our shared Symfony bundle

**Once again, the AI agent implemented this entire feature without requiring me to write any code** — with the exception of *keyframe files*, as we will see — **manually.**

## Key Insights from Both Projects

These examples highlight two distinct advantages of AI assistance:
1. In the green-field project, I could create a functional application despite unfamiliarity with the tech stack (though, as noted, expert review would be needed for production-grade quality).
2. In the brown-field project, I achieved results much faster — particularly valuable since UI development isn't my strong suit.

This was when terms like "game-changing" started to feel appropriate, and I began to recognize this technology's significance for both personal and team productivity.

> **Productivity Nuances:** While the speed increase can feel dramatic ("10x" is often cited), real-world productivity gains vary significantly based on the task complexity, the quality of requirements, the maturity of the AI model, and the developer's skill in guiding and correcting the AI. As the HackerNews discussion touched upon, the biggest gains might be in overcoming initial hurdles or handling boilerplate, while complex logic or large-scale refactoring still requires significant human oversight and iterative refinement. Achieving consistent high productivity often involves learning how to interact effectively with the specific AI tool and prompt it iteratively.

# The Keys to Successful AI Collaboration

Let's examine the techniques I employ to ensure productive AI coding sessions that consistently deliver successful results.

## The Investment-Return Principle

As mentioned earlier, achieving significant time savings with AI requires some upfront investment. This parallels managing talented but junior developers — you can't simply tell them to "build X" and expect optimal results. You need to invest time in setting them up for success.

## Well-Structured Requirements

The foundation of any successful AI coding session is a comprehensive requirements document. For the Platform Problem Monitoring project, I created this document before starting: [REQUIREMENTS.md](https://github.com/dx-tooling/platform-problem-monitoring-core/blob/main/docs/REQUIREMENTS.md).

At 371 lines, it's substantial, but more importantly, it follows a clear hierarchical structure:

- *Top-level: Core requirements in one line*
- *High-level: Use case and motivation*
- *Mid-level: Process and work mechanisms*
- *Mid-level: Architecture, tech stack, and constraints*
- *Low-level: Detailed process steps*

The low-level section breaks down the application's operation into 12 distinct steps, each with clearly defined inputs, outputs, and side effects.

Just as this structure guides human developers effectively, it provides the AI assistant with the framework it needs to deliver solid results.

You might think creating such documentation is excessive work. You're right — it is. But it's a necessary investment for a successful outcome.

One of my favorite software development maxims is:
<br>***"Six weeks of implementation easily save you two hours of planning"***

The sarcasm highlights an essential truth: the implementation phase is the most expensive place to compensate for inadequate planning.

I always encourage my team to start at the whiteboard with their product manager, not at the keyboard. This principle applies equally well to AI collaboration.

### The "Play It Back" Technique

A particularly effective practice with AI is what I call "play it back": I start each session in "Ask" mode, requesting the AI to:

1. Summarize the requirements in its own words
2. Create an action plan
3. Ask clarifying questions

Only after this validation do I switch to "Agent" mode and begin implementation.

## Tool-Based Guard Rails

While requirements define the destination, tool-based guard rails ensure we take the most direct route there.

Consider how we value real-time feedback systems in development. Nothing is worse than discovering a missing null check through a customer service complaint weeks after launch.

Static analysis tools that catch issues during development are invaluable — and they're just as valuable for AI agents.

This is why I prioritize setting up comprehensive quality tools before starting AI sessions. The [Makefile](https://github.com/dx-tooling/platform-problem-monitoring-core/blob/main/Makefile) for our Python project demonstrates this approach:

- Code formatting with black and isort
- Linting with ruff
- Type checking with mypy
- Security analysis with bandit
- Comprehensive test suite

The AI understands these tools and uses them effectively. When a change breaks type checking, it automatically adjusts its implementation to maintain compliance.

I also ensure the AI can validate the functional aspects of its work. For API implementations, I provide curl commands so it can test its endpoints directly. Watching the AI use and refine its own code is remarkable.

## File-Based Keyframing

While AI agents excel at creative problem-solving, sometimes we need to constrain that creativity, especially regarding code organization. This is where file-based keyframing comes in.

The technique borrows from animation studios' workflow, where master animators create key frames — crucial moments in an animation sequence — while junior animators fill in the intermediate frames. This approach maintains quality while optimizing resource usage.

{{< figure src="/images/2025-03-31-how-seasoned-developers-can-achieve-great-results-with-ai-coding-agents/keyframing_animation.jpg" alt="Platform Problem Monitoring Email Report" >}}
<sub>Through keyframes, the master animator can ensure a certain style and the occurence of specific animation steps, without the need to create the full animation herself.</sub>


### Practical Application

When working with AI, I create "empty hull" files in the codebase before editing begins. For example, in our brown-field project, the AI needed to implement various components:

- an API endpoint
- an API client
- a Controller class
- a Twig template

and so on.

Instead of letting the AI decide file locations and names, or specifying these details in prompts, I create minimal stub files:

```php
<?php

declare(strict_types=1);

namespace App\HighVolumeProcessManagement\Presentation\Service;

readonly class HighVolumeProcessManagementPresentationService
{

}
```

For controllers, I might include a small amount of essential details like the route name:

```php
<?php

declare(strict_types=1);

namespace App\HighVolumeProcessManagement\Presentation\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class HighVolumeProcessManagementController extends AbstractController
{
    #[Route(
        '/volumen-prozesse/übersicht',
        name: 'high_volume_process_management.presentation.controller.show_dashboard',
        methods: ['GET']
    )]
    public function showDashboardAction(): Response
    {

    }
}
```

These stubs might seem minimal, but they're incredibly effective. They provide the AI with crucial context about:

- File organization
- Namespace structure
- Naming conventions
- Code patterns

This approach highlights another timeless practice that remains vital in the age of AI: Naming things.

Because after all, the AI models at the heart of tools like Cursor are Large-Language Models — they work on text, and text with meaning and intention is crucial for a great coding experience.

> **AI Commenting and Structure:** Providing clear structure via keyframing can also help guide the AI's organization and sometimes mitigate its tendency towards overly verbose or obvious comments – a point also raised in the HackerNews discussion. However, manual review and cleanup of comments often remain necessary to ensure they add real value rather than noise.

# Putting It All Together: A Real-World Example

To demonstrate how these principles work together in practice, let me share a recent project where I applied all three key techniques: well-structured requirements, tool-based guard rails, and file-based keyframing.

## The Challenge

The task was similar to our earlier brown-field example: implementing a UI Dashboard to display subscription contract information from our platform. Here's what made this project interesting:

- **Existing Backend**: We had a working backend implementation storing all the contract data
- **Separate Frontend**: The UI needed to live in a different application
- **Distributed Architecture**: The solution required an HTTP API integration between applications
- **Shared Components**: Parts of the implementation belonged in a shared library

## The Initial Prompt

Below is the actual prompt I used to kickstart this project. As you read through it, notice how it incorporates our three key principles of **well-strcutured requirements**, **tool-based guard rails**, and **file-based keyframing**:


> I need you to implement a read-only web-based user interface that will present some existing db-persisted data in form of a table-like overview.
>
> The data in question is called "contracts", it's about some subscription contract information that we hold in our platform.
>
> The feature needs to be implemented within a monorepo that contains multiple codebases. For the feature in question, four codebases play a role:
>
> - A Symfony 5 application in "backend-app"
>
> - A Symfony 7 application in "janus-christophorus"
>
> - A Symfony bundle used by "janus-christophorus", in folder "janus-shared-bundle"
>
> - Another Symfony bundle used by "janus-christophorus", in folder "janus-webui-bundle"
>
> The roles of the codebases are as follows:
>
> - backend-app currently holds the data in question, but does not provide a ui to present the data
>
> - janus-christophorus is meant to provide the UI that will present the data
>
> - janus-shared-bundle hosts, among other things, the API client implementations for API endpoints provided by backend-app; janus-christophorus makes use of these clients to pull data from backend-app
>
> - janus-webui-bundle contains the tailwind setup, css, and Twig templates for the Living Styleguide that applied to the UIs of janus-christophorus.
>
> Your mission now is to:
>
> - implement the required API endpoints in backend-app that will provide the data to be displayed on the web UI in janus-christophorus; this API will also support the "demo mode" capability of the integration API, which requires a demo data service in the test harness layer of the backend-app implementation to provide fake data if the API client requests it
>
> - implement a matching API client that can be used to read from these new API endpoints
>
> - implement a Presentation layer service class in janus-christophorus that will make use of the new API client
>
> - implement a Presentation layer Controller and Twig template that makes use of the Presentation service to display the information gathered through the API integration
>
> To prepare this implementation, I have created some "empty hull" files within the different code bases.
>
> Consider the provided contract, user, and jobofferer profile entities to determine what data you need to pull from the MariaDB database (or fake through the demo service) to provide useful information on the API for the UI.
>
> Additionally, I'm providing additional files like those from the styleguide, the ui navigation service, and so on. Also consider the files from other, existing features I have provided as a guideline and inspiration.
>
> The goal of the feature is to provide a UI that allows to quickly gather an overview of the available contracts in the system.
>
> Important note: You can and should use several tools to check your own work.
>
> Each codebase allows you to run the quality tools, which contain PHPStan checks and others. You run them like this:
>
> cd ~/Projects/website/backend-app && /usr/bin/env bash .dxcli/dxcli.sh quality
>
> cd ~/Projects/website/janus-shared-bundle && /usr/bin/env bash .dxcli/dxcli.sh quality
>
> cd ~/Projects/website/janus-christophorus && /usr/bin/env bash .dxcli/dxcli.sh quality
>
> You can request the API endpoint that you will implement like this:
>
> curl -H "Accept: application/json" -H "Content-Type: application/json" "http://127.0.0.1/_/janus-integration-api/membership/contracts/"
>
> You can request the web UI you will implement like this:
>
> curl http://127.0.0.1/_jc/mitgliedschaftsverwaltung/verträge/
>
> Please create an implementation plan and ask any questions that you need to have answered for your mission.
>
> @Contract.php @User.php @Profile.php @JoboffererProfile.php @MembershipContractsApiController.php @DemoDataService.php @AbstractJanusIntegrationApiController.php @MainNavigationPresentationService.php @ContractsDashboardController.php @contracts_list.html.twig @ContractsDashboardPresentationService.php @services.yaml @AbstractBackendAppApiClient.php @BackendAppMembershipContractsApiClient.php @ContractApiDto.php @BackendAppMembershipContractsApiClientInterface.php @ContractsApiDto.php @NothingApiDto.php @janus-webui.css @living_styleguide.html.twig


# Conclusion

The examples and techniques shared here demonstrate that AI coding assistants, when properly guided, can dramatically enhance development productivity. The key to success lies in applying traditional software engineering best practices to this new technology.

By providing well-structured requirements, implementing appropriate guardrails, and using file-based keyframing, we can harness the power of AI while maintaining code quality and architectural integrity. These time-tested practices, and more than anything else, **hard-earned human experience with these practices**, are more valuable than ever in the age of AI-assisted development, and far from obsolete.
