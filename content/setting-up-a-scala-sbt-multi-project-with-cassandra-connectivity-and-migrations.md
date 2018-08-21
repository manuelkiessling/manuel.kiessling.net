---
date: 2015-01-19T16:13:00+01:00
lastmod: 2015-01-19T16:13:00+01:00
title: "Setting up a Scala sbt multi-project with Cassandra connectivity and migrations"
description: "This is a from-the-trenches tutorial about some of the first things I have managed to understand about and build with Scala. My goal is to provide a detailed step-by-step tutorial which shows how to set up a new Scala project with two sub-modules (one being plain old Scala, one being based on Play2) using sbt. I’ll also describe how to enable both modules to speak with an Apache Cassandra database, and how to add automatically applied database migrations (in order to allow using the project in a Continuous Delivery setup like the one we use at Galeria Kaufhof)."
authors: ["manuelkiessling"]
slug: 2015/01/19/setting-up-a-scala-sbt-multi-project-with-cassandra-connectivity-and-migrations
---

<p>This is a cross-post from <a href="https://galeria-kaufhof.github.io/tutorials/2015/01/14/setting-up-a-scala-sbt-multi-project-with-cassandra-connectivity-and-migrations/">the official Galeria Kaufhof Technology Blog</a></p>
<p><em>I have learned the following through the great support and advice of my coworkers Jens Müller and
<a href="https://twitter.com/martin_grotzke">Martin Grotzke</a>.</em></p>

<h2 id="about">About</h2>

<p>I have recently joined the new
multi-channel retail eCommerce project at Galeria Kaufhof in Cologne. This meant diving head-first into
<a href="http://www.inoio.de/blog/2014/09/20/technologie-sprung-bei-galeria-kaufhof/">a large-scale Scala/Play/Akka/Ruby software ecosystem</a>,
and as a consequence, a lot of learning (and unlearning, and disorientation, and some first small successes), as I’m
still quite new to Scala.</p>

<p>Thus, this is a from-the-trenches tutorial about some of the first things I have managed to understand and build. My
goal is to provide a detailed step-by-step tutorial which shows how to set up a new Scala project with two sub-modules
(one being plain old Scala, one being based on Play2) using <code class="inline">sbt</code>. I’ll also describe how to enable
both modules to speak with an Apache Cassandra database, and how to add automatically applied database migrations
(in order to allow using the project in a Continuous Delivery setup like the one we use at Galeria Kaufhof).</p>

<p>This tutorial is well suited for reasonably experienced software developers with some first basic experience in Scala
and Cassandra.</p>

<h2 id="prerequisites">Prerequisites</h2>

<p>The project setup we are going to create is based on Java 8, Scala 2.11, sbt 0.13 and Cassandra 2.1.</p>

<p>You’ll need a working Scala environment (on Mac OS X with Homebrew, <code class="inline">brew install scala sbt</code> should do the job). You’ll
also need a running and reachable Cassandra installation – setting this up is out of the
scope of this text, but
<a href="http://christopher-batey.blogspot.de/2013/05/installing-cassandra-on-mac-os-x.html">this tutorial</a> might be a good
start if you are using Mac OS X, and there is also
<a href="http://wiki.apache.org/cassandra/GettingStarted">the official Getting Started page</a>.</p>

<h2 id="setting-things-up">Setting things up</h2>

<p>Our first topic is to create the basic project structure, where we end up having two sub-projects which are both managed
through one central <code class="inline">build.sbt</code> file.</p>

<p>Let’s start by creating a directory for our project: <code class="inline">mkdir myproject</code>. Within this directory, we need to create a
<code class="inline">build.sbt</code> file. We need to fill it with the following content:</p>

<pre><code>name := "My Project"

val commonSettings = Seq(
  organization := "net.example",
  version := "0.1",
  scalaVersion := "2.11.4",
  scalacOptions := Seq("-unchecked", "-deprecation", "-encoding", "utf8")
)

lazy val common = project.in(file("common"))
  .settings(commonSettings:_*)

lazy val playApp = project.in(file("playApp"))
  .settings(commonSettings:_*)

lazy val main = project.in(file("."))
  .aggregate(common, playApp)
</code></pre>

<p>This is kind of a minimum required configuration, but it’s already sufficient to give us an <code class="inline">sbt</code> project which consists
of two sub-projects: <strong>common</strong> and <strong>playApp</strong>. For each of these, we defined in which folder the code for the project
resides, and which settings apply – in this case, we share a common set of settings.</p>

<p>Note how we really defined three projects: <strong>main</strong> is the container project which aggregates our two sub-projects.
We will later see how this simplifies certain steps of the development workflow.</p>

<h2 id="using-sbt-with-sub-projects">Using sbt with sub-projects</h2>

<p>Even with this basic setup, we can already explore how <code class="inline">sbt</code> behaves in a multi-project setup:</p>

<pre><code>$ sbt
[info] Set current project to My Project (in build file:/Users/manuelkiessling/myproject/)

&gt; project common
[info] Set current project to common (in build file:/Users/manuelkiessling/myproject/)

&gt; test
[info] Updating {file:/Users/manuelkiessling/myproject/}common...
[info] Resolving jline#jline;2.12 ...
[info] Done updating.
[success] Total time: 2 s, completed 30.12.2014 19:31:31

&gt; project main
[info] Set current project to My Project (in build file:/Users/manuelkiessling/myproject/)

&gt; test
[info] Updating {file:/Users/manuelkiessling/myproject/}main...
[info] Updating {file:/Users/manuelkiessling/myproject/}common...
[info] Updating {file:/Users/manuelkiessling/myproject/}playApp...
[info] Resolving jline#jline;2.12 ...
[info] Done updating.
[info] Resolving org.fusesource.jansi#jansi;1.4 ...
[info] Done updating.
[success] Total time: 1 s, completed 30.12.2014 19:40:29
</code></pre>

<p>As you can see, the <code class="inline">sbt</code> console allows us to switch between sub-projects using the <code class="inline">project</code> command. We can change
into one of the sub-projects, and when executing the <code class="inline">test</code> command, it is run in the context of the chosen
sub-project. When we do not switch into a sub-project (or switch back to the main project using <code class="inline">project main</code>), running
<code class="inline">test</code> leads to the <em>test</em> command being executed for each of our sub-projects.</p>

<h2 id="some-first-code">Some first code</h2>

<p>Let’s now add some actual code to our <code class="inline">common</code> sub-project. We will put general-purpose code, which is
going to be used in all other projects, into <code class="inline">common</code>. The boilerplate code which allows to connect to Cassandra
instances is a good example.</p>

<p>To do so, we first need to create the required folder structures:</p>

<pre><code>mkdir -p common/src/test/scala/common/utils/cassandra
mkdir -p common/src/main/scala/common/utils/cassandra
</code></pre>

<p>First, we will create a case class that represents a Cassandra connection URI. Let’s write a <em>scalatest</em> spec for it,
which resides in file <code class="inline">common/src/test/scala/common/utils/cassandra/CassandraConnectionUriSpec.scala</code>:</p>

<pre><code>package common.utils.cassandra

import org.scalatest.{Matchers, FunSpec}

class CassandraConnectionUriSpec extends FunSpec with Matchers {

  describe("A Cassandra connection URI object") {
    it("should parse a URI with a single host") {
      val cut = CassandraConnectionUri("cassandra://localhost:9042/test")
      cut.host should be ("localhost")
      cut.hosts should be (Seq("localhost"))
      cut.port should be (9042)
      cut.keyspace should be ("test")
    }
    it("should parse a URI with additional hosts") {
      val cut = CassandraConnectionUri(
        "cassandra://localhost:9042/test" +
          "?host=otherhost.example.net" +
          "&amp;host=yet.anotherhost.example.com")
      cut.hosts should contain allOf ("localhost", "otherhost.example.net", "yet.anotherhost.example.com")
      cut.port should be (9042)
      cut.keyspace should be ("test")
    }
  }

}
</code></pre>

<p>Creating this spec leads to <code class="inline">common</code> depending on the <em>scalatest</em> library. We need to declare this dependency in our
<code class="inline">build.sbt</code> file. Because we are going to use <em>scalatest</em> in all our submodules, it makes sense to put the dependency
declaration into a <code class="inline">val</code> which can be reused:</p>

<pre><code>name := "My Project"

val commonSettings = Seq(
  organization := "net.example",
  version := "0.1",
  scalaVersion := "2.11.4",
  scalacOptions := Seq("-unchecked", "-deprecation", "-encoding", "utf8")
)

lazy val testDependencies = Seq (
  "org.scalatest" %% "scalatest" % "2.2.0" % "test"
)

lazy val common = project.in(file("common"))
  .settings(commonSettings:_*)
  .settings(libraryDependencies ++= testDependencies)

lazy val playApp = project.in(file("playApp"))
  .settings(commonSettings:_*)

lazy val main = project.in(file("."))
  .aggregate(common, playApp)
</code></pre>

<p>Now, starting <code class="inline">sbt</code>, switching to <code class="inline">project common</code>, and running <code class="inline">test</code> will of course still yield an error, because the
spec is against a still missing implementation. Let’s change that by putting the following into
<code class="inline">common/src/test/scala/common/utils/cassandra/CassandraConnectionUri.scala</code>:</p>

<pre><code>package common.utils.cassandra

import java.net.URI

case class CassandraConnectionUri(connectionString: String) {

  private val uri = new URI(connectionString)

  private val additionalHosts = Option(uri.getQuery) match {
    case Some(query) =&gt; query.split('&amp;').map(_.split('=')).filter(param =&gt; param(0) == "host").map(param =&gt; param(1)).toSeq
    case None =&gt; Seq.empty
  }

  val host = uri.getHost
  val hosts = Seq(uri.getHost) ++ additionalHosts
  val port = uri.getPort
  val keyspace = uri.getPath.substring(1)

}
</code></pre>

<p>Running <code class="inline">test</code> in the sbt console will now result in a first successful test run:</p>

<pre><code>$ sbt
[info] Set current project to My Project (in build file:/Users/manuelkiessling/myproject/)
&gt; project common
[info] Set current project to common (in build file:/Users/manuelkiessling/myproject/)
&gt; test
[info] Compiling 1 Scala source to /Users/manuelkiessling/myproject/common/target/scala-2.11/test-classes...
[info] CassandraConnectionUriSpec:
[info] A Cassandra connection URI object
[info] - should parse a URI with a single host
[info] - should parse a URI with additional hosts
[info] Run completed in 352 milliseconds.
[info] Total number of tests run: 2
[info] Suites: completed 1, aborted 0
[info] Tests: succeeded 2, failed 0, canceled 0, ignored 0, pending 0
[info] All tests passed.
[success] Total time: 6 s, completed 02.01.2015 11:36:45
</code></pre>

<h2 id="connecting-to-cassandra">Connecting to Cassandra</h2>

<p>The next step is to add code that actually connects to Cassandra. This will lay the ground for adding automatic
database migrations to the project. But first things first. Here is the code for an object which provides a method
that returns a Cassandra database connection session; put it into
<code class="inline">common/src/test/scala/common/utils/cassandra/Helper.scala</code>:</p>

<pre><code>package common.utils.cassandra

import com.datastax.driver.core._

object Helper {

  def createSessionAndInitKeyspace(uri: CassandraConnectionUri,
                                   defaultConsistencyLevel: ConsistencyLevel = QueryOptions.DEFAULT_CONSISTENCY_LEVEL) = {
    val cluster = new Cluster.Builder().
      addContactPoints(uri.hosts.toArray: _*).
      withPort(uri.port).
      withQueryOptions(new QueryOptions().setConsistencyLevel(defaultConsistencyLevel)).build

    val session = cluster.connect
    session.execute(s"USE ${uri.keyspace}")
    session
  }

}
</code></pre>

<p>This is a relatively straight-forward implementation which can be used like this:</p>

<pre><code>import common.utils.cassandra._

val uri = CassandraConnectionUri("cassandra://localhost:9042/test")
val session = Helper.createSessionAndInitKeyspace(uri)

session.execute(/* Some CQL string */)
</code></pre>

<p>We need to add the Cassandra driver to our dependencies, making <code class="inline">build.sbt</code> look like this:</p>

<pre><code>name := "My Project"

val commonSettings = Seq(
  organization := "net.example",
  version := "0.1",
  scalaVersion := "2.11.4",
  scalacOptions := Seq("-unchecked", "-deprecation", "-encoding", "utf8")
)

lazy val testDependencies = Seq (
  "org.scalatest" %% "scalatest" % "2.2.0" % "test"
)

lazy val cassandraDependencies = Seq (
  "com.datastax.cassandra" % "cassandra-driver-core" % "2.1.2"
)

lazy val common = project.in(file("common"))
  .settings(commonSettings:_*)
  .settings(libraryDependencies ++= (testDependencies ++ cassandraDependencies))

lazy val playApp = project.in(file("playApp"))
  .settings(commonSettings:_*)

lazy val main = project.in(file("."))
  .aggregate(common, playApp)
</code></pre>

<p>Let’s see how we can make use of this in a spec in order to prove that we can actually talk to our database. To do so,
please create the file <code class="inline">common/src/test/scala/common/utils/cassandra/ConnectionAndQuerySpec.scala</code> and add the following
code:</p>

<pre><code>package common.utils.cassandra

import com.datastax.driver.core.querybuilder.QueryBuilder
import com.datastax.driver.core.querybuilder.QueryBuilder._
import org.scalatest.{Matchers, FunSpec}

class ConnectionAndQuerySpec extends FunSpec with Matchers {

  describe("Connecting and querying a Cassandra database") {
    it("should just work") {
      val uri = CassandraConnectionUri("cassandra://localhost:9042/test")
      val session = Helper.createSessionAndInitKeyspace(uri)

      session.execute("CREATE TABLE IF NOT EXISTS things (id int, name text, PRIMARY KEY (id))")
      session.execute("INSERT INTO things (id, name) VALUES (1, 'foo');")

      val selectStmt = select().column("name")
        .from("things")
        .where(QueryBuilder.eq("id", 1))
        .limit(1)

      val resultSet = session.execute(selectStmt)
      val row = resultSet.one()
      row.getString("name") should be("foo")
      session.execute("DROP TABLE things;")
    }
  }

}
</code></pre>

<p>Now, there is one thing that needs to be done that is outside of the scope of our code, and that is the creation of the
Cassandra keyspace. Please do this manually using the <code class="inline">cqlsh</code>:</p>

<pre><code>CREATE KEYSPACE IF NOT EXISTS test WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 };
</code></pre>

<p>Running <code class="inline">test</code> once again from within <code class="inline">sbt</code> should yield a successful spec run.</p>

<h2 id="integrating-pillar-for-database-migrations">Integrating Pillar for database migrations</h2>

<p>We are now at a point where we can add automatic database migrations for Cassandra. We will use an existing library for
this named <a href="https://github.com/comeara/pillar">Pillar</a>, and we’ll add some wrapper and helper code in order to integrate
it into our project.</p>

<p>The first thing to do is to add the <em>Pillar</em> library as a dependency in our <code class="inline">build.sbt</code> file. This results in the
<em>cassandraDependencies</em> block being changed from</p>

<pre><code>lazy val cassandraDependencies = Seq (
  "com.datastax.cassandra" % "cassandra-driver-core" % "2.1.2"
)
</code></pre>

<p>to</p>

<pre><code>lazy val cassandraDependencies = Seq (
  "com.datastax.cassandra" % "cassandra-driver-core" % "2.1.2",
  "com.chrisomeara" % "pillar_2.11" % "2.0.1"
)
</code></pre>

<p>Next, we need some helper code. What we need is a method which allows to read the contents of a directory, no matter
if this directory resides in the file system or within a JAR file. Greg Briggs has written a nice little class for this
which we are going to use:</p>

<pre><code>package common.utils.cassandra;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLDecoder;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Set;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

public class JarUtils {

    /**
     * List directory contents for a resource folder. Not recursive.
     * This is basically a brute-force implementation.
     * Works for regular files and also JARs.
     *
     * @param clazz Any java class that lives in the same place as the resources you want.
     * @param path  Should end with "/", but not start with one.
     * @return Just the name of each member item, not the full paths.
     * @throws java.net.URISyntaxException
     * @throws java.io.IOException
     * @author Greg Briggs
     */
    public static String[] getResourceListing(Class clazz, String path) throws URISyntaxException, IOException {
        URL dirURL = clazz.getClassLoader().getResource(path);
        if (dirURL != null &amp;&amp; dirURL.getProtocol().equals("file")) {
        /* A file path: easy enough */
            return new File(dirURL.toURI()).list();
        }

        if (dirURL == null) {
        /*
         * In case of a jar file, we can't actually find a directory.
         * Have to assume the same jar as clazz.
         */
            String me = clazz.getName().replace(".", "/") + ".class";
            dirURL = clazz.getClassLoader().getResource(me);
        }

        if (dirURL.getProtocol().equals("jar")) {
        /* A JAR path */
            String jarPath = dirURL.getPath().substring(5, dirURL.getPath().indexOf("!")); //strip out only the JAR file
            JarFile jar = new JarFile(URLDecoder.decode(jarPath, "UTF-8"));
            Enumeration&lt;JarEntry&gt; entries = jar.entries(); //gives ALL entries in jar
            Set&lt;String&gt; result = new HashSet&lt;String&gt;(); //avoid duplicates in case it is a subdirectory
            while (entries.hasMoreElements()) {
                String name = entries.nextElement().getName();
                if (name.startsWith(path)) { //filter according to the path
                    String entry = name.substring(path.length());
                    int checkSubdir = entry.indexOf("/");
                    if (checkSubdir &gt;= 0) {
                        // if it is a subdirectory, we just return the directory name
                        entry = entry.substring(0, checkSubdir);
                    }
                    result.add(entry);
                }
            }
            return result.toArray(new String[result.size()]);
        }

        throw new UnsupportedOperationException("Cannot list files for URL " + dirURL);
    }

}
</code></pre>

<p>Note that this is Java code, not Scala. We therefore need to put it into
<code class="inline">common/src/main/java/common/utils/cassandra/JarUtils.java</code>.</p>

<p>Next up is some wrapper code that gives us an easy to handle <em>Pillar</em> object to work with from our own code. This one
goes into <code class="inline">common/src/main/scala/common/utils/casssandra/Pillar.scala</code>:</p>

<pre><code>package common.utils.cassandra

import com.chrisomeara.pillar._
import com.datastax.driver.core.Session

object Pillar {

  private val registry = Registry(loadMigrationsFromJarOrFilesystem())
  private val migrator = Migrator(registry)

  private def loadMigrationsFromJarOrFilesystem() = {
    val migrationsDir = "migrations/"
    val migrationNames = JarUtils.getResourceListing(getClass, migrationsDir).toList.filter(_.nonEmpty)
    val parser = Parser()

    migrationNames.map(name =&gt; getClass.getClassLoader.getResourceAsStream(migrationsDir + name)).map {
      stream =&gt;
        try {
          parser.parse(stream)
        } finally {
          stream.close()
        }
    }.toList
  }

  def initialize(session: Session, keyspace: String, replicationFactor: Int): Unit = {
    migrator.initialize(
      session,
      keyspace,
      new ReplicationOptions(Map("class" -&gt; "SimpleStrategy", "replication_factor" -&gt; replicationFactor))
    )
  }

  def migrate(session: Session): Unit = {
    migrator.migrate(session)
  }
}
</code></pre>

<p>We can now approach running our very first migration. Let’s create the file carrying the migration statements first. It
goes into <code class="inline">/common/src/main/resources/migrations/1_create_things_table.cql</code>:</p>

<pre><code>-- description: create things table
-- authoredAt: 1418718253000
-- up:

CREATE TABLE things (
  id int,
  name text,
  PRIMARY KEY (id)
);

-- down:

DROP TABLE things;
</code></pre>

<p>Note that the <code class="inline">authoredAt</code> field is important. Migrations are applied in ascending order according to the value of this
field. Its format is <em>milliseconds since start of the Unix epoch</em>.</p>

<p>Now we need a place where migrations are actually applied. One solution is to do this right after connecting
to the database, which might not be the most sensible solution in a production environment, but does the job for the
scope of this tutorial.</p>

<p>We achieve this by simply adding two lines to our <em>Helper</em> object in
<code class="inline">common/src/main/scala/common/utils/casssandra/Helper.scala</code>:</p>

<pre><code>package common.utils.cassandra

import com.datastax.driver.core._

object Helper {

  def createSessionAndInitKeyspace(uri: CassandraConnectionUri,
                                   defaultConsistencyLevel: ConsistencyLevel = QueryOptions.DEFAULT_CONSISTENCY_LEVEL) = {
    val cluster = new Cluster.Builder().
      addContactPoints(uri.hosts.toArray: _*).
      withPort(uri.port).
      withQueryOptions(new QueryOptions().setConsistencyLevel(defaultConsistencyLevel)).build

    val session = cluster.connect
    session.execute(s"USE ${uri.keyspace}")

    Pillar.initialize(session, uri.keyspace, 1)
    Pillar.migrate(session)

    session
  }

}
</code></pre>

<p>We can now change our <em>ConnectionAndQuery</em> spec in file
<code class="inline">common/src/test/scala/common/utils/cassandra/ConnectionAndQuerySpec.scala</code>, because we no longer need to create the
table we test against within the spec itself – our migration will take care of this:</p>

<pre><code>package common.utils.cassandra

import com.datastax.driver.core.querybuilder.QueryBuilder
import com.datastax.driver.core.querybuilder.QueryBuilder._
import org.scalatest.{Matchers, FunSpec}

class ConnectionAndQuerySpec extends FunSpec with Matchers {

  describe("Connecting and querying a Cassandra database") {
    it("should just work") {
      val uri = CassandraConnectionUri("cassandra://localhost:9042/test")
      val session = Helper.createSessionAndInitKeyspace(uri)

      session.execute("INSERT INTO things (id, name) VALUES (1, 'foo');")

      val selectStmt = select().column("name")
        .from("things")
        .where(QueryBuilder.eq("id", 1))
        .limit(1)

      val resultSet = session.execute(selectStmt)
      val row = resultSet.one()
      row.getString("name") should be("foo")
      session.execute("TRUNCATE things;")
    }
  }

}
</code></pre>

<h2 id="setting-up-the-play-sub-project">Setting up the Play sub-project</h2>

<p>Now that we have all the boilerplate code we need for talking to Cassandra and applying migrations, let’s actually set
up a simple Play application in our <em>playApp</em> sub-project.</p>

<p>The easiest way to do so is by using Typesafe’s <em>activator</em> tool. On Mac OS X, a simple
<code class="inline">brew install typesafe-activator</code> will get you started. Refer to
<a href="https://typesafe.com/get-started">the Typesafe homepage</a> for other options.</p>

<p>Once installed, you can run the following at the root level of our <em>myproject</em> folder structure:</p>

<pre><code>activator new playApp play-scala
</code></pre>

<p>Note that you need to remove the folder <code class="inline">playApp</code> beforehand, in case it already exists.</p>

<p>This will create an application skeleton of a Play application. However, it comes with its own <code class="inline">build.sbt</code>, and we need
to transfer its settings to our central multi-project <code class="inline">build.sbt</code>. As a result, the <code class="inline">myproject/build.sbt</code> file needs to
look like this:</p>

<pre><code>name := "My Project"

val commonSettings = Seq(
  organization := "net.example",
  version := "0.1",
  scalaVersion := "2.11.4",
  scalacOptions := Seq("-unchecked", "-deprecation", "-encoding", "utf8")
)

lazy val testDependencies = Seq (
  "org.scalatest" %% "scalatest" % "2.2.0" % "test"
)

lazy val cassandraDependencies = Seq (
  "com.datastax.cassandra" % "cassandra-driver-core" % "2.1.2",
  "com.chrisomeara" % "pillar_2.11" % "2.0.1"
)

lazy val playDependencies = Seq (
  jdbc,
  anorm,
  cache,
  ws
)

lazy val common = project.in(file("common"))
  .settings(commonSettings:_*)
  .settings(libraryDependencies ++= (testDependencies ++ cassandraDependencies))

lazy val playApp = project.in(file("playApp"))
  .settings(commonSettings:_*)
  .settings(libraryDependencies ++= (testDependencies ++ cassandraDependencies ++ playDependencies))
  .enablePlugins(PlayScala)

lazy val main = project.in(file("."))
  .aggregate(common, playApp)
</code></pre>

<p>As you can see, we added a <code class="inline">playDependencies</code> val and make use of it in our <code class="inline">playApp</code> project configuration. We also
enabled the <code class="inline">PlayScala</code> plugin on the project. In order to make this work, we need to elevate the sbt plugin
configuration file (which has been created by the <code class="inline">activator</code> setup) from the <code class="inline">playApp</code> folder to the root folder of our
project:</p>

<pre><code>mv playApp/project/plugins.sbt ./project/
</code></pre>

<p>With this, we can now remove the sbt stuff from the sub-project folder:</p>

<p>rm playApp/build.sbt
rm -rf playApp/project</p>

<p>We should now be able to start a test run via <code class="inline">sbt</code> that runs the tests in both sub-projects, and we should be able to
run the Play application in the <em>playApp</em> sub-project (I have removed some of the output for the sake of brevity):</p>

<pre><code>$ sbt
[info] Loading project definition from /Users/manuelkiessling/myproject/project
[info] Set current project to My Project (in build file:/Users/manuelkiessling/myproject/)
&gt; test
[info] CassandraConnectionUriSpec:
[info] A Cassandra connection URI object
[info] - should parse a URI with a single host
[info] - should parse a URI with additional hosts
[info] ConnectionAndQuerySpec:
[info] Connecting and querying a Cassandra database
[info] - should just work
[info] All tests passed.
[info] ApplicationSpec
[info]
[info] Application should
[info] + send 404 on a bad request
[info] + render the index page
[info]
[info] IntegrationSpec
[info]
[info] Application should
[info] + work from within a browser
[success] Total time: 10 s, completed 14.01.2015 19:10:23
&gt; project playApp
[info] Set current project to playApp (in build file:/Users/manuelkiessling/myproject/)
[playApp] $ run

--- (Running the application, auto-reloading is enabled) ---

[info] play - Listening for HTTP on /0:0:0:0:0:0:0:0:9000
</code></pre>

<p>Great. Now let’s finally make use of the fact that we do have a multi-project setup: Let’s use code from the <code class="inline">common</code>
module in our Play application. The most straight-forward way to do so is by using the Cassandra utility code during the
startup of the Play app in order to connect to the Cassandra server – this way our Pillar migrations are applied when
our application starts.</p>

<p>Doing this is simple: all we need to do is add a <code class="inline">Global.scala</code> file to the <code class="inline">app</code> folder of the Play application
folder (i.e.: <code>myproject/playApp/app/Global.scala</code>) where we override the <code class="inline">onStart</code> method of the <code class="inline">Global</code> object with
code that connects to the database:</p>

<pre><code>import common.utils.cassandra.{Helper, CassandraConnectionUri}
import play.api._

object Global extends GlobalSettings {

  override def onStart(app: Application) {

    val cassandraUri = CassandraConnectionUri("cassandra://localhost:9042/test")
    Helper.createSessionAndInitKeyspace(cassandraUri)

  }

}
</code></pre>

<p>This, however, won’t compile, because the <em>playApp</em> module won’t be able to find the classes in the <em>common</em> module all
by itself – it needs a hint in our <code class="inline">build.sbt</code> file:</p>

<pre><code>name := "My Project"

val commonSettings = Seq(
  organization := "net.example",
  version := "0.1",
  scalaVersion := "2.11.4",
  scalacOptions := Seq("-unchecked", "-deprecation", "-encoding", "utf8")
)

lazy val testDependencies = Seq (
  "org.scalatest" %% "scalatest" % "2.2.0" % "test"
)

lazy val cassandraDependencies = Seq (
  "com.datastax.cassandra" % "cassandra-driver-core" % "2.1.2",
  "com.chrisomeara" % "pillar_2.11" % "2.0.1"
)

lazy val playDependencies = Seq (
  jdbc,
  anorm,
  cache,
  ws
)

lazy val common = project.in(file("common"))
  .settings(commonSettings:_*)
  .settings(libraryDependencies ++= (testDependencies ++ cassandraDependencies))

lazy val playApp = project.in(file("playApp"))
  .settings(commonSettings:_*)
  .settings(libraryDependencies ++= (testDependencies ++ cassandraDependencies ++ playDependencies))
  .enablePlugins(PlayScala)
  .dependsOn(common)

lazy val main = project.in(file("."))
  .aggregate(common, playApp)
</code></pre>

<p>Adding the <code class="inline">.dependsOn(common)</code> method call to the <code class="inline">playApp</code> val does the job.</p>

<p>With this, we can add another migration, in file
<code class="inline">myproject/common/src/main/resources/migrations/2_add_count_column_to_things_table.cql</code>…:</p>

<pre><code>-- description: add count column to things table
-- authoredAt: 1421266233000
-- up:

ALTER TABLE things ADD color text;

-- down:

ALTER TABLE things DROP color;
</code></pre>

<p>…and have it applied by running the Play app…:</p>

<pre><code>$ sbt
[info] Loading project definition from /Users/manuelkiessling/myproject/project
[info] Set current project to My Project (in build file:/Users/manuelkiessling/myproject/)
&gt; project playApp
[info] Set current project to playApp (in build file:/Users/manuelkiessling/myproject/)
[playApp] $ run

--- (Running the application, auto-reloading is enabled) ---

[info] play - Listening for HTTP on /0:0:0:0:0:0:0:0:9000

(Server started, use Ctrl+D to stop and go back to the console...)
</code></pre>

<p>…and requesting <code class="inline">http://localhost:9000/</code> (Play only actually runs the application when requests come in).</p>

<p>And that’s it, we now have an sbt multi-project setup with Cassandra connectivity and Pillar migrations. It’s a very
rudimentary and naïve implementation, but should be adequate to get you started.</p>

<p>PS: In case you would like to work on a large-scale Scala and Cassandra project:
<a href="http://www.wir-lieben-ecommerce.de/">we are hiring</a>.</p>
