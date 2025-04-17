---
date: 2025-04-17T00:00:01+02:03
lastmod: 2025-04-17T00:00:01+02:03
title: "New Open Source project: An AI-Friendly Static Landing Page Generator"
description: "A new open-source project providing a modern template and styleguide optimized for building static landing pages with AI coding assistants."
authors: ["manuelkiessling"]
slug: 2025/04/17/new-open-source-project-landinpage-ai-template
lang: en
---

# Build Static Landing Pages Faster, Especially with AI

Creating effective marketing and product landing pages often involves repetitive setup: configuring build tools, defining reusable components, and establishing a consistent style. While AI coding assistants can accelerate HTML and CSS generation, achieving quality and consistency requires a solid foundation.

Manually building this foundation for each new page is inefficient. To streamline this process, especially when working with AI tools, I've created and open-sourced **landingpages-ai-template**.

**GitHub Repository:**<br>[https://github.com/dx-tooling/landingpages-ai-template](https://github.com/dx-tooling/landingpages-ai-template)

My motivation was straightforward: I wanted a streamlined way to generate static landing pages, especially using AI, but without relying on a SaaS platform. The goal was simply a convenient path to the final, clean HTML, CSS, and JavaScript output.

This template aims to provide just that: a robust, modern foundation that allows developers, marketers, or designers to go from a textual description to a fully functional, statically-built landing page with minimal friction. It's designed to leverage the power of AI while ensuring you retain full control over the zero-dependency assets.

**Think of it as a "text-to-landingpage" starter kit.**

# What's Inside?

The template provides a pre-configured setup with:

*   **Modern Tooling:** TypeScript, Webpack 5, Tailwind CSS v4 (with Lightning CSS), and PostCSS.
*   **Living Styleguide:** Demonstrates available components (headers, sections, CTAs) for visual reference and AI instruction.
*   **Example Page:** Shows how to assemble a landing page using the styleguide components.
*   **Stimulus JS:** For lightweight JavaScript interactions.
*   **Dark/Light Mode:** Automatic theme switching with FOUC prevention.
*   **HTML Partials:** For reusing common HTML snippets.
*   **Quality Tools:** Prettier, ESLint, and TypeScript checks integrated.
*   **Testing:** Vitest setup for unit/integration tests (mainly Stimulus controllers).
*   **Optimized Builds:** Separate development and production build configurations.

Here's a glimpse of the styleguide and example page:

[{{< figure src="http://manuel.kiessling.net/landingpages-ai-template/assets/main-screenshot-3840x1559.jpg" alt="Screenshot of the Living Styleguide and Example Landing Page" >}}](http://manuel.kiessling.net/landingpages-ai-template/assets/main-screenshot-3840x1559.jpg)

You can explore the live versions here: [Live Styleguide](https://dx-tooling.github.io/landingpages-ai-template/styleguide/index.html) — [Live Example Page](https://dx-tooling.github.io/landingpages-ai-template/example-page/index.html)

# Optimized for AI Collaboration

The template truly shines when paired with AI coding assistants like Cursor or Windsurf. Its structure, the living styleguide, and the example page provide the rich context these tools need to understand the available components and design patterns.

Instead of starting from scratch, you can open the project in your AI-powered IDE and immediately begin instructing the assistant. Because the AI can "see" the styleguide and examples, you can ask it to:

*   Assemble pages using existing components ("Use the hero section and the three-column feature grid from the styleguide.").
*   Modify content within those components ("Change the headline to X and the button text to Y.").
*   Even create new components that match the established visual style.

This significantly speeds up development, allowing the AI to handle the boilerplate and component arrangement based on your descriptions, freeing you up to focus on the content and overall structure. The included quality tools can also be run by the AI to help ensure consistency.

Here's how that interaction might look within an AI coding assistant:

[{{< figure src="http://manuel.kiessling.net/landingpages-ai-template/assets/cursor-screenshot-1920x1529.png" alt="Screenshot of Cursor AI IDE with landingpages-ai-template project and example prompt" >}}](http://manuel.kiessling.net/landingpages-ai-template/assets/cursor-screenshot-1920x1529.png)

# Example in Action

Using this template, I quickly generated a landing page for a hypothetical AI Coding Consulting service. The AI assistant, guided by the template's structure and styleguide, produced the page with minimal manual intervention.

Here's a short screen recording showing the final page:

<video width="100%" controls autoplay muted loop playsinline loading="lazy">
  <source src="https://manuel.kiessling.net/landingpages-ai-template/assets/2025-04-17_screen_recording_ai_coding_consulting_landingpage.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

# Getting Started

Ready to try it out? Getting started is simple:

1.  Clone the repository: `git clone https://github.com/dx-tooling/landingpages-ai-template.git`
2.  Make sure you have Node.js (the specific version is in `.nvmrc`, use NVM if you can) and install dependencies with `npm install --no-save`.

For detailed setup instructions, build commands, and more, please refer to the [project's README on GitHub](https://github.com/dx-tooling/landingpages-ai-template#getting-started).

# Conclusion

The `landingpages-ai-template` project aims to bridge the gap between the accelerating capabilities of AI coding assistants and the desire for a simple, controllable workflow for generating static web assets.

I wanted a way to quickly produce landing pages without the complexities or constraints of SaaS solutions – focusing solely on obtaining clean HTML, CSS, and JS. This template encapsulates that approach.

By offering a pre-configured environment with a clear styleguide and conventions, it significantly lowers the barrier to creating professional-looking landing pages quickly. If you share the need for a streamlined, AI-friendly process that results in pure static output you fully control, this project might be exactly what you're looking for.

Feel free to check it out, use it for your projects, and contribute back if you find it useful!

[**View on GitHub: dx-tooling/landingpages-ai-template**](https://github.com/dx-tooling/landingpages-ai-template)

