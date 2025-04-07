---
date: 2025-04-03T00:00:01+02:03
lastmod: 2025-04-03T00:00:01+02:03
title: "Senior Developer Skills in the AI Age: Leveraging Experience for Better Results"
description: "How time-tested software engineering practices amplify the effectiveness of AI coding assistants."
authors: ["manuelkiessling"]
slug: 2025/03/31/how-seasoned-developers-can-achieve-great-results-with-ai-coding-agents
lang: en
---

# Abstract

Embedded into powerful IDEs like Cursor, large-language models are now able to act as effective Coding Assistants that can significantly enhance the output and abilities of professional software engineering teams.

However, ending up with the desired functional and non-functional results, as well as an acceptable code quality, is not something that will take care of itself.

**Together with my team at work, I have encountered worthwhile use cases where Coding Assistants shine, and identified practices and approaches that help significantly with reaching the intended outcomes at a sufficient quality level.**

It turns out that senior software engineers are in the perfect position to ensure success with Coding Assistants, because the very experience and accumulated know-how in software engineering and project management best practices — which only *seem* obsolete in the age of AI — are precisely what enable the most effective use of these tools.

The following article describes well-suited real-life Coding Assistant use cases, and explains in detail the supporting practices that result in successful AI coding sessions.


# Introduction

Over the past few months, I have introduced [Cursor](https://www.cursor.com), an AI-powered IDE based on Visual Studio Code, into my team of software engineers at Joboo.

Cursor wraps cutting-edge large-language models (like Anthropic's Claude Sonnet 3.7, Google's Gemini 2.5, and OpenAI's GPT 4o), and, crucially, integrates them into the IDE mechanics in a far-reaching manner.

This integration allows these models to not only "see" whole codebases, but to also act on them, making multi-file-edits and even command-line tool execution possible.

The breadth and depth of said integration puts the AI models into the position to act as full-fledged Coding Assistants within the team.

This means that for the first time it is possible for my team and me to have the AI implement large parts of features, and sometimes even complete features, on its own.

While this has already shown huge productivity boosts in multiple cases, we still maintain the responsibility to ensure that the resulting implementation is functionally correct, that important non-functional requirements are met, and that the overall code quality is as good or better as what we would create and release ourselves.

Guiding the Coding Assistant towards satisfactory outcomes is of ever-growing importance in our daily work.

So far, I've identified three critical measures that are required to work successfully in an AI-assisted coding setup:

- **Well-structured Requirements**
- **Tool-based Guard Rails**
- **File-based Keyframing**

In the following, I will explain what's behind each of these measures, and illustrate how we put these to use, based on real-world examples from our daily work.


# The insights that inform the measures

While I have not yet found the perfect metaphor for these LLM-based programming agents in an AI-assisted coding setup, I currently use a mental model where I think of them as "an absolute senior when it comes to programming knowledge, but an absolute junior when it comes to architectural oversight *in your specific context*."

From this follows that **it takes *some* strategic effort if you want them to save you a *tremendous* amount of work**.

And my thesis is that there's no-one better to invest that effort in the right way than a senior software engineer.

Because as we'll see, while we're clearly dealing with new, cutting-edge technology, it's the time-tested, traditional practices and tools that enable us to wield this new capability most effectively.

This starts by realizing that, as all-powerful as AI models may seem, their power needs to be **directed** in order to be **effective** — instead of just overwhelming.

That's because a key insight from software engineering takes center-stage in any AI-supported workflow:

**"Six weeks of implementation can easily save two hours of planning".**

The sarcasm highlights an essential truth: the implementation phase is the most expensive place to compensate for inadequate planning.

This problem is aggravated with AI, because an AI can do (nearly) *anything*. But we need it to do *our thing*.

Therefore, all three measures — **Well-structured Requirements**, **Tool-based Guard Rails**, and **File-based Keyframing** — are ultimately measures of containment.


# Measure 1:<br>Well-structured Requirements

The foundation of any successful AI coding session is a precise and complete set of requirements.

As an example, let's look at part of a real-world Cursor prompt that I created some days ago:

> I need you to implement a read-only web-based user interface that will present already-existing db-persisted data in form of a table-like overview.
>
> The data in question comes from a Doctrine entity called "Contract" plus some related entities, and is concerned with subscription contract information that we store within our platform.
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
> - "backend-app" currently owns the data in question, but does not provide a UI to present that data
>
> - "janus-christophorus" is meant to provide a new UI that will present the contract data
>
> - "janus-shared-bundle" hosts, among other things, the API client implementations for API endpoints provided by "backend-app"; janus-christophorus need to make use of these clients to pull data from "backend-app"
>
> - "janus-webui-bundle" contains the tailwind setup, css, and Twig templates for the Living Styleguide that applies to all UIs of "janus-christophorus".
>
> Your mission now is to:
>
> - implement the required API endpoints in "backend-app" that will provide the data to be displayed on the web UI of "janus-christophorus"; this API will also support the "demo mode" capability of the integration API, which requires a demo data service in the test harness layer of the "backend-app" implementation to provide fake data if the API client requests it
>
> - implement a matching API client that can be used to read from these new API endpoints, in "janus-shared-bundle"
>
> - implement a Presentation layer service class in "janus-christophorus" that will make use of this new API client
>
> - implement a Presentation layer Controller and Twig template that make use of this new Presentation service, to display the information gathered through the API integration in "janus-shared-bundle" and "backend-app"
>
> Consider the provided contract, user, and jobofferer profile entities to determine what data you need to pull from the MariaDB database (or fake through the demo service) to provide useful information on the API for the UI.
>
> The goal of the feature is to provide a UI that allows to quickly gather an overview of the available contracts in the system.

Note how this explains a lot of context relevant to the task, and how it implicitly sets some constraints on how and where different parts of the feature need to be implemented.

Also note what's *not* described; I don't go into much detail as to *what* data exactly needs to be displayed, and *how* exactly it needs to be displayed.

From my experience, this works well as a starting point in cases like these: It's safe to assume that any cutting-edge large-language model has "seen" myriads of "presentations of subscription contract data on a web UI" during its training, so combining the general notion of "I need this data to be presented in a table-like overview" with "here is our official style guide" usually results in a visually and information-wise very good first user interface.

There is also a good deal of *implicit* requirements and constraints that I feed into the Cursor prompt at the start of a new coding session: by adding existing files with implementations of a similar nature as the feature that needs to be created, and mentioning these to Cursor as "sources of inspiration (if needed)" —  this then sets the tone for the way that the underlying AI will approach a new implementation:

> I'm also providing additional files like those from the styleguide, the UI navigation management service, and so on. Also consider the files from other, existing features I have provided as a guideline and inspiration.

Good naming and namespace structures in existing "inspiration" files are a great guide, too.

For example, in our codebases an existing feature might be structured like this:

    SomeFeature
        Api
            Dto
            Controller
        Domain
            Entity
            Enum
            Service
        Presentation
            Controller
            Service
            Resources
                templates
        Infrastructure
            Command
            Client

Just as an (attentive) human junior developer might go "well this surely tells me a bit about how to name and structure new stuff", the AI will happily follow these patterns, too.

This, together with class, method, and variable names that tend to be on the long-ish, but also very descriptive side, helps to create a fair amount of "implicit" guidance.


# Measure 2:<br>Tool-based Guard Rails

While requirements define the destination, tool-based guard rails ensure we take the most direct route towards that destination.

Consider how we value real-time feedback systems in development. Nothing worse than discovering a missing null check through a customer service complaint weeks after launch.

Quality Tools like static analysis utilities, linters, and software tests that catch issues during development are invaluable — for AI agents just as much as humans.

With deep AI integrations like that found in Cursor, the AI understands these tools and uses them effectively. When, for example, a code change breaks static type checks, it automatically adjusts its implementation to maintain compliance.

I also ensure the AI can validate the functional aspects of its work. For API implementations, I provide curl commands so it can test its endpoints directly.

Watching the AI subsequently "use" and refine its own implementation is still a remarkable sight. Here is a small example from a Cursor session in "Agent" mode, where the AI already fixed some of the PHPStan violations it created, and continues working on the remaining ones:

[{{< figure src="/images/2025-03-31-how-seasoned-developers-can-achieve-great-results-with-ai-coding-agents/screenshot_phpstan_error_fixes.jpg" alt="Screenshot that shows how Cursors fixes its own mistakes thanks to tool-based guard rails" >}}](/images/2025-03-31-how-seasoned-developers-can-achieve-great-results-with-ai-coding-agents/screenshot_phpstan_error_fixes.jpg)

In a Cursor prompt, equipping the AI with tool-based guard rails might look like this:<br>

> As explained, the opened project (at ~/projects/website) hosts several PHP/Symfony applications. I want you to regularly use the quality tools and test run commands listed below to check all affected applications for conformity and correctness, and fix any outstanding issues.
>
> Here are the commands available to you in the different application codebases:
>
> `cd ~/projects/website/backend-app && make quality`<br>
> `cd ~/projects/website/backend-app && make tests:unit:only`
>
> `cd ~/projects/website/janus-christophorus && make quality`<br>
> `cd ~/projects/website/janus-christophorus && make tests`
>
> `cd ~/projects/website/janus-shared-bundle && make quality`<br>
> `cd ~/projects/website/janus-shared-bundle && make tests`
>
> `cd ~/projects/website/janus-webui-bundle && make quality`<br>
> `cd ~/projects/website/janus-webui-bundle && make tests`
>
> Additionally, when implementing the API endpoint in backend-app at route GET /membership/contracts/, you can at any time request this endpoint locally:
>
> `curl http://127.0.0.1/integration-api/membership/contracts/`
>
> If you want to receive demo data from the endpoint, use
>
> `curl -H "X-DEMO-MODE: true" http://127.0.0.1/integration-api/membership/contracts/`

And just as an existing codebase might provide implicit requirements, the chosen tech stack can provide implicit guard rails, too: for example, programming languages with a strong type system offer a lot less opportunities for the Coding Assistant to run astray.

# Measure 3:<br>File-based Keyframing

As said, AI agents excel at creative problem-solving, but we need to constrain that creativity, especially regarding code organization — right now, I basically never let Cursor create files on its own. This is where file-based keyframing comes in.

The technique borrows from animation studios' workflow, where master animators create key frames — crucial moments in an animation sequence — while junior animators fill in the intermediate frames. This approach maintains quality while optimizing resource usage.

{{< figure src="/images/2025-03-31-how-seasoned-developers-can-achieve-great-results-with-ai-coding-agents/keyframing_animation.jpg" alt="Key Framing in Animation" >}}

In the same spirit, when working with AI, I create "empty hull" files in the codebase before AI coding begins. Looking at our our sample task, the AI needs to implement various components, for example:

- an API endpoint
- an API client
- a UI Controller class
- a UI Twig template

and so on.

Instead of letting the AI decide on file locations and names, or specifying these details in the prompt, I simply create some minimal stub files for these, like this:

```php
<?php

declare(strict_types=1);

namespace App\MembershipAdministration\Presentation\Service;

readonly class MembershipAdministrationPresentationService
{

}
```

For controllers, I might include a small amount of essential details like the route and method name:

```php
<?php

declare(strict_types=1);

namespace App\MembershipAdministration\Presentation\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ContractsOverviewController extends AbstractController
{
    #[Route(
        '/membership-administration/contracts/',
        name: 'membership_administration.presentation.controller.show_contracts',
        methods: ['GET']
    )]
    public function showContractsAction(): Response
    {

    }
}
```

These stubs might not seem like much, but they're incredibly powerful. They again provide the AI with crucial context about:

- File organization
- Namespace structure
- Naming conventions
- Code patterns

And there *is* quite some amount of implicit information here which, from my experience, the AI always eagerly picks up on:

- Yes, there is a dedicated Presentation Service, so obviously, we will not put too much logic into the controller.
- Controller methods that handle HTTP requests obviously end with "Action".
- The namespace for the feature is "Membership*Administration*", so obviously, the web UI is not for end users, but for power users that need to digest and handle a lot of information.
- PHP Attributes, and not Annotations, are obviously preferred.

Always remember: after all, the AI models at the heart of tools like Cursor are large-*language* models — they work on **text**, and text with *meaning* and *intention* is crucial for a great coding experience.

In the prompt, I sometimes don't even mention the stub files, I simply add them to the context, and the AI takes the hint. If I want to make sure that the AI really honors them, I might at most add a line like this:

> To prepare this implementation, I have created some near-empty "stub" files within the different code bases.


# So how well does it work in practice?

With the three measures in place, we were able to have complete features built by Cursors, without the need to write code ourselves.

The case demonstrated so far is an especially fruitful example: Bringing together an existing backend implementation and our Living Styleguide in the Cursor prompt context allows the AI to quickly realize a professional-looking user interface for features that until then had a backend-only implementation, even if it means that the AI needs to also implement an API-based data integration across multiple application codebases.

This has in extreme cases provided us with useful new frontends within minutes, where manual labor would have meant at least multiple hours of implementation work.

Here is a screenshot of the final contracts overview feature as it is used today (showing demo data):

{{< figure src="/images/2025-03-31-how-seasoned-developers-can-achieve-great-results-with-ai-coding-agents/screenshot_contract_management.jpg" alt="Screenshot of contract management feature" >}}

As you can see, it also provides a "search" feature that was not included in the initial prompt.

This was added in another round, and in terms of workflow experience, it's really easy to build on top of a first working implementation: Adding the search feature was literally just another *"Now add a search box at the top of the page that allows to filter for all contracts matching a certain contract id, customer id, or email address"* prompt, and about 60 seconds later, this was fully implemented front-to-back, from the new UI section through the controller layer, the API client, and the API endpoint — and worked out-of-the-box.

As "filtering a given list of things based on the input in a search box" is such a well-known, widely-used concept, the AI doesn't need to be spoon-fed with a bunch of low-level details — if the right implementation is obvious, the AI will do the obvious thing.


# A special case:<br>Green-field projects in an unknown tech stack

Using AI tools like Cursor also enables us to approach implementations outside of our comfort zone, for example in the context of tech stacks that are not within our area of expertisse — where a prohibitive cost-benefit ratio would normally result in no implementation at all.

One such example is *Problem Platform Monitoring*, a Python application that monitors our ELK-stack setup for critical errors on our production environment.

Every hour, this tools scans our Elasticsearch server for error messages and creates a comprehensive email report, like this:

[{{< figure src="/images/2025-03-09-new-project-platform-problem-monitoring-sample-mail-report.png" alt="Platform Problem Monitoring Email Report" >}}](/images/2025-03-09-new-project-platform-problem-monitoring-sample-mail-report.png)

I was able to realize this application from the ground up within a couple of hours, although my experience with the Python language and ecosystem borders on zero. In fact, I didn't write a single line of Python code for this project.

The "three measures" helped a great amount with getting to a reliably and correctly working solution.

As we've released this application as Open Source, the full code is available on Github: [Platform Problem Monitoring](https://github.com/dx-tooling/platform-problem-monitoring-core).

This includes its **well-structured requirement**, which I made available to the AI through file [REQUIREMENTS.md](https://github.com/dx-tooling/platform-problem-monitoring-core/blob/main/docs/REQUIREMENTS.md).

As you can see, it's not a quick read — but at 371 lines, it provides the basis for the AI agent to start off towards a clearly defined end state.

I does so following a clear, hierarchical structure:

- *Top-level: Core requirements in one line*
- *High-level: Use case and motivation*
- *Mid-level: Process and work mechanisms*
- *Mid-level: Architecture, tech stack, and constraints*
- *Low-level: Detailed process steps*

The low-level section breaks down the application's operation into 12 distinct steps, each with clearly defined inputs, outputs, and side effects.

Of course, I also took care to not launch the AI on its mission without an extensive set of **tool-based guard rails**, as the [Makefile](https://github.com/dx-tooling/platform-problem-monitoring-core/blob/main/Makefile) of the project illustrates. It provides:

- code formatting with black and isort,
- linting with ruff,
- type checking with mypy,
- security analysis with bandit,

and a way to run a comprehensive test suite.

Last but not least, in the spirit of **file-based keyframing**, I created the stub files for the 12 process steps that needed to be implemented.

# So how did *that* work out?

Well, for one, it was an interesting experience to create a non-trivial application from scratch without actually writing any code!

And in this particular case, the new approach really made all the difference between _"I mean, do we **really** need to monitor our ELK-stack?"_ and *"Isn't it nice how we have this ELK-stack monitoring now?"*.

Also, from a *product developer* perspective, the result is just fine! The application does exactly what it was meant to do, and hums along nicely every single day.

However, from a *software developer* perspective, one might consider it a mixed bag. As user [necovek](https://news.ycombinator.com/item?id=43575664) commented on [the HackerNews thread for the previous version](https://news.ycombinator.com/item?id=43575664) of this article:

> The premise might possibly be true, but as an actually seasoned Python developer, I've taken a look at one file: [utils.py](https://github.com/dx-tooling/platform-problem-monitoring-core/blob/af68ac38b5a7142c97997fe7cd799ce9bd1b4bd0/src/platform_problem_monitoring_core/utils.py)

> All of it smells of a (lousy) junior software engineer: from configuring root logger at the top, module level (which relies on module import caching not to be reapplied), over not using a stdlib config file parser and building one themselves, to a raciness in load_json where it's checked for file existence with an if and then carrying on as if the file is certainly there...

> In a nutshell, if the rest of it is like this, it simply sucks.

In conclusion, I would say that "green-field project in an unknown tech stack" remains a special case for now.

Nevertheless, using the approach of structured requirements and comprehensive guard rails allowed me to end up with something useful, with really manageable effort.

This is demonstrated vividly by a follow-up session in Cursor, where I fed the critique above into a prompt that aimed at improving the code quality:

> I have received the following feedback regarding this codebase:
>
> (above comment from necovek)
>
> I therefore ask you to thoroughly improve the code quality of the implementation in @src while staying in line with the requirements from @REQUIREMENTS.md, and while ensuring that the Quality Tools (see @makefile) won't fail. Also, make sure that the tests in folder @tests don't break.
>
> See file @pyproject.toml for the general project setup. There is already a virtualenv at @venv.

I have recorded the first ~10 minutes of the resulting Agent session, and it's really interesting to see how Cursor repeatedly iterates through the quality tools to stay on track while modifying the codebase:

<iframe width="100%" height="480" src="https://www.youtube.com/embed/zUSm1_NFKpA?si=gxIRfPJAYVlLb9Cq" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

# Conclusion

By providing well-structured requirements, implementing appropriate guard rails through tools that the AI agent can use, and by using file-based "keyframing", it is possible to harness the power of AI while maintaining code quality and architectural integrity.

These time-tested practices, and more than anything else, **the hard-earned human experience with these practices**, are more valuable than ever in the age of AI-assisted development — and far from obsolete.

As a result, using coding assistants like Cursor is already daily business when we work on our main applications, that is, those projects that lie squarely within our technological and architectural comfort zone — because the measures described in this article allow us to guide the AI in a targeted manner, and because it's straight-forward to verify the quality of the resulting code.

Using the same techniques within the context of a green-field project that is based on an unfamiliar tech stack enables new application development possibilities, but does not come without pitfalls that need to be considered.
