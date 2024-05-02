---
date: 2024-04-05T14:04:00+01:00
lastmod: 2024-04-05T14:05:00+01:00
title: "Doctrine Pitfall: Zombie entities"
description: "foo"
authors: ["manuelkiessling"]
slug: 2024/04/05/doctrine-pitfall-zombie-entities
lang: en
draft: true
---

# Introduction

There's an interesting and subtle pitfall when working with Doctrine, the ORM library used in PHP frameworks like Symfony.
This article illustrates the problem and how to avoid it.

## The data model

```text
                                   
 ┌───────┐              ┌────────┐ 
 │       │     1:m      │        │ 
 │  Car  ├──────────────┤  Tire  │ 
 │       │              │        │ 
 └───────┘              └────────┘ 
                                   
```


- if you have a ManyToOne (owning side) association, and you do not plan to manage removal of these child elements yourself, you MUST add a OneToMay (invers side) association with a cascade setting that includes "remove" (in order to have the Entity Manager do the removal for you), AND you MUST $em->refresh the inverse side (parent) entity to ensure that when it is is removed through the $em, it knows about all its owning side ManyToOne "children"!
- Every entity class with one more associations is actually two things: a blueprint for entity objects, and an entity object builder whose job it is to only allow to build instances of itself that are valid
- It's Doctrine's job to DEFINE a sound association STRUCTURE, but it's YOUR job to keep the actual association reality sound when building and modifying entities
- Thus, when designing entities and their associations, do not only design the entities and their associations — also design the ways how these can (and can NOT!) be constructed