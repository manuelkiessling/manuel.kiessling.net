---
date: 2011-04-13T16:13:00+01:00
lastmod: 2011-04-13T16:13:00+01:00
title: "Behaviour-driven node.js development with stubbing by combining Vows and node-gently"
description: "I’m about 3.5 hours into node.js development, I guess that qualifies me to give advice on it on this Internet thing. Being the BDD fanatic that I am, I wanted to start off behaviour-driven right from the beginning, and Vows looked like a good choice."
authors: ["manuelkiessling"]
slug: 2011/04/13/behaviour-driven-node-js-development-with-stubbing-by-combining-vows-and-node-gently
---

<p>
I’m about 3.5 hours into node.js development, I guess that qualifies me to give advice on it on this Internet thing.
</p>

<p>
Being the BDD fanatic that I am, I wanted to start off behaviour-driven right from the beginning, and <a href="http://vowsjs.org/">Vows</a> looked like a good choice.
</p>

<p>
However, I quickly came to the point where I needed to stub out a dependency in one of my modules, and as far as I can see, Vows doesn’t provide mocking/stubbing. But <a href="https://github.com/felixge/node-gently">https://github.com/felixge/node-gently</a> does, and here is my approach at combining these two:
</p>

<p>
This is the Vows spec:
<pre><code>var gently = global.GENTLY = new (require("gently"));

var vows = require("vows"),
    assert = require("assert");

var myModule = require("MyModule");

vows.describe("My Module").addBatch({
  "when calling its foo() method": {
    topic: myModule,
    "it triggers a console message": function (topic) {
      gently.expect(gently.hijacked.sys, "puts", function(str) {
        assert.equal(str, "Hello World");
      });
      topic.foo("Hello World");
    }
  }
}).export(module);
</code></pre>
</p>

<p>
And this is the implementation of MyModule:
<pre><code>if (global.GENTLY) require = GENTLY.hijack(require);

var sys = require("sys");

function foo(message) {
  sys.puts(message);
  return true;
}

exports.foo = foo;
</code></pre>
</p>
<p>
No idea if this makes any sense in the long run – I will tell you when I’m about 14 hours or so into BDD node.js development…
</p>
