---
date: 2015-12-09T16:13:00+01:00
lastmod: 2015-12-09T16:13:00+01:00
title: "Adding a Play2 application as a sub-project to an existing sbt project"
description: "Already working on an sbt-based Scala project with two sub-projects, I wanted to create a third sub-project, a Play2 application. This post describes what worked for me."
authors: ["manuelkiessling"]
slug: 2015/12/09/adding-a-play2-application-as-a-sub-project-to-an-existing-sbt-project
---

<h2>About this post</h2>

<p>
Already working on an sbt-based Scala project with two sub-projects, I wanted to create a third sub-project, a Play2 application. The following describes what worked for me.
</p>


<h2>Creating the sub-project structure</h2>

<p>
Before adding the third sub-project, my sbt project structure looked like this:
</p>

<p>
</p><pre><code>importer/
└  src/
   ├  main/
   └  test/
spark/
└  src/
   ├  main/
   └  test/
project/
└  plugins.sbt

build.sbt</code></pre>
<p></p>

<p>
Within <code class="inline">build.sbt</code>, the sub-projects where declared as follows (shortened for brevity):
</p>

<p>
</p><pre><code>name := "journeymonitor-analyze"

val commonSettings = Seq(
  organization := "com.journeymonitor",
  version := "0.1"
)

lazy val testDependencies = Seq (
  "org.scalatest" %% "scalatest" % "2.2.4" % "test"
)

lazy val cassandraDependencies = Seq (
  "com.datastax.cassandra" % "cassandra-driver-core" % "2.1.8",
  "com.chrisomeara" % "pillar_2.11" % "2.0.1"
)

lazy val spark = project
  .settings(commonSettings:_*)
  .settings(libraryDependencies ++= (testDependencies))

lazy val importer = project
  .settings(commonSettings:_*)
  .settings(libraryDependencies ++= (testDependencies ++ cassandraDependencies))

lazy val main = project.in(file("."))
  .aggregate(spark, importer)</code></pre>
<p></p>

<p>
I wanted to name the new sub-project “api”, and it should reside in a folder of the same name.
</p>

<p>
First, I installed the TypeSafe Activator onto my Mac OS X system via <code class="inline">brew install typesafe-activator</code>. Next, I changed to the root folder of my project, and ran <code class="inline">activator new api play-scala</code>. This resulted in the following structure:
</p>

<p>
</p><pre><code>api/
├  build.sbt
├  api/
├  conf/
├  public/
├  test/
└  project/
   └  plugins.sbt
importer/
└  src/
   ├  main/
   └  test/
spark/
└  src/
   ├  main/
   └  test/
project/
└  plugins.sbt

build.sbt</code></pre>
<p></p>

<p>
Next, I added the content of the newly added <code class="inline">api/project/plugins.sbt</code> to the existing <code class="inline">project/plugins.sbt</code> file, and removed the former. Then, I extended the existing <code class="inline">build.sbt</code> file as follows:
</p>

<p>
</p><pre><code>name := "journeymonitor-analyze"

val commonSettings = ...

lazy val testDependencies = ...

lazy val cassandraDependencies = ...

lazy val spark = project ...

lazy val importer = project ...

lazy val api = project
  .settings(commonSettings:_*)
  .settings(assemblyJarName in assembly := "journeymonitor-analyze-api-assembly.jar")

lazy val main = project.in(file("."))
  .aggregate(spark, importer, api)</code></pre>
<p></p>

<p>
This declares the <em>api</em> sub-project and applies the <em>commonSettings</em> to it, but doesn’t configure it further. This happens via the sub-project specific configuration in file <code class="inline">api/build.sbt</code>:
</p>

<p>
</p><pre><code>name := """api"""

version := "1.0-SNAPSHOT"

enablePlugins(PlayScala)

scalaVersion := "2.11.7"

libraryDependencies ++= Seq(
  jdbc,
  cache,
  ws,
  specs2 % Test
)

resolvers += "scalaz-bintray" at "http://dl.bintray.com/scalaz/releases"

routesGenerator := InjectedRoutesGenerator</code></pre>
<p></p>

<p>
The above shows two changes that were necessary: on line 5, the <em>val</em> declaration needs to be removed, leaving only the <em>enablePlugins</em> call, and on line 7, I changed the <em>scalaVersion</em> from <em>“2.11.6″</em> to <em>“2.11.7″</em>.
</p>

<p>
With this, I was now able to run <code class="inline">sbt</code> from the root folder, switch to the new sub-project within sbt via <code class="inline">project api</code>, and successfully run the Play2 test suite via <code class="inline">test</code>.
</p>

<p>
<a href="https://github.com/journeymonitor/analyze/commit/4a899b07cb9637142b849975babec8579a5a066f">Commit 4a899b0 on the journeymonitor/analyze repo</a> on GitHub shows the differences before and after adding the new sub-project.
</p>
