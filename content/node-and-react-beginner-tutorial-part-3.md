---
date: 2024-05-02T00:00:03+01:00
lastmod: 2024-05-02T00:00:03+01:00
title: "Node & React Beginner Tutorial — Part 3: Node.js: JavaScript on the command line"
description: "The third part of this tutorial series introduces Node.js, a JavaScript interpreter that runs on the command line, and shows how to build a simple command line application in this context."
authors: ["manuelkiessling"]
slug: node-and-react-beginner-tutorial/part-3
lang: en
draft: false
---

This is part three of a multi-part tutorial series that teaches how to build real-world software applications with JavaScript, TypeScript, Node.js, and React — starting from zero knowledge, all the way to launching into production.

Go to [Part 1: Introduction to JavaScript](../part-1/) to start at the beginning.

# Part 3: Node.js: JavaScript on the command line

## A new context

As stated before, running JavaScript code, and therefore, building JavaScript applications, is possible in several different contexts. So far, we've worked with the browser console, which is a very dynamic context where every line of code we write is directly fed into a JavaScript interpreter — but it's also a very limited context.

The Node.js project takes a JavaScript interpreter (the one that ships with the Chrome browser, called *V8*), and makes it available as a stand-alone program on the command line. This allows us to not only feed single lines of code into the interpreter interactively, but whole files of JavaScript code, non-interactively.

This enables application building: using the simple expressions we already know, and some more complex ones we are going to learn about next, we can create complex programs that reliably and continuously serve a useful purpose — from simple command line tools to full-fledged server applications.

Being able to build useful server applications is an important building block of knowledge on our journey, because it allows us to provide an HTTP-based REST API for the React-based Single-Page Application we are going to build in later parts of this series.


## Setting things up

In order to be able to create Node.js applications, we need to set up some applications on our development system. Right now, the single best way to do this is to use a project called *NVM*, the Node Version Manager. It's a very useful utility from the Node.js ecosystem which allows to install and manage Node.js installations on your local system through a single command line tool. Among other things, it allows to easily switch between different versions of Node.js as needed — for example, you might want to generally use the latest version of Node.js on your system, but you may also need to use an older version only for a certain project in a certain folder. NVM makes this straightforward.

There really is only one single downside regarding NVM: it is not available for the Windows platform. However, an alternative implementation exists at https://github.com/coreybutler/nvm-windows, which provides a similar experience.

To install NVM on your Linux or macOS system, you need to first head over to https://github.com/nvm-sh/nvm. The README of that project features an *Installation and Update* section, which refers to an install script.

This script is meant to be downloaded and executed on the command line. Thus, you need to launch the terminal emulator of your choice, e.g. *Terminal.app* on macOS. Then, go to https://github.com/nvm-sh/nvm/blob/master/README.md and paste the *curl* or *wget* line from the *Installation and Update* section — it looks similar to this one:

    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/vX.Y.Z/install.sh | bash

with `X.Y.Z` denoting the version number of the most recent release.

Please take the time to also read the additional notes further down in the README. For example, on macOS, it might be necessary to first install the *Xcode command line tools*, or else installation of NVM might fail.

You've reached your goal as soon as running `nvm --version` on the terminal command line works without an error, and prints the version number. When talking about working on the command line, I'm going to use the following notation:

     > something to be entered on the command line

     One or multiple lines of
     output that results from runnning
     the entered command line

Running the `nvm --version` command line and its output therefore looks like this:

    > nvm --version

    0.35.0

Installing NVM itself doesn't give you a Node.js setup right away. But we can now use NVM to install Node.js. There are several ways to do so, and for our first project, we are going to work with the `.nvmrc` approach.

To do so, we need to create a project folder first. Find a place that suits you well — this can be your home folder, or maybe you already have a projects folder. The only thing that matters is that you should be able to create new folders and files at this location. From now on, I will assume that you are going to use your home folder (which can be reached on the command line from anywhere by simply running `cd`) as the parent folder of all Node.js project folders.

Once you are there, create the project folder, and change into the new folder:

    > mkdir nodejs-hello-world
    > cd nodejs-hello-world

We are going to tell NVM which version of Node.js we want to use for this project. To do so, we create a file named `.nvmrc` right in our project folder. The sole content of this file is one line that contains the Node.js version number we wish to use. This can be achieved like this:

    > echo "20" > .nvmrc

When running NVM while we are within the project folder, it will detect this file, read its contents, and will use the contained version number. The first thing we are going to use NVM for is to install Node.js:

    > nvm install

    Found '/home/manuelkiessling/nodejs-hello-world/.nvmrc' with version <20>
    Downloading and installing node v20.12.2...
    Downloading https://nodejs.org/dist/v20.12.2/node-v20.12.2-darwin-x64.tar.xz...
    ######################################################################## 100.0%
    Computing checksum with shasum -a 256
    Checksums matched!
    Now using node v20.12.2 (npm v10.5.0)

As you can see, using `20` as the Node.js version number works as a kind of wildcard — because we only provided the first part of the three part version number, NVM automatically assumes we want the most recent version of Node.js 20.x.y, which as of this writing is 20.12.2.

Version 20 of Node.js is the current Long Term Support (LTS) version of Node.js, and is an optimal starting point for new projects. You can find the most recent "LTS" and "Current" versions of Node.js at https://nodejs.org.

With this, Node.js is now available on your system! You can verify this by running `node --version`:

    > node --version

    v20.12.2

If this doesn't work as expected, or a version number other than the one you expected is shown, then run `nvm use` to ensure that for the current project, NVM has definitely switched to the intended version. However, note that for all practical purposes, it doesn't make any difference if your system uses another minor version, like *20.8.3* instead of *20.12.2*. And even if you have a higher major version, like *21.2.0*, you will probably still be good to follow along.

Let's see what we can do with this.

As said, Node.js basically is a JavaScript interpreter[^note1], wrapped into a command line application instead of a web browser. As such, it provides an interactive console, very much like the one we already worked with. Simply start the `node` application, and you are thrown into this interactive console:

    > node

    Welcome to Node.js v20.12.2.
    Type ".help" for more information.
    > let a = "hello"
    undefined

Type `.exit` or hit `CTRL-D` if you want to leave this console.

While this is certainly nice to have whenever we feel like playing around with JavaScript interactively, we wanted to get away from the console and start writing "real" JavaScript applications.

To do so, we need to create our very first JavaScript *code file*. And this means we need to talk about code editors, because we need a tool to create and edit our code files. JavaScript code files are simple text files, and even a very rudimentary plain text editor is perfectly capable to create and edit these files. Nevertheless, using specialized code editors or IDEs (Integrated Development Environments) makes sense, because they make working on a large code base a lot more comfortable.

There's a large choice available, and if you are already using a code editor or an IDE you feel comfortable with, just stick with it. As long as there is at least basic support for JavaScript, you're fine.

In case you haven't made a decision yet, then Atom (https://atom.io/), Visual Studio Code (https://code.visualstudio.com/), or IntelliJ IDEA (https://www.jetbrains.com/idea/) are all worth a look.

Whatever tool you choose, please use it to create your first file, named `index.js`, and store it within the `nodejs-hello-world` folder, with the following content:

    "hello"

Yeah, I know. That old `"hello"` line again. But bear with me, it's useful to demonstrate something important. Our JavaScript expression is now stored in the file, and where the embedded interpreter of the console executed any expression immediately for us, we now need to trigger this explicitly ourselves by running our file through the `node` program, like this:

    > node index.js

The result is... literally nothing. A JavaScript console would have printed the result of evaluating the expression. But when feeding the file containing the expression into Node.js, we see nothing. Is the expression really evaluated? We can test this by intentionally creating an invalid expression — simply remove the second quotation mark:

    "hello

and run the file again:

    > node index.js

    /home/manuelkiessling/nodejs-hello-world/index.js:1
    "hello
    ^^^^^^

    SyntaxError: Invalid or unexpected token
        at wrapSafe (internal/modules/cjs/loader.js:891:16)
        at Module._compile (internal/modules/cjs/loader.js:941:27)
        at Object.Module._extensions..js (internal/modules/cjs/loader.js:1011:10)
        at Module.load (internal/modules/cjs/loader.js:822:32)
        at Function.Module._load (internal/modules/cjs/loader.js:730:14)
        at Function.Module.runMain (internal/modules/cjs/loader.js:1051:12)
        at internal/main/run_main_module.js:16:11

Fine, this proves that our code reaches a JavaScript interpreter. But why don't we see any output for the non-broken code?

The reason is that an interactive JavaScript console does the additional work of printing any expression's result back to us — but now we don't have an interactive console, only a "pure" JavaScript interpreter, and we need to trigger the outputting ourselves. To do so, we can use method `log` of object `console`. Even though neither *objects* nor *methods* have yet been introduced properly, please change your file's content to this:

    console.log("hello")

Now the result of the expression is printed on the command line:

    > node index.js

    hello

Great, this mystery is solved.

Enough with the one-liners, though — let's write a more complex program with the elements we already know:

    let a = "hello";
    console.log(a);

    let b = 1;
    console.log(a + b);

and run it:

    > node index.js

    hello
    hello1

Nice. You may have noticed that I suddenly started to put a semicolon `;` at the end of each line. This isn't strictly necessary, because most of the time JavaScript knows how to automatically detect that an expression has ended, even if it goes over multiple lines. But ending every expression with a semicolon explicitly removes any ambiguity, and is the dominant code style. We will stick to it in this series from now on.

Let's use our new multi-line freedom to write a very first *control structure*:

    let n = 10;

    if (n > 0) {
        console.log("n is a positive number.");
    }

The output, of course, is `n is a positive number.`.

Let's dissect this code. So far, every JavaScript expression we've fed into a console or into Node.js has been executed — a control structure like the `if` statement potentially results in some part of code not being executed. If we set `n` to `-5`, then the line `console.log("a is a positive number.");` will not be executed.

This is because `if` statements introduce a so-called *block* (the part between parentheses `{` and `}`), and define a *condition* that must evaluate to `true` for the code in the block to be evaluated. The condition is the part in parentheses `(` and `)` that follows the `if` keyword. The condition may contain any valid JavaScript expression — the only thing that's relevant is that the interpreter must be able to decide if the condition results in a boolean `true` or `false`.

These conditions all resolve to `true`, and therefore, the block following the `if` statement will be executed:

    if (1 === 1)
    if ("a" === "a")
    if (true)
    if (1 + 2 === 3)
    if (1 + 2 === 3 && 4 + 5 === 9)

And these conditions all resolve to `false`, and therefore, the block following the `if` statement will not be executed:

    if (1 === 2)
    if (1 === "1")
    if (false)
    if (1 + 2 === 4 || 4 + 5 ==== 8)

Only identifying positive numbers is a bit boring, so let's extend our application to identify all possible cases:

    let n = 10;

    if (n > 0) {
        console.log("n is a positive number.");
    }

    if (n < 0) {
        console.log("n is a negative number.");
    }

    if (n === 0) {
        console.log("n is neither positive nor negative.");
    }

Obviously, by modifying the value of `n` (and re-running the application after each change), we can make our application write different outputs.

Our code can be improved by rewriting it from using three distinct `if` control structures to only one multi-part control structure:

    let n = 10;

    if (n > 0) {
        console.log("n is a positive number.");
    } else if (n < 0) {
        console.log("n is a negative number.");
    } else {
        console.log("n is neither positive nor negative.");
    }

This way, the code can branch out into one of several blocks; if the expression of the first `if` condition doesn't evaluate to `true`, then the next expression in the condition of the following `else if` statement is evaluated, and if even that one doesn't evaluate to `true`, then the block of the final `else` statement is executed.


Let's make our application a bit more complex. Say we want to check not only one value, but two. This could be achieved with a naive implementation where we simply duplicate our comparison logic after changing the value of `n`:

    let n = 10;

    if (n > 0) {
        console.log("n is a positive number.");
    } else if (n < 0) {
        console.log("n is a negative number.");
    } else {
        console.log("n is neither positive nor negative.");
    }

    n = -7;

    if (n > 0) {
        console.log("n is a positive number.");
    } else if (n < 0) {
        console.log("n is a negative number.");
    } else {
        console.log("n is neither positive nor negative.");
    }

This is a correctly working application that does exactly what we want, but clearly this isn't an efficient implementation. What if we want to check a thousand values? Copy-and-paste isn't going to cut it in an efficient manner.

Instead, we can turn our comparison logic into a code construct that can be re-used again and again without the need to spell the logic out repeatedly. The construct we need to create is a *function*, and we will do so in the upcoming, soon-to-be-released part four of this series.

> ⚠️ Information about the release of the fourth part of this series will be published on [my Twitter account](https://twitter.com/manuelkiessling) and [my LinkedIn account](https://www.linkedin.com/in/manuelkiessling). Alternatively, send me an e-mail at [manuel@kiessling.net](mailto:manuel@kiessling.net), and I will drop you a line when part four has been published.
