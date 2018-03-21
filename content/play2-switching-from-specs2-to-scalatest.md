---
date: 2015-12-31T16:13:00+01:00
lastmod: 2015-12-31T16:13:00+01:00
title: "Play2: Switching from specs2 to ScalaTest"
description: "This post describes how to migrate the default test cases that ship with Play 2.4 from specs2 to ScalaTest."
authors: ["manuelkiessling"]
slug: 2015/12/31/play2-switching-from-specs2-to-scalatest
---

<p>
The following applies to Play 2.4 projects for Scala 2.11.
</p>

<p>
When setting up a Play2 Scala project, two test case files are created automatically: <code class="inline">test/ApplicationSpec.scala</code> and <code class="inline">test/IntegrationSpec.scala</code>. The testcases therein are based on <a href="https://etorreborre.github.io/specs2/">specs2</a>. If you prefer to write your test cases using <a href="http://www.scalatest.org/">ScalaTest</a> (I certainly do), then you need to proceed as follow:
</p>

<p>
Change the <em>libraryDependencies</em> in file <code class="inline">build.sbt</code> from:
</p>

<p>
</p><pre><code>libraryDependencies ++= Seq(
  jdbc,
  cache,
  ws,
  specs2 % Test
)</code></pre>
<p></p>

<p>to:</p>

<p>
</p><pre><code>libraryDependencies ++= Seq(
  jdbc,
  cache,
  ws,
  "org.scalatestplus" %% "play" % "1.4.0-M4" % "test"
)</code></pre>
<p></p>

<p>
Next, change file <code class="inline">test/ApplicationSpec.scala</code> from:
</p>

<p>
</p><pre><code>import org.specs2.mutable._
import org.specs2.runner._
import org.junit.runner._

import play.api.test._
import play.api.test.Helpers._

/**
 * Add your spec here.
 * You can mock out a whole application including requests, plugins etc.
 * For more information, consult the wiki.
 */
@RunWith(classOf[JUnitRunner])
class ApplicationSpec extends Specification {

  "Application" should {

    "send 404 on a bad request" in new WithApplication{
      route(FakeRequest(GET, "/boum")) must beSome.which (status(_) == NOT_FOUND)
    }

    "render the index page" in new WithApplication{
      val home = route(FakeRequest(GET, "/")).get

      status(home) must equalTo(OK)
      contentType(home) must beSome.which(_ == "text/html")
      contentAsString(home) must contain ("Your new application is ready.")
    }
  }
}</code></pre>
<p></p>

<p>to:</p>

<p>
</p><pre><code>import play.api.test._
import play.api.test.Helpers._
import org.scalatestplus.play._

class ApplicationSpec extends PlaySpec with OneAppPerSuite {

  "Application" should {

    "send 404 on a bad request" in {
      val Some(wrongRoute) = route(FakeRequest(GET, "/boum"))

      status(wrongRoute) mustBe NOT_FOUND
    }

    "render the index page" in {
      val Some(home) = route(FakeRequest(GET, "/"))

      status(home) mustBe OK
      contentType(home) mustBe Some("text/html")
      contentAsString(home) must include ("Your new application is ready.")
    }
  }

}</code></pre>
<p></p>




<p>
Finally, change file <code class="inline">test/IntegrationSpec.scala</code> from:
</p>

<p>
</p><pre><code>import org.specs2.mutable._
import org.specs2.runner._
import org.junit.runner._

import play.api.test._
import play.api.test.Helpers._

/**
 * add your integration spec here.
 * An integration test will fire up a whole play application in a real (or headless) browser
 */
@RunWith(classOf[JUnitRunner])
class IntegrationSpec extends Specification {

  "Application" should {

    "work from within a browser" in new WithBrowser {

      browser.goTo("http://localhost:" + port)

      browser.pageSource must contain("Your new application is ready.")
    }
  }
}</code></pre>
<p></p>

<p>to:</p>

<p>
</p><pre><code>import org.scalatestplus.play._

class IntegrationSpec extends PlaySpec with OneBrowserPerSuite with OneServerPerSuite with HtmlUnitFactory {

  "Application" should {

    "work from within a browser" in {

      go to "http://localhost:" + port

      pageSource must include ("Your new application is ready.")
    }
  }
}</code></pre>
<p></p>

<p>
You can also see all neccessary changes in one diff at <a href="https://github.com/journeymonitor/analyze/compare/4ef3694...763ff0f">https://github.com/journeymonitor/analyze/compare/4ef3694…763ff0f</a>.
</p>
