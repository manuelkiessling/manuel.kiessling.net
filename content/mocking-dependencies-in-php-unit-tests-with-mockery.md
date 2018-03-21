---
date: 2014-05-08T16:13:00+01:00
lastmod: 2014-05-08T16:13:00+01:00
title: "Mocking Dependencies in PHP Unit Tests with Mockery"
description: "The PHP library Mockery allows to use a simulated version of certain objects within unit tests, usable where objects are passed into methods as dependencies. This form of simulation is called mocking. The following example shows how mocking enables us to test methods that depend on a database without the need for a real database when running our tests."
authors: ["manuelkiessling"]
slug: 2014/05/08/mocking-dependencies-in-php-unit-tests-with-mockery
---

<p>
<em>The following solution is based on the work of my coworker Marcel Frank.</em>
</p>

<p>
The PHP library <a href="https://github.com/padraic/mockery">Mockery</a> allows to use a simulated version of certain objects within unit tests, where objects are passed into methods as dependencies. This form of simulation is called <em>mocking</em>.
</p>

<p>
Instead of trying to explain why simulating these objects in the tests makes sense, I will try to illustrate the need for it with an example.
</p>

<p>
The following class is responsible for getting news headlines from a database and returning an array of these headlines in a certain format. It has its own share of logic, but clearly depends on a database connection object in order to do its job:
</p>

<p>
</p><pre><code>class NewsReader
{
    public function getAllHeadlinesUppercase(\Doctrine\DBAL\Connection $dbConnection)
    {
        $headlines = array();

        $statement = $dbConnection-&gt;executeQuery('SELECT headline FROM news ORDER BY id DESC');

        while ($row = $statement-&gt;fetch()) {
            $headlines[] = strtoupper($row['headline']);
        }

        return $headlines;
    }
}</code></pre>
<p></p>

<p>
The dependency on the <em>\Doctrine\DBAL\Connection</em> object makes it difficult to test this class: preferably, we would like to only test the behaviour of the method itself: does it query the database, and does it transform (and return) the result as it should? It would be overkill, and actually quite annoying, if we had to set up an actual database server that has the table we need, which in turn would need to have some useful sample data, only to make sure that this simple method behaves correctly.
</p>

<p>
The solution here is to pass a simulation of <em>$dbConnection</em> into this method, instead of the real thing. The real thing needs a real database to do its job – the simulation, or <em>mock</em>, of a <em>\Doctrine\DBAL\Connection</em> looks and feels like a real connection object, but its behaviour is only a realistic fake. This way, <em>getAllHeadlinesUppercase</em> can use it, but we don’t need the database infrastructure for our test.
</p>

<p>
Let’s first look how a unit test for our class would look like if we would <em>not</em> use mocking:
</p>

<p>
</p><pre><code>class NewsReaderTest extends \PHPUnit_Framework_TestCase
{
    public function testGetAllHeadlinesUppercase()
    {
        $dbConnection = ... // Do whatever is needed to create a real connection to a real database

        $newsReader = new NewsReader();

        $expectedHeadlines = array('FIRST HEADLINE', 'SECOND HEADLINE');
        $actualHeadlines = $newsReader-&gt;getAllHeadlinesUppercase($dbConnection);

        $this-&gt;assertEqual($expectedHeadlines, $actualHeadlines);
    }
}</code></pre>
<p></p>

<p>
Straight forward, but as said, it would need a running database that carried the two headlines in order to work.
</p>

<p>
Here is a version of the test where we replace the database connection object with a mock:
</p>

<p>
</p><pre><code>class NewsReaderTest extends \PHPUnit_Framework_TestCase
{
    public function testGetAllHeadlinesUppercase()
    {
<span class="highlight">        $mockedDbConnection = \Mockery::mock('\Doctrine\DBAL\Connection');

        $mockedStatement = \Mockery::mock('\Doctrine\DBAL\Driver\Statement');

        $mockedDbConnection
            -&gt;shouldReceive('executeQuery')
            -&gt;with('SELECT headline FROM news ORDER BY id DESC')
            -&gt;andReturn($mockedStatement);

        $mockedRows = array(
            array('headline' =&gt; 'First headline'),
            array('headline' =&gt; 'Second headline')
        );

        $mockedStatement
            -&gt;shouldReceive('fetch')
            -&gt;andReturnUsing(function () use (&amp;$mockedRows) {
                $row = current($mockedRows);
                next($mockedRows);
                return $row;
            });</span>

        $newsReader = new NewsReader();

        $expectedHeadlines = array('FIRST HEADLINE', 'SECOND HEADLINE');
        $actualHeadlines = $newsReader-&gt;getAllHeadlinesUppercase(<span class="highlight">$mockedDbConnection</span>);

        $this-&gt;assertEquals($expectedHeadlines, $actualHeadlines);
    }
}</code></pre>

<p>
Let's work through it step by step in order to understand what is happening.
</p>

<p>
We start by building our mock objects. First <em>$mockedDbConnection</em>; to do so, we call <em>Mockery::mock</em>, which returns a mock object based on the class name we pass it.
</p><p>

</p><p>
We also need to mock a <em>\Doctrine\DBAL\Driver\Statement</em> object, because <em>getAllHeadlinesUppercase</em> will call <em>$mockedDbConnection::executeQuery</em> which returns a statement object of this type; subsequently, <em>getAllHeadlinesUppercase</em> calls <em>fetch</em> on this statement object, and therefore, this has to be simulated, too.
</p>

<p>
Now comes the interesting part: we programatically define the behaviour of our simulated objects. Things that would "just happen" if we had a real database need to be defined by us now - this makes our mocks behave realistically enough so <em>getAllHeadlinesUppercase</em> won't realize the difference and take the simulation objects for the real thing.
</p>

<p>
<em>Mockery</em> provides a nice API for defining simulated behaviour. Let's have a closer look at the first definition:
</p>

<p>
</p><pre><code>        $mockedDbConnection
            -&gt;shouldReceive('executeQuery')
            -&gt;with('SELECT headline FROM news ORDER BY id DESC')
            -&gt;andReturn($mockedStatement);</code></pre>
<p>

</p><p>
What happens here is: we define how the <em>$mockedDbConnection</em> object will behave when its method <em>executeQuery</em> is called. We also implicitly express an expectation: we expect <em>getAllHeadlinesUppercase</em> to call this method with a certain parameter (the query), and if it would call <em>executeQuery</em> differently, then Mockery would make our test case fail.
</p>

<p>
We also declare what <em>executeQuery</em> should return if it is called. The real object would return a real statement object - our mock will return a mocked statement object, which is set up as follows:
</p>

<p>
</p><pre><code>        $mockedRows = array(
            array('headline' =&gt; 'First headline'),
            array('headline' =&gt; 'Second headline')
        );

        $mockedStatement
            -&gt;shouldReceive('fetch')
            -&gt;andReturnUsing(function () use (&amp;$mockedRows) {
                $row = current($mockedRows);
                next($mockedRows);
                return $row;
            });</code></pre>
<p></p>

<p>
The code using our mocks still expects rows to be returned when calling <em>fetch()</em> on the statement object. We simulate this behaviour by iterating through an array we declare right in our test case, which gives us full control over the data the code-under-test receives.
</p>

<p>
What then follows is the test case as we know it. We instantiate the <em>newsReader</em> object, and this time, we pass it our prepared mock database connection object instead of the real one:
</p>

<p>
</p><pre><code>        $newsReader = new NewsReader();

        $expectedHeadlines = array('FIRST HEADLINE', 'SECOND HEADLINE');
        $actualHeadlines = $newsReader-&gt;getAllHeadlinesUppercase(<span class="highlight">$mockedDbConnection</span>);

        $this-&gt;assertEquals($expectedHeadlines, $actualHeadlines);</code></pre>
<p></p>

<p>
As said, the bonus achievement here is that not only can we simulate a database and verify that the <em>getAllHeadlinesUppercase</em> method does the right thing in the face of a given set of table rows, we also verify that it correctly queries the database. In case you change the <em>SELECT</em> statement, either the expected one in the test case or the actual one in the <em>getAllHeadlinesUppercase</em> method, Mockery will throw an exception because it can no longer find a matching method definition call in the mock setup.
</p>
