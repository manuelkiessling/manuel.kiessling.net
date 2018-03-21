---
date: 2012-03-30T13:13:00+01:00
lastmod: 2012-03-30T13:13:00+01:00
title: "True universal JavaScript modules with write-once-run-anywhere Jasmine specs"
description: "Writing JavaScript modules that can be seamlessly included in client-side as well as server-side applications, and providing Jasmine test suites which allow to test these modules in a browser environment as well as a Node.js environment is possible without any dirty workarounds."
authors: ["manuelkiessling"]
slug: 2012/03/30/true-universal-javascript-modules-with-write-once-run-anywhere-jasmine-specs
---

<p>
  As a JavaScript developer writing general-purpose libraries, you probably wish you could go fully universal, that is, you might want to create a library:
  </p><ul>
    <li>that can be used in the browser <em>and</em> in Node.js – without any hacks for either platform, and without code-duplication</li>
    <li>that transparently utilizes AMD via RequireJS in the browser and CommonJS via <em>require</em> in Node.js – without any hacks for either platform, and without code-duplication</li>
    <li>with a Jasmine spec suite which runs in the browser and in Node.js – without any hacks for either platform, and without code-duplication</li>
  </ul>
<p></p>

<p>
  Turns out this is perfectly possible. Consider the following library structure:
</p>

<p>
  <pre><code>
      lib/
        multiply.js

      spec/
        multiply.spec.js
  </code></pre>
</p>

<p>
  As stated above: Without making use of any nasty hacks or duplicating any or all of our lib or spec code, we would like to be able to use our <em>multiply.js</em> module in a web-based browser application, or in a server-side application for Node.js – of course assuming that <em>multiply.js</em> provides a general-purpose functionality that is usable on both platforms, and not e.g. something working with a browser-DOM. In our example library, <em>multiply</em> provides a function that does the very useful job of multiplying two number, like this:
</p>

<p>
  <pre><code>
    console.log(multiply(2, 5)); // outputs "10"
  </code></pre>
</p>

<p>
  Furthermore, when using our lib in the browser, we would like to be able to load it using RequireJS, and when using it in a Node.js application, we would like to be able to <em>require()</em> and use it just like any other npm module:
</p>

<p>
  <pre><code>
    // Browser script

    define("../lib/multiply", function(multiply) {
      console.log(multiply(2, 5));
    });
  </code></pre>
</p>

<p>
  <pre><code>
    // Node.js script

    var multiply = require("../lib/multiply.js");

    console.log(multiply(2, 5));
  </code></pre>
</p>

<p>
  And we want our Jasmine specification <em>multiply.spec.js</em> to be able to run in a web-based Jasmine runner as well as in a Node.js based runner, enabling us to test our library on both platforms. Again, without duplicating the spec or lib code.
</p>

<p>
All this can be achieved with the following steps:
</p><ol>
  <li>Export the lib module and its spec via RequireJS’ <em>describe</em> logic</li>
  <li>For Node.js, add the <em>amdefine</em> package to make the lib and its spec loadable via Node’s <em>require()</em></li>
  <li>For Node.js, add the <em>jasmine-node</em> package (but no node-specific RequireJS implementation!)</li>
  <li>For the client-side, add <em>Jasmine</em> and <em>RequireJS</em></li>
  <li>For the client-side, write a Jasmine SpecRunner that uses RequireJS’ <em>describe()</em> to load the spec files for the test run</li>
</ol>
<p></p>

<p>
  Once this is done, the library structure will look as follows:
</p>

<p>
  <pre><code>
      package.json

      lib/
        multiply.js

      spec/
        multiply.spec.js
        run.sh
        SpecRunner.html

      vendor/
        require.js

        jasmine/
          jasmine-html.js
          jasmine.css
          jasmine.js
          jasmine_favicon.png
          MIT.LICENSE
  </code></pre>
</p>

<p>
  The <em>/package.json</em> file is the place where the <em>amdefine</em> and <em>jasmine-node</em> dependecy for the Node.js environment will be defined, <em>/spec/run.sh</em> is the Jasmine runner for the Node.js environment, <em>/spec/SpecRunner.html</em> is the Jasmine runner for the client-side environment, and <em>/vendor</em> hosts the external libraries RequireJS and Jasmine, again for the client-side environment.
</p>

<p>
  Let’s tackle each file in turn:
</p>

<p>
  /package.json:
  <pre><code>
{
  "name": "CafeGraph",
  "version": "0.0.1",
  "dependencies": {
    "amdefine": "&gt;=0.0.2"
  },
  "devDependencies": {
    "jasmine-node": "1.0.x"
  }
}
  </code></pre>
</p>

<p>
  This states that the npm modules <em>amdefine</em> and <em>jasmine-node</em> are needed for our lib to work in the Node.js environment. Run <pre><code>npm install</code></pre> to have them automatically installed.
</p>

<p>
  /lib/multiply.js:
  <pre><code>
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define([], function() {
  var multiply = function(a, b) {
    return a * b;
  };
  return multiply;
});
  </code></pre>
</p>

<p>
  Here, several things happen that are crucial for our library to be universal. Because the module itself is wrapped in RequireJS’ <em>define()</em> function, it need some special treatment to be usable within a Node.js context. This is what the first line does, it makes sure that Node.js uses the <em>define</em> function of the <em>amdefine</em> package. This way, the module becomes usable just like any other npm package, even though RequireJS is not available.
</p>

<p>
 The <em>return multiply;</em> statement has the same effect as <em>module.exports = multiply;</em> would have, making the <em>multiply</em> function available for Node.js scripts that do <em>var multiply = require(“../lib/multiply.js”);</em>
</p>

<p>
  /spec/multiply.spec.js:
  <pre><code>
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(["../lib/multiply.js"], function(multiply) {
  describe("multiply", function() {
    it("multiplies two numbers", function() {
      expect(multiply(2, 5)).toEqual(10);
    });
  });
});
  </code></pre>
</p>

<p>
  /spec/run.sh:
  <pre><code>
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &amp;&amp; pwd )"
node $DIR/../node_modules/jasmine-node/lib/jasmine-node/cli.js $DIR
  </code></pre>
</p>

<p>
  This just a script which enables me to run the Jasmine test suite for the Node.js environment via <em>./spec/run.sh</em> on the command line.
  It’s probably a totally unnecessary hack, but I never really found the time to find a better solution. Recommendations welcome. Not part of our code, thus it’s acceptable for now I think.
</p>

<p>
  /spec/SpecRunner.html:
  <pre><code>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Jasmine Test Runner&lt;/title&gt;

    &lt;!-- Jasmine --&gt;
    &lt;link rel="stylesheet" type="text/css" href="../vendor/jasmine/jasmine.css"/&gt;
    &lt;script type="text/javascript" src="../vendor/jasmine/jasmine.js"&gt;&lt;/script&gt;
    &lt;script type="text/javascript" src="../vendor/jasmine/jasmine-html.js"&gt;&lt;/script&gt;

    &lt;!-- RequireJS --&gt;
    &lt;script type="text/javascript" src="../vendor/require.js"&gt;&lt;/script&gt;

  &lt;/head&gt;

  &lt;body&gt;
    &lt;script type="text/javascript"&gt;
      require.config({
        baseUrl: './'
      });

      require([
        '../spec/multiply.spec.js'
      ], function() {
        jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
        jasmine.getEnv().execute();
      });
    &lt;/script&gt;
  &lt;/body&gt;
&lt;/html&gt;
  </code></pre>
</p>

<p>
  The web-based Jasmine spec runner needs several modifications, because the spec files need to be <em>require()</em>d the RequireJS way. However, once this is set up, the workflow for adding new code and specs is straight-forward. For adding new specs to the Node.js spec run, no additional steps are necessary. To include new specs in the web-based spec run, simply add the path to the spec file to the <em>require()</em> array, and that’s it.
</p>

<p>
  You can find the complete library code on GitHub at <a href="https://github.com/manuelkiessling/universal-javascript-modules-example">https://github.com/manuelkiessling/universal-javascript-modules-example</a>, with some additional usage examples.
</p>

<p>
  <strong>tl;dr:</strong> Writing JavaScript modules that can be seamlessly included in client-side as well as server-side applications, and providing Jasmine test suites which allow to test these modules in a browser environment as well as a Node.js environment is possible without any dirty workarounds by writing these modules using the AMD pattern, and then using the <em>amdefine</em> package to make them available to Node.js.
</p>
