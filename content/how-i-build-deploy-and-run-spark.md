---
date: 2015-10-17T16:13:00+01:00
lastmod: 2015-10-17T16:13:00+01:00
title: "How I build, deploy, and run Spark"
description: " I’m currently tinkering with Spark for my side project JourneyMonitor. The goal is to extract useful metrics from the Selenium runs executed by the platform. To do so, I’m currently in the process of creating a new Analyze component. I want to build the Spark setup and the jobs using Scala 2.11. Therefore, I had to compile my own version of Spark 1.5.1, put it onto the systems, and run a cluster from that. This post describes what worked for me."
authors: ["manuelkiessling"]
slug: 2015/10/17/how-i-build-deploy-and-run-spark
---

<p>
I’m currently tinkering with Spark for my side project <a href="http://www.journeymonitor.com/">JourneyMonitor</a>. The goal is to extract useful metrics from the Selenium runs executed by the platform.
</p>

<p>
To do so, I’m currently in the process of creating a new <em>Analyze</em> component. I want to build the Spark setup and the jobs using Scala 2.11. Therefore, I had to compile my own version of Spark 1.5.1, put it onto the systems, and run a cluster from that. This post describes what worked for me.
</p>

<p>
As of this writing, there is no pre-built version of Spark 1.5.1 for Scala 2.11. Therefore, I downloaded the <em>Source Code</em> package from <a href="http://spark.apache.org/downloads.html">the official Spark download page</a> and unpacked it, which resulted in folder <em>spark-1.5.1</em>.
</p>

<p>
The version of Java installed on my Mac OS X 10.11 (El Capitan) system is the official Oracle Standard Edition Java version 1.8.0_25-b17. I had to manually set the <em>JAVA_HOME</em> environment variable in my bash session via <code class="inline">export JAVA_HOME=$(/usr/libexec/java_home)</code>.
</p>

<p>
Spark builds via Maven, thus I installed that using Homebrew via <code class="inline">brew install maven</code>.
</p>

<p>
Afterwards, I changed into the <em>spark-1.5.1</em> folder and ran <code class="inline">./dev/change-scala-version.sh 2.11</code>. I was then able to start building my own Spark 1.5.1 package for Scala 2.11 by running:
</p>

<p>
</p><pre><code>./make-distribution.sh --name hadoop-2.6_scala-2.11 --tgz -Pyarn -Phadoop-2.6 -Dscala-2.11 -DskipTests</code></pre>
<p></p>

<p>
This took a while and resulted in file <em>spark-1.5.1-bin-hadoop-2.6_scala-2.11.tgz</em> in the <em>spark-1.5.1</em> root folder. It contains a fully self-contained installation of Spark for Scala 2.11 including helper scripts and such – I’ve made the archive available at <a href="https://bintray.com/journeymonitor/infra-artifacts/spark-1.5.1-bin-hadoop-2.6_scala-2.11/view#files">the JourneyMonitor <em>infra-artifacts</em> repository on Bintray</a>. Installing Spark now was simply a matter of extracting the archive to the desired target folder.
</p>

<p>
From this folder, it’s now simple to start up a local cluster with a master process and one worker (or slave) process:
</p>

<p>
</p><pre><code>./sbin/start-master.sh --host 127.0.0.1
./sbin/start-slave.sh spark://127.0.0.1:7077</code></pre>
<p></p>

<p>
In order to test-run a Spark application on this cluster, I created a simple Spark app as described in <a href="http://spark.apache.org/docs/latest/quick-start.html">the Spark Quick Start guide</a>, but with two changes: in <em>build.sbt</em>, I changed <em>scalaVersion</em> to <em>2.11.7</em>, and added <code class="inline">% "provided"</code> to the end of the <em>libraryDependencies</em> line, because when a Spark application runs on a Spark cluster, the cluster provides the <em>spark-core</em> dependency, and there is no need to integrate it into the package of the application itself.
</p>

<p>
You can view the SimpleApp source code on <a href="https://github.com/journeymonitor/analyze/tree/b86149775da110a4b6f8a8846deda561b5ceab76">the JourneyMonitor <em>analyze</em> repository on GitHub</a>.
</p>

<p>
In order to create the SimpleApp jar, simply run <code class="inline">sbt package</code> in the root folder of the app project folder. This results in file <em>target/scala-2.11/spark-test_2.11-1.0.jar</em>. This jar file can now be run on the cluster:
</p>

<p>
</p><pre><code>./bin/spark-submit --deploy-mode cluster --master spark://127.0.0.1:6066 PATH/TO/SIMPLEAPP/target/scala-2.11/spark-test_2.11-1.0.jar</code></pre>
<p></p>

<p>
Because the app is run on the cluster, its output is not shown on the command line. Instead, you have to visit the web UI of the worker node at http://localhost:8081/. In the <em>Finished Drivers</em> section you’ll find an entry for each job run that has been submitted, and the <em>stdout</em> link for a job run shows the output of the app.
</p>

<p>
In order to deploy the Spark package to the JourneyMonitor systems and run master and worker instances, I’m currently building a Puppet module which is available as part of <a href="https://github.com/journeymonitor/infra">the JourneyMonitor <em>infra</em> repository on GitHub</a>.
</p>

<p>
I would like to make clear that I’m still very much a beginner in this area, so don’t take this guide as a “best practice” approach. I would love to hear feedback from folks with more experience in the comments section.
</p>

<h5>Update 2016-10-27</h5>
<p>
For several month now, a small Spark cluster is up and running at the <a href="http://journeymonitor.com/">JourneyMonitor</a> project. I currently can’t spare the time for a write-up, but have a look at the Puppet manifests <a href="https://github.com/journeymonitor/infra/blob/aafd7dec56e4e3fd24af29bea55756f74116c089/puppet/modules/spark-master/manifests/init.pp">for the Spark Master</a> and <a href="https://github.com/journeymonitor/infra/blob/aafd7dec56e4e3fd24af29bea55756f74116c089/puppet/modules/spark-slave/manifests/init.pp">for the Spark Slaves</a> for some inspiration on how to get the Spark package that has been build in the course of this post up and running.
<br>
</p>
