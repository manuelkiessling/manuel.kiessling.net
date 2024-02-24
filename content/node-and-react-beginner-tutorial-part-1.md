---
date: 2024-01-20T00:00:00+01:00
lastmod: 2024-01-20T00:00:00+01:00
title: "Node & React Beginner Tutorial — Part 1: Introduction to JavaScript"
description: ""
authors: ["manuelkiessling"]
slug: 2024/01/20/node-and-react-beginner-tutorial-part-1
lang: en
draft: true
---

# Part 0: Preface


## What you will learn

The approach of this tutorial is to teach its readers how to build a fully working software application **from zero to production**.

This means two things:

1. You are not required to have done any kind of software development before getting started with this tutorial. It will introduce and explain everything that is needed to build applications in full detail, assuming no prior knowledge or experience. This is the "from zero" part.

2. Building on the foundational knowledge it teaches in the first half, the tutorial will then, step by step, guide you through the process of building a real, full-fledged, and completely working software application, again explaining every detail along the way, and shows how to "deploy" that application — that is, how to make that application available on the Internet for anyone to use. This is the "to production" part.

This is what this tutorial will teach you in order to get from zero to production:

First, it introduces **JavaScript**, one of the most widely used programming languages in the world. You will learn how to write and run JavaScript code right within your web browser, and you will learn about the most basic components of the JavaScript language, like types and variables.

Then, it will introduce **Node.js**, a tool which allows you to write and run JavaScript code outside of your web browser, and you will learn how to use JavaScript and Node.js to build your first, simple software applications, with more advanced JavaScript components like control structures, loops, and functions.

Next, it will introduce **TypeScript**, a software language that at its core is identical to JavaScript, but adds some very important goodies. This allows you to write more complex JavaScript applications with ease and confidence.

It then introduces **React and Redux**, two JavaScript & TypeScript libraries that will enable you to write elegant web applications with beautiful and fast user interfaces.

Finally, it will teach you how to put all of your newly gained JavaScript, TypeScript, Node.js, React, and Redux knowledge to practical use, in order to create a fully working application running on Amazon AWS.


## Recommended working environment

Nearly all relevant JavaScript projects have been developed *on* Linux or macOS systems and *for* Linux or macOS systems, which regularly creates some kind of "impedance mismatch" in terms of availability and reliability of tools for Windows.

If you absolutely must use Windows for developing JavaScript applications, then don't worry, you will be just fine. Note, however, that this tutorial will not provide the same level of hand-holding as it does for readers working on Linux or macOS. At some points, you will have to use alternatives to the tools recommended and explained here, and while the tutorial will point you in the right direction, you will be quite a bit more on your own.


# Part 1: Introduction to JavaScript

This tutorial teaches its readers how to build software applications with the programming language TypeScript.

And yet, it begins by introducing the reader to a different programming language: JavaScript.

One builds on the other. Ultimately, the code that is executed when your applications run is JavaScript code. And there is nothing wrong with writing your applications with JavaScript code directly — and actually, this is what we will do in the first part of this tutorial.

But there are very good reasons to then take the next step and write your applications with TypeScript code instead — and have your computer translate your TypeScript code into JavaScript code before it is executed.

Luckily, taking this step is very straightforward. Once you understand the basics of software development with JavaScript (which is what the first part of this tutorial takes care of), you can switch to TypeScript very easily. This is because TypeScript is not a completely new and different language — instead, it is a so-called *superset* of JavaScript, extending JavaScript's syntax with some additional syntax that makes your software development experience even better.

It does so by extending JavaScript, a language which doesn't allow to explicitly type its values, with explicit type annotation syntax, giving you type-safety while building your applications.

If you are new to programming, the above sentence probably didn't make much sense. Fear not! We will take it step by step: we first learn how to build software with JavaScript, and then we will learn how to build software even better with TypeScript.

The most important information right now is this: Every valid JavaScript program is also a 100% valid TypeScript program. Everything you learn about JavaScript — expressions, values, types, control structures, functions, and so on — are written and used in exactly the same way in TypeScript. Thus, once you've finished the first part of this tutorial, and learned JavaScript, you have already learned 90% of TypeScript.




## Values and Types

Starting to write and run JavaScript code is really simple. All we need is an environment which is able to interpret and run the JavaScript code that we write. There are several environments we can choose from, and we will learn about the different environments that are able to handle our code, but for now we will start with one that is readily available to us: the web browser.

All mainstream web browsers — Chrome, Firefox, Internet Explorer, Edge, Safari, Opera, to name the most famous ones — are able to run JavaScript code, and we can use them for our first experiments.

To follow along, please open your Chrome or Firefox browser. If you don't have at least one of these currently installed, then please visit https://www.google.com/chrome or https://www.firefox.com to download and install them.

After opening the browser, you don't need to surf to any specific webpage. Instead, we want to work with the browser's JavaScript console, where we can write code and execute it.

In Firefox, hit CTRL-SHIFT-K (or, on macOS, ALT-CMD-K) to open the console. In Chrome, use CTRL-SHIFT-I (or, on macOS, ALT-CMD-I) to open the Developer Tools, and then click on the "Console" tab within the newly opened pane to access the console.

When reaching the console, it's possible that it is already filled with some warning and error messages. That's not a problem — simply ignore these. Both browsers also provide a button which empties the console. It's a trashcan icon in Firefox, similar to 🗑, and a circle-with-a-diagonal-line icon in Chrome, similar to ⃠.

The console offers a prompt which allows you to type in text, as can be seen in the following screenshot:

{{<
figure src="/images/node-react-beginner/chrome_console.png"
>}}


Everything we enter into this console will be evaluated by the JavaScript interpreter embedded into the browser, as soon as we end our input by hitting the ENTER key.

This enables us to run our very first JavaScript code.

To do so, type the following at the console input prompt: `"hello"`, and then hit the ENTER key. Note the quotation marks — these are important!

As a result, the console will print our text back to us — in this case, it's `<- "hello"`. The left arrow, `<-`, isn't actually part of the response — it simply denotes that this is a response from the JavaScript interpreter.

Right now, the content of your console should look like this:

    >  "hello"
    <- "hello"

The `>` symbol (in some browsers it might look like `>>`) denotes the input line, and the `<-` symbol denotes the output line.

What we just entered, and what the JavaScript interpreter evaluated and executed, is a very simple JavaScript *expression*. Our expression consists of one single element: a *value* — the text *hello*.

Whenever JavaScript evaluates an expression, this evaluation creates a *result*. The result of evaluating a "value expression" like `"hello"` is the value itself — hence the console echoing the value back to us.

Every value in JavaScript has a certain *type*. The type of value `"hello"` is *string*, which is the type that JavaScript uses for all text values.

We can run other expressions that evaluate to values of other types:

    >  1
    <- 1

    >  0.5
    <- 0.5

    >  true
    <- true


This introduces two new types: *number* and *boolean*. For numbers, JavaScript doesn't differentiate between integer and floating point numbers - in other words, the values `1` and `1.0` are identical, and thus, `1` and `0.5` have the same type.

As expected, values of type *number* can be used for mathematical operations. Entering `1 + 1` at the console will return `2`, as does `1.0 + 1.0`. In order to get a floating point number back, we must run an operation where the result contains a fractional part, e.g. `1 + 1.5`, which returns `2.5` as expected. Numbers with a fractional part of zero, like `1.0`, are always shown simplified to the whole number, e.g. `1`.

Operations like `3 * 2.5` and `5 / 2` execute a multiplication and a division. Operator precedence is applied as usual, and can be enforced with parentheses, which is why `3 * 2 + 5` returns `11`, while `3 * (2 + 5)` returns `21`.

The plus sign `+` has an obvious meaning when dealing with values of type *number*, but it also works with *string* values, and allows to concatenate texts: `"foo" + "bar"` results in `"foobar"`.

The *boolean* type has only two possible values, `true` and `false`, and is used, as its name implies, for boolean operations. For example, boolean operations can result from comparing numbers: `1 == 1` will return `true`, as does `1 < 2`, while `1 == 2` and `1 > 2` will return `false`.

We can combine multiple simple boolean expressions into larger and more complex boolean expressions by combining simple expressions with *boolean operators*. The boolean *and*, expressed with `&&`, results in `true` if both sides of the expression are themselves `true`:

    1 == 1 && 2 == 2

results in `true`, while

    1 == 1 && 2 == 3

results in `false`.

The other operator is `||`, which expresses the boolean *or*. It resolves to `true` if at least one side of the expression is `true`, and to `false` only if both sides resolve to `false`:

    >  1 == 1 || 2 == 2
    <- true

    >  1 == 2 || 2 == 2
    <- true

    >  1 == 1 || 2 == 3
    <- true

    >  1 == 2 || 2 == 3
    <- false

And finally, there's `!`, which can be used to "invert" a boolean expression - `true` becomes `false` and vice versa. This applies to simple and complex boolean expressions alike, but we need to put every part of a boolean expression into parentheses if we want to invert a complex expression:

    >  !true
    <- false

    >  !(1 == 1)
    <- false

    >  !(1 == 2 || 2 == 3)
    <- true

    >  !(1 == 1) || 2 == 3
    <- false

That last one is a good litmus test to see if we understand how boolean expressions work. As this is an "or" expression using `||`, it's enough to make it `true` if one side of it is `true`. The expression on the left, `1 == 1`, is `true`, but because it is inverted with `!` before the `||` comparison is done, the left side of the "or" expression is `false`.

Note how we use `==` for value comparison, while we used `=` for assignment.

And there is a second comparison operator, which is useful when we compare values of different types: `0 == 0` is of course `true`, but `0 == ""` is... also `true`. This might not be what you want, because the number `0` and the empty string `""` are two different things - we probably agree that an empty string is something different than the number zero.

In order to make sure that the two things we compare have the same value *and* also have the same type, we can use the `===` operator, which checks for type *and* value. Because comparisons with `==` are less strict, they are a common source of confusing bugs. It's therefore recommended to always compare using `===`, unless you know for sure that you want a less strict comparison.

Mixing values of different types is possible not only for *comparison* - you can also *combine* values of different types to create new values. For example, adding the *number* value `1` to the *string* value `foo` creates a new string value: `1 + "foo"` results in value `"1foo"`, of type *string*.
