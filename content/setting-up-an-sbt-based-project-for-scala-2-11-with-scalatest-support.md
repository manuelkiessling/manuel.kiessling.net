---
date: 2015-11-02T16:13:00+01:00
lastmod: 2015-11-02T16:13:00+01:00
title: "Setting up an sbt-based project for Scala 2.11 with ScalaTest support"
description: " This post describes how to set up a new Scala 2.11.7 project with ScalaTest 2.2.4 support using sbt 0.13.9 on Mac OS X 10.11 “El Capitan” with Java 1.8."
authors: ["manuelkiessling"]
slug: 2015/11/02/setting-up-an-sbt-based-project-for-scala-2-11-with-scalatest-support
---

<p>
This post describes how to set up a new Scala 2.11.7 project with ScalaTest 2.2.4 support using sbt 0.13.9 on Mac OS X 10.11 “El Capitan” with Java 1.8.
</p>

<p>
If set up as describes below, you can manage your project via sbt, and you will be able to run your test cases via <code class="inline">sbt test</code>. Also, after setting things up this way, the project can be opened and used in IntelliJ IDEA 14 as an sbt project.
</p>

<p>
First, install Homebrew as described on <a href="http://brew.sh/#install">the Homebrew website</a>. You can now install <em>sbt</em> via brew, by issuing <code class="inline">brew install sbt</code>.
</p>

<p>
Running <code class="inline">sbt about</code> shows that sbt 0.13.9 is now installed.
</p>

<p>
Next, we can start to create our sbt-based Scala project with ScalaTest. To do so, start by creating the folder structure, assuming our project is named <em>Foo</em>:
</p>

<p>
</p><pre><code>mkdir Foo
cd Foo
mkdir -p src/main/scala
mkdir -p src/test/scala</code></pre>
<p></p>

<p>
Now, we create file <em>src/test/scala/BarTest.scala</em> with the following content:
</p>

<p>
</p><pre><code>package BarTest

import org.scalatest.FunSuite
import Bar.Baz

class BarSuite extends FunSuite {
  test("Baz.addOne() adds one") {
    val baz = new Baz()
    assert(baz.addOne(5) == 6)
  }
}</code></pre>
<p></p>

<p>
Next, we create file <em>src/main/scala/Bar.scala</em>, which contains the unit under test:
</p>

<p>
</p><pre><code>package Bar

class Baz {
  def addOne(x: Int): Int = {
    x + 1
  }
}</code></pre>
<p></p>

<p>The <em>BarTest</em> package has an external dependency on ScalaTest. We can use sbt in order to manage this dependency – to do so, create the following <em>build.sbt</em> file in the project’s root folder, <em>Foo</em>:
</p>

<p>
</p><pre><code>libraryDependencies += "org.scalatest" % "scalatest_2.11" % "2.2.4" % "test"</code></pre>
<p></p>

<p>
We can now run <code class="inline">sbt update</code>, which will pull in ScalaTest.
</p>

<p>
We are now able to run our project’s test suite via <code class="inline">sbt test</code> – however, the result doesn’t look very promising:
</p>

<p>
</p><pre><code>[info] Set current project to foo (in build file:/Users/manuelkiessling/Foo/)
[info] Compiling 1 Scala source to /Users/manuelkiessling/Foo/target/scala-2.10/test-classes...
[error]
[error]      while compiling: /Users/manuelkiessling/Foo/src/test/scala/BarTest.scala
[error]         during phase: typer
[error]      library version: version 2.10.5
[error]     compiler version: version 2.10.5
[error]   reconstructed args: -classpath /Users/manuelkiessling/Foo/target/scala-2.10...
[error]
[error]   last tree to typer: Apply(method ==)
[error]               symbol: method == in class Int (flags: <method> <deferred>)
[error]    symbol definition: def ==(x: Int): Boolean
[error]                  tpe: Boolean
[error]        symbol owners: method == -&gt; class Int -&gt; package scala
[error]       context owners: method testBazAddOne -&gt; class BarSuite -&gt; package BarTest</deferred></method></code></pre>
<p></p>

<p>
The problem? We pulled in ScalaTest version 2.2.4 <em>for</em> Scala version 2.11 – however, sbt uses Scala version 2.10.5 when trying to compile our code. Why? Because this is the Scala version that was used to build the sbt version we have installed via Homebrew. Quoting from <a href="http://www.scala-sbt.org/0.13/docs/Howto-Scala.html">the sbt docs</a>: <em>“If the Scala version is not specified, the version sbt was built against is used.”</em>
</p>

<p>
“Not specified” refers to our project settings. By changing our <em>build.sbt</em> file as follows:
</p>

<p>
</p><pre><code>scalaVersion := "2.11.7"

libraryDependencies += "org.scalatest" % "scalatest_2.11" % "2.2.4" % "test"</code></pre>
<p></p>

<p>
…the problem is resolved:
</p>

<p>
</p><pre><code>~/Foo$ &gt; sbt test
[info] Set current project to foo (in build file:/Users/manuelkiessling/Foo/)
[info] Compiling 1 Scala source to /Users/manuelkiessling/Foo/target/scala-2.11/test-classes...
[info] BarSuite:
[info] - Baz.addOne() adds one
[info] Run completed in 215 milliseconds.
[info] Total number of tests run: 1
[info] Suites: completed 1, aborted 0
[info] Tests: succeeded 1, failed 0, canceled 0, ignored 0, pending 0
[info] All tests passed.
[success] Total time: 5 s, completed Nov 2, 2015 2:21:52 PM</code></pre>
<p></p>

<p>
Using <em>File -&gt; Open…</em> in IntelliJ 14, the project can be imported using the following wizard settings:
</p>

<p>
<img src="/images/scala_2_11_sbt_project_dialogue.png" height="752" width="585">
</p>