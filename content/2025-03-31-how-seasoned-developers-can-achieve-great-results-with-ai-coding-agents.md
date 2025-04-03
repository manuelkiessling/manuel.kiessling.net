---
date: 2025-03-09T00:00:01+02:03
lastmod: 2025-03-09T00:00:01+02:03
title: "How seasoned developers can achieve great results with AI coding agents"
description: "The tools and practices that have supported tech leads and senior programmers in the past are precisely the things that enable successful AI coding sessions."
authors: ["manuelkiessling"]
slug: 2025/03/31/how-seasoned-developers-can-achieve-great-results-with-ai-coding-agents
lang: en
---

# Introduction

For the past few months, I have been experimenting with AI-powered coding tools, in the context of my personal as well as my professional projects — and so far, it has been an overwhelmingly positive experience, for me personally and for my team of software engineers at work.

We have been able to achieve more results in less time, and results of better quality in no small amount of cases.

This experience is in contrast to the feedback I'm getting from at least some other fellow software developers, who report that it's not really working out for them.

At this point, I'm convinced that AI-assisted software-development is a practice that has the potential to bring our craft to the next level in terms of productivity. This is why I believe that we as a community should not miss out on it, and adapt it rather sooner than later — but like all practices and tools, with the right sense of proportion and with a cool head.

Moving the needle a few more micrometers, with regards to adaptation in the broader software development community, is the motivation for me to write about my experiences and the best practices I have identified for myself.

# Vibe Coding?

Judging from my Twitter feed, AI-powered coding tools are already all the hype in a specific niche, where people that are not software developers by profession, are having a great load of fun building software products. So for them these new tools are first and foremost a general enabler, allowing them to do things they probably wouldn't even have considered doing without the availability of said tools.

Honestly, more power to them — it's fun to see their struggles and their breakthroughs, and I'm wishing them all the best.

But this is not a crowd I can relate to very much, and it's definitely not the only crowd for which these new tools can and should matter a great deal.

My as-of-now conclusion, as preliminary as it might be in this fast-moving area, is that not only can seasoned and experienced software developers *also* benefit from the new technology — instead, I'm convinced that it is *especially* the cohort of senior software engineers and tech leads that are in the optimal position to harness the power these tools can provide.


**Because interestingly enough, the experience and accumulated know-how on software engineering and project management best practices — which only *seem* to be no longer required thanks to AI — are precisely what turn out to be the key to using AI tooling in the most effective way possible.**


Here is why I think this is the case.

While I have not yet found the perfect metaphor for my mental model of what these LLM-based programming agents actually ARE in an AI-assisted coding setup, for now I'm going with "an absolute senior when it comes to programming knowledge, and an absolute junior when it comes to being a co-worker".

From this follows that **it does take *some* amount of work to make them save you a *huge* amount of work**.

And no one is better positioned to put in the right amount of work in the right way, than a senior software engineer.

That's because as we will see, although we are talking about some fancy new esoteric technology, it's the old-school, battle-tested, veteran practices and tools that enable us to wield the new magic in the best way.


I have identified the following key areas of expertise that need to be brought to the table when working in an AI-assisted coding setup:

- **Well-structured Requirements**
- **Tool-based Guard Rails**
- **File-based Keyframing**

Before explaining these in detail, let me first describe the kind of projects I have done so far, and to what degree I have use AI in each.

I will give examples for two categories of projects: green-field and brown-field.

For both categories, I will concentrate on those cases where the AI did every single line of implementation, or very nearly so.

While I do sometimes use AI as a "better autocomplete", or as a chat-only companion for some general discussion, this article focuses on the "real deal", where AI tooling is used in an agentic mode and does all of the heavy lifting.

The product that works well for me in these kinds of projects is [Cursor](https://www.cursor.com/), with the Anthrophic Claude Sonnet 3.7 model. For the best developer experience, I do not want to manually copy-and-paste generated code into my codebase, and need the AI assistent to execute commands on my local command line. Cursor does just that, and I assume that products with a similar approach will yield similar results.

Such a product, paired with the areas of expertise I will talk about, allows to create and fully implement a green-field software application like the one that shall act as my first example: *Platform Problem Monitoring*. Its source code is available at https://github.com/dx-tooling/platform-problem-monitoring-core.

What this application does is every hour, it connects to the Elasticsearch server from our ELK stack, reads the latest error messages, and sends us a nice-looking email that hopefully gives us an idea on how grave or relaxed the problems situation on our web platform is right now:

[{{< figure src="/images/2025-03-09-new-project-platform-problem-monitoring-sample-mail-report.png" alt="Platform Problem Monitoring Email Report" >}}](/images/2025-03-09-new-project-platform-problem-monitoring-sample-mail-report.png)

Head over to the ["New project: Platform Problem Monitoring"](../../../../2025/03/09/new-project-plaform-problem-monitoring/) post if you want to learn more.

**The source code of this application was written by Cursor/Claude, and Cursor/Claude only.**

I know this for sure because as it happens, I don't actually know any Python myself.

Okay, to be honest, I'm writing software for a living for more than 25 years now, so if you held a gun to my head I would probably be able to produce half a dozen lines of coherent Python code that might even run — but, you know, I do not *know* Python for real. No muscle memory, no intimate knowledge of the do's and dont's, et cetera.

However, I do know a good deal *in general* about software architecture, engineering best practices, how computers and networks and operating systems work, what makes a great software project great, and so on, which is why building, or rather having this project build for me, was a breeze.

I cannot provide open source code for a brown-field project example, but it generally went like this:

A legacy PHP/Symfony application code base of mine already had some "backend-only" implementation of a certain process coordination feature: imagine some service classes, some enums, a handful of Doctrine entities, a CLI command or two to put operations in motion via cron — the usual stuff.

What I didn't have at this point was some kind of user interface for this feature. It wasn't strictly needed for the feature to work, but wouldn't it be nice to have a web-based view on what this process coordination feature was currently doing, being able to see if any processed had failed any why, and maybe be able to abort or restart processes?

However, for some strategic reasons that are not relevant here, I didn't want this UI to live in the same application as the feature's backend implementation — instead, I wanted to provide it through our new and shiny application, the one with the much better designed codebase, the more recent framework and libraries versions, the improved testing capabilities, and most importantly, the one with the much better living styleguide and frontend architecture.

And thus, the mission was to integrate the legacy and the new application through some kind of HTTP API, shuffle the data in question back and forth as needed, and render some nice UI that provides useful information in a useful way, while fitting in with the application's general style. Bonus points: the client for the new API had to be implemented in a generalized way in one of our new Symfony bundles that we use to share functionality between our different applications, and then be used from within the new application.

**This, too, was 100% implemented by the AI agent, without me touching a single line of code.**

These two examples also show two different advantages of using an AI assistant: In the green-field example, I was able to create an application *at all* even though I wasn't familiar with the chosen tech stack, and in the brown-field example, I was able to create a solution *much faster* — mainly because I suck at web design, and building a nice UI would have taken me hours or even days, whereas with Cursor and Claude, I got to the finish line in under 15 minutes.

This was also the point where vocabulary like "game-changing" started to enter my mind for the first time, and I started to realize that this new technology will quickly become important for my personal productivity and that of my team.

Alright, with this out of the way, let's do a deep dive on the techniques I employ to end up with a productive AI coding session that leads to a successful end result.


I've mentioned earlier that you do need to put in some clearly non-zero amount of effort, in order to ensure that you need to put in a lot *less* effort to get to the desired end result.

Again, this is very much related to managing bright, but very junior, co-workers. You can't just send them off with "well now do your work and build me X" — you need to invest some time and work to put them on the right track.

And thus, what you need at the beginning of any AI coding session, are **well-structured requirements**.

Here is the requirements document I produced before firing up Cursor, and which became the central asset for creating Platform Problem Monitoring: [REQUIREMENTS.md](https://github.com/dx-tooling/platform-problem-monitoring-core/blob/main/docs/REQUIREMENTS.md).

I won't bore you with everything that's in it, but note that it clocks in at 371 lines.

Furthermore, it has a very strict and clear structure:

- *Top-level: The requirements in one line*
- *High-level: Use-case and motivation, raison d'etre*
- *Mid-level: Process and work mechanisms*
- *Mid-level: General architecture, tech stack, technological contraints*
- *Low-level: the process in detail*

and so on. In the low-level part, I lay out a 12-step process that the application needs to go through on each run, detailing all inputs,  outputs and side effects of each step.

If in the meat space, you have a disciplined and, well, obedient bright junior developer, this is a good basis to guarantee a solid end result. And with a *very* bright and *really* obedient AI assistant, it's just the same.

You might argue that preparing such a document is a lot of work. I can assure you, it is. But that's your job if you want to lay the foundation for a successful outcome.

One of my favorite sayings in software product development is that
<br>***"six weeks of implementation easily save you two hours of planning"***.

Behind the sarcasm is the important insight that the implementation phase is a very expensive place to make up for a half-assed concept.

When working with my team, I always try to instill the sense that the first place you should go to as a software developer is not the keyboard and the IDE, but a whiteboard and marker. Preferably together with the product manager that ordered you to build something for them.

And additionally, the good old "play it back to me" works beautifully with AI: I always start the session in "Ask" mode, and ask it to summarize the requirements in its own words, and to write an action plan for itself, and also, to ask me anything that is not yet clear from its point of view. Only then, I switch to "Agent" mode and let it roll.

Nevertheless, the requirements only define the destination; it's the **tool-based guard rails** that ensure the road to the destination is a straight line, not a serpentine.

Think about it: We all love precise, realtime feedback systems. Nothing worse than a user who weeks after launch tells customer service how some functionality isn't working, and it turns out to be a missing null check.

How much better to have a static analyzer that tells you in seconds, while you are still building.

That is just as true for the AI agent. And this is why setting up as many useful Quality Tools as possible is front and center when I start my AI sessions.

Just look at the [Makefile](https://github.com/dx-tooling/platform-problem-monitoring-core/blob/main/Makefile) for the Python green-field project: Code formatting with black and isort. Linting with ruff. Type-checks with mypy. Security checks with bandit. And of course software tests.

The AI agent knows about all these tools, and is happy to put them to use. A certain well-meaning change suddenly breaks the type-checks? No problem, the AI recognizes this and will fix its own implementation.

I also make sure to make the results of the agent's work accessible and visible for it wherever possible. In the brown-field project, it had to implement an API — I explained how to request its endpoints with *curl*; seeing the AI use its own creation through an HTTP client and adapting its implementation where needed feels nothing short of magic.

And finally, while an AI agent has the intelligence and creativity to come up with myriads of ways to solve a given problem, I really don't want it to get too creative with certain aspects, especially with regards to how it structures a solution across multiple files.

This is why I employ a technique that could be described as **"file-based keyframing"**, as it emulates an approach that is used in analogue and digital animation. At it's core, it's an approach that allows studios like Disney to work more efficiently at a high-quality level, even though master animators are a finite resource.

Instead of having the few master animators on a project draw every single frame of an animation sequence, these high-profile workers only draw so-called *key frames*, that is, the most relevant start, middle, and end frames of a sequence, like this:

{{< figure src="/images/2025-03-31-how-seasoned-developers-can-achieve-great-results-with-ai-coding-agents/keyframing_animation.jpg" alt="Example drawing with animation sequence keyframes" >}}

With this, the master animator sets clear boundaries: this is how the character must look like when he attempts to jump, when he is in mid-air, and when he is back on the ground.

This can then be given to one of the many junior or assistant animators who are then able to create the many in-between frames required for a smooth animation. This approach ensures the target style intended by the master animators without requiring the master animators to put in all the required time and effort themselves.

When working with an AI assistant, I do something similar before letting it edit any files: I create "empty hulls" within the codebase and add these to the chat context.

Let's take the brown-field project as an example. The AI will need to implement an API endpoint, an API client, a Controller, a Twig template, and so on.

Instead of either letting the AI guess how to name the files for these and where to put it, nor meticulously feeding it the preferred names and locations of these files in the text prompt, I simply create these files, but keep them mostly empty, like this:

```php
<?php

declare(strict_types=1);

namespace App\HighVolumeProcessManagement\Presentation\Service;

readonly class HighVolumeProcessManagementPresentationService
{

}
```

I might put in some details that are important for me, like Controller routes:

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

This might not seem like much, but don't underestimate how useful this is. The AI picks up these implicit clues very well, and stays on track much better. That's because these "file keyframes" provide a great mix of contraints ("the controller goes here, not there") and implicit context: The namespace structure, class and method names and naming patterns — all of this is valuable food for an AI system that at the end of the day is a large language model, and therefore loves to work with text.

This highlights another important practice from ages past that is very relevant in this world of shiny new tools: Good naming matters. A lot.


Let's wrap things up with the full initial prompt I recently used to build a feature that is very similar in nature to the brown-field process management UI mentioned earlier — I needed the AI to build a UI Dashboard with information on the subscription contracts that our platform sells.

The context and architectural approach is very similar to what I've described earlier: a backend implementation with the relevant data already exists, but needs to be presented on the web UI of another application, therefore an HTTP API integration between both applications is needed, while parts of the implementation needs to take place in a library codebase.

Here is the full prompt — look out for **well-structured requirements**, **tool-based guard rails**, and **file-based keyframing**:


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
