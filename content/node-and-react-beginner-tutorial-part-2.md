---
date: 2024-05-02T00:00:02+01:00
lastmod: 2024-05-02T00:00:02+01:00
title: "Node & React Beginner Tutorial — Part 2: Storing values"
description: "The second part of this tutorial series introduces JavaScript variables and constants."
authors: ["manuelkiessling"]
slug: node-and-react-beginner-tutorial/part-2
lang: en
draft: false
---

This is part two of a multi-part tutorial series that teaches how to build real-world software applications with JavaScript, TypeScript, Node.js, and React — starting from zero knowledge, all the way to launching into production.

See [Part 1: Introduction to JavaScript](../part-1/) if you haven't read it yet.

# Part 2: Storing values

## Variables

Let's now write a more complex JavaScript expression. Please enter and run `let a = "hello"` in the console.

What we just did was a so-called *variable declaration and assignment* — we *declared* the existence of a new variable named `a`, and *assigned* it the value `"hello"`. In JavaScript, as in all other programming languages, variables act as containers for values. It's like using an envelope that has "a" written on it and putting a letter with the text "hello" into this envelope.

It's important to understand that when the JavaScript interpreter evaluates this single expression, it actually performs **two** things: first, a variable is *declared*, that is, the variable name is from then on known to the JavaScript interpreter. Afterwards, an initial value is then *assigned* to the newly defined variable, making the value accessible under the name of the variable.

In other words, the expression

    let a = "hello"

is equivalent to these two expressions:

    let a
    a = "hello"

Whatever approach you choose, `a` is now identical to the string value `"hello"` by any practical measure. `a == "hello"` is true, as is `a === "hello"`, and because `"hello" + " world"` results in `"hello world"`, so does `a + " world"`.

Did you encounter an error while trying out the expressions starting with `let`? Something like `Uncaught SyntaxError: Identifier 'a' has already been declared"` or `SyntaxError: redeclaration of let a`? Don't worry, that's expected. Within any one JavaScript interpreter session, every variable can be declared only once. Once a variable name has been declared with `let`, it cannot be redeclared.

If you want a clean slate with no variables declared, you need to reload the browser tab to which the console is attached, or open a new tab or window with a new console — it's not enough to close and reopen only the console.

With this out of the way, let's further examine our first *let* expression, `let a = "hello"`.

When executing a `let` expression, the response of the interpreter isn't an echo of what we wrote, and we also didn't get back the string value `"hello"` — instead, we got back the value `undefined`:

    >  let a = "hello"
    <- undefined

This sounds like something didn't work as intended, but that's not the case. The JavaScript interpreter evaluated and executed our code successfully, but this time, while the value of `a` became `"hello"`, *evaluating the expression itself* did result in an entirely different value: `undefined`.

In a sense, an `undefined` response is the JavaScript interpreter's way of saying "nothing to see here, move along".

What type does the value `undefined` have? Its type is also named `undefined`, and the value `undefined` is the only value that type `undefined` offers — this clearly is a very special language construct.


### Investigating types

Let's play around a bit with with this. JavaScript ships with a function called `typeof`, and we can use it to investigate the type of a value or an expression. Using it, we can verify that the name of the type of value `undefined` is indeed "undefined":

    >  typeof(undefined)
    <- "undefined"

Of course, we can also check the type of other values:

    >  typeof("hello")
    <- "string"

    >  typeof(1)
    <- "number"

    >  typeof(true)
    <- "boolean"

Passing more complex expressions is fine, too:

    >  typeof(1 + 1)
    <- "number"

    >  typeof(1 == 1)
    <- "boolean"

    >  typeof(1 + "foo")
    <- "string"

And we can check for the type of variable `a`:

    >  typeof(a)
    <- "string"

Here's a catch. You can check the type of a variable that is merely *declared*, but hasn't been *assigned a value* yet:

    >  let x
    >  typeof(x)
    <- "undefined"

This shows that even a variable to which we did not yet assign any value, still has a type: *undefined*.

Irritatingly, the same is true for completely undeclared variables:

    >  typeof(y)
    <- "undefined"

Still, `x` and `y` are different, because only one of them is actually declared. We can make this difference visible when we try to access the value of `x` and `y` — which, by the way, shows that not only does `x` have a type, it also has a value (which isn't that surprising; as we've learned, variables of type *undefined* by definition must have one and only one value: `undefined`):

    >  x
    <- undefined

    > y
    ReferenceError: y is not defined

Letting the JavaScript interpreter evaluate the undeclared expression `y` correctly results in an error — as `y` is not yet declared, the interpreter doesn't know about it. Another catch, however, is that the error message states that "y is not *defined*" — which sounds very much like "y is undefined", but that's not the same thing. It would be a lot less confusing if the error message would read "y is not *declared*".

So, two catches here: If the JavaScript interpreter encounters a variable name that hasn't been declared yet, it bails out (which is correct), stating that the variable has not yet been *defined* (which is confusing). However, passing an undeclared variable name to `typeof` does *not* make the JavaScript interpreter bail out (which is confusing), and returns type *undefined* — which is even more confusing. But at least we now know how the game is played.

Ok, back to our new variable, `a`, which is neatly declared and neatly assigned to a value, and should therefore make for a non-confusing experience.

While we cannot re-declare an already declared variable, we can re-assign new values to variables declared with `let` — even values of a different type. `"hello"` is always `"hello"` and is always a *string*, but we can assign a different value to `a`; for example `a = "goodbye"` or `a = 1` — this changes its value, and potentially, its type:

    >  a
    <- "hello"

    >  a = "goodbye"
    <- "goodbye"
    >  typeof(a)
    <- "string"

    >  a = 1
    <- 1
    >  typeof(a)
    <- "number"

This shows one of the core properties of the JavaScript language: it is a so-called *loosely typed* or *dynamic* language — that is, the type of a variable isn't fixed, and can dynamically change during the run of an application.


### Working with multiple variables

When we declare a variable, we can also assign to it the value of another, already existing variable:

    >  let b = "foo"
    >  let c = b
    >  c
    <- "foo"

Important detail: `b` and `c` now have the same value, `"foo"`, but they do not "share" this value, because ´c´ got an independent copy of `b`'s value, which can be demonstrated like this:

    >  let b = "foo"
    >  let c = b
    >  c
    <- "foo"

    >  b = "bar"
    >  c
    <- "foo"

Changing the value of `b` did **not** change the value of `c` — although `c` has been declared with `let c = b`, it is nevertheless completely independent from `b` from there on.

## Constants

In addition to variables, JavaScript supports *constants*. Like variables, they act as a container for a value, making the value available under the name of the constant — however, we are forced to assign a value upon declaration, and cannot re-assign another value once the constant has been declared:

    >  const d = "foo"
    >  d
    <- "foo"

    > d = "bar"
    TypeError: invalid assignment to const `d'

    > const e
    SyntaxError: missing = in const declaration

Just like variables, constants can be used in expressions just like the values they contain would be used:

    >  1 + d
    <- "1foo"

## Summary of part 2

Fine, let's again recap what we've learned so far:

- Every major browsers ships with a JavaScript interpreter, and using a browser's *console* tool, we can work with this interpreter interactively.
- JavaScript code consists of *expressions*, which are pieces of code that the JavaScript interpreter can evaluate and execute. The console tool allows us to send expressions to the JavaScript interpreter, which then prints the result of evaluating that expression back to the console.
- Simple expressions like `"hello"` can be combined into more complex expressions like `1 + "hello"`, which can be combined into ever more complex expressions like `let d = (1 + "hello") + (Number("5") / 8) + "hey"`.
- One of the most simple JavaScript expressions is a *value*, e.g. `"hello"`. Every value in JavaScript has a *type*, and so far, we've encountered the types *string*, *number*, *boolean*, and *undefined*.
- Simple expressions can be combined into more complex expressions using *operators*, e.g. `+`, `-`, `*`, `/`, `==`, `===`, `<`, and `>`.
- How these operators work depends on the type of the values involved — for example, `1 + 1` results in `2`, while `1 + "1"` results in `"11"`.
- When combining or comparing values using these operators, *type coercion* rules are applied, which potentially translate a value with a given type into another value of a different type. Because coercion rules are complex and can lead to subtle bugs when comparing only the values using the `==` operator, it's recommended to compare value and type using `===`.
- Instead of working with values directly, we can put values into *variables* or *constants*, which act as a container for a value.

With this, we've reached the very first milestone of our journey, and learned about the most basic elements of the JavaScript language. There is, of course, a lot more that we need to tackle.

# Next up

To do so effectively, however, we need to switch to a different JavaScript context. Experimenting with one-liners is all nice and dandy for our first baby steps, but of course it's a very limited approach. Actual JavaScript applications aren't limited to single-line expressions, and while it's possible to enter multiple lines of code into the console (hint: hold `SHIFT` while hitting `ENTER`), it's not very comfortable.

Thus, beginning with part three, we will start to use JavaScript in an environment that allows us to write some first full-fledged applications: *Node.js*.

This allows us to write and run code for the command line, and enables us to tackle more language constructs like *if statements*, *loops*, *functions*, and many more. We will employ these to write code that is actually useful.

We will return to JavaScript in the browser, though, when we start working with React afterwards. But now, on to [part three of this series](../part-3/), and with that, on to the command line!
