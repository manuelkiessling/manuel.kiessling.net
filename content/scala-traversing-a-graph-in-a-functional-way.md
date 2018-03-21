---
date: 2016-02-15T16:13:00+01:00
lastmod: 2016-02-15T16:13:00+01:00
title: "Scala: Traversing a graph in a functional way"
description: "I recently played around with graphs and tried to implement Depth-First Search in a functional and recursive way. Here is what I learned."
authors: ["manuelkiessling"]
slug: 2016/02/15/scala-traversing-a-graph-in-a-functional-way
---

<p>
I recently played around with graphs and tried to implement Depth-First Search in a functional and recursive way.
</p>

<p>
In the following examples we are talking about the following simple directed unweighted graph with vertices a to e:
</p>

<p>
<a href="http://manuel.kiessling.net/images/Scala%20Graph.svg"><img width="50%" src="http://manuel.kiessling.net/images/Scala%20Graph.svg" /></a>
<br />
(click to enlarge)
</p>

<p>
Each vertex is represented by an object of the following class:
</p>

<p>
<pre><code>class Vertex() {
  val name: Char
  val edges: Set[Vertex]
}</code></pre>
</p>

<p>
Let's start with an approach that is neither functional nor recursive, but at least straight-forward:
</p>

<p>
<pre><code>def dfsMutableIterative(start: Vertex): Set[Vertex] = {
  var current: Vertex = start
  val found: mutable.Set[Vertex] = mutable.Set[Vertex]()
  val stack: mutable.Stack[Vertex] = mutable.Stack[Vertex]()
  stack.push(current)

  while (!stack.isEmpty) {
    current = stack.pop()
    if (!found.contains(current)) {
      found += current
      for (next <- current.edges) {
        stack.push(next)
      }
    }
  }
  found.toSet
}</code></pre>
</p>

<p>Here, we are working with two mutable data structures, one to track the list of vertices we have found during traversal, plus a stack that is needed to build the list of yet-to-visit vertices we encounter during traversal.</p>

<p>
Another approach is recursive, but still uses mutable state:
</p>

<p>
<pre><code>def dfsMutableRecursive(start: Vertex): Set[Vertex] = {
  val found: mutable.Set[Vertex] = mutable.Set[Vertex]()

  def recurse(current: Vertex): Unit = {
    found += current
    for (next <- current.edges) {
      if (!found.contains(next)) {
        recurse(next)
      }
    }
  }

  recurse(start)
  found.toSet
}</code></pre>
</p>

<p>
How can we solve this completely functional? We need to keep track of the vertices we have already encountered, but at the same time, we don't want to update any mutable data structures.
</p>

<p>
One way to achieve this is to use a for loop with recursion, where we pass a growing list of encountered vertices upon each recursive call:
</p>

<p>
<pre><code>def dfsFunctional(current: Vertex, acc: List[Vertex]): Set[Vertex] = {
  (for (next <- current.edges if !acc.contains(next))
    yield dfsFunctional(next, current +: acc)).flatten + current
}</code></pre>
</p>

<p>
Now, I don't know about you, by I'm always having a hard time wrapping my head around what exactly is happening during execution when recursion is involved. In order to really grasp how the above code works, I have drawn the following chart:
</p>

<p>
<a href="http://manuel.kiessling.net/images/Scala%20Graph%20DFS%20Traversal.svg"><img width="100%" src="http://manuel.kiessling.net/images/Scala%20Graph%20DFS%20Traversal.svg" /></a>
<br />
(click to enlarge)
</p>

<p>
Well, on a first look, this might make things even worse, but bear with me. If we follow the arrows, everything works out fine.
</p>

<p>
When we call the function with vertex object a and an empty list as its parameters (e.g. <code class="inline">dfsFunctional(a, Nil)</code>, given that <code class="inline">a</code> is the val holding the object for vertex 'a'), then the following happens:
</p>

<p>
We start at recursion level 0, that is, we just called our function. As parameter <code class="inline">current</code>, we passed vertex <code class="inline">a</code>, and our <code class="inline">acc</code> (for accumulator) is a list with no entries.
</p>

<p>
We now enter the for loop and iterate over the list of all edges of <code class="inline">current</code> (which we retrieve by calling <code class="inline">current.edges</code>). The for loop skips vertices that are already contained in the accumulator, but right now it doesn't contain any vertices. The first edge of vertex <code class="inline">a</code> is directed at vertex <code class="inline">b</code>, thus we recurse with <code class="inline">current</code> set to <code class="inline">b</code>, and <code class="inline">acc</code> set to <code class="inline">List(a)</code>, because we prepend the existing accumulator with our current vertex (<code class="inline">current +: acc</code>).
</p>

<p>
In the chart, this leads to recursive <em>call 1</em>, abbreviated as <code class="inline">1: call(b,(a))</code> on the first black arrow, which is the equivalent to the code call <code class="inline">dfsFunctional(b, List(a))</code>.
</p>

<p>
Vertex <code class="inline">b</code> doesn't have any edges, and thus, the for loop is not entered. Instead, the call immediately returns with a return value of <code class="inline">List(b)</code> (abbreviated as <code class="inline">(b)</code> on the first green arrow). Note how the <code class="inline">.flatten + current</code> code is not part of the for loop! Instead, it is applied to the Sets yielded by the for loop, and evaluates to a set containing all vertices from recursive calls (if they occur) plus the vertex that is currently handled.
</p>

<p>
With this we return back to recursion level 0, and because following <code class="inline">b</code> the next vertex pointed at by an edge from <code class="inline">a</code> is <code class="inline">c</code>, we recurse again, which leads to <code class="inline">2: call(c,(a))</code>, that is, <code class="inline">dfsFunctional</code> is now called with <code class="inline">c</code> as the <code class="inline">current</code> vertex, and the accumulated list of vertices we know about at level 0 is still only <code class="inline">List(a)</code>.
</p>

<p>
From <code class="inline">c</code> we have to recurse again, because <code class="inline">c</code> points at <code class="inline">e</code>, which leads to recursion level 2. Here things get a bit more interesting, because <code class="inline">e</code> points to <code class="inline">f</code> and <code class="inline">d</code>, and <code class="inline">d</code> points back to <code class="inline">c</code> - that is, the <code class="inline">c -> e -> d -> c</code> part of the graph creates a loop.
</p>

<p>
But that's not a problem thanks to our accumulator, as can be seen in call 5 on level 3: Here, we investigate <code class="inline">d</code>, and would recurse to <code class="inline">c</code>, but this is prevented because <code class="inline">c</code> is already in the accumulator.
</p>

<p>
Each recursion returns a set of the results of further recursions (if any) plus the current vertex, and if you follow thw green arrows, you see how this adds up: calls 4 and 5 on level 3 return <code class="inline">f</code> and <code class="inline">d</code>, respectively, which are returned on level 2 together with <code class="inline">e</code>. These are then joined by <code class="inline">c</code> on level 1. Level 0 started two recursions, with call 1 resulting in <code class="inline">b</code> and call 2 resulting in <code class="inline">f, d, e, c</code>. Because level 0 returns these two sets plus the initial vertex <code class="inline">a</code>, we end up with a set of all vertices, <code class="inline">b, f, d, e, c, a</code>.
</p>

<p>
The recursive approach using <code class="inline">for</code> works well and doesn't use mutable state, but compared to <code class="inline">dfsMutableRecursive</code>, it is not as time efficient. For the given incomplex graph, this doesn't show, but for a slightly more complex graph like this one:
</p>

<p>
<a href="http://manuel.kiessling.net/images/Scala%20Graph%20complex.svg"><img width="50%" src="http://manuel.kiessling.net/images/Scala%20Graph%20complex.svg" /></a>
<br />
(click to enlarge)
</p>

<p>
it quickly shows: <code class="inline">dfsMutableRecursive</code> needs to recurse 6 times, while <code class="inline">dfsFunctional</code> needs to recurse 14 times.
</p>

<p>
But we can further improve our functional approach. A recursive solution exists that is as efficient as the one using mutable state, where we make use of <code class="inline">foldLeft</code>. As a bonus, we get rid of the <code class="inline">flatten</code> call that was necessary in <code class="inline">dfsFunctional</code>:
</p>

<p>
<pre><code>def dfsFunctionalFold(current: Vertex, acc: Set[Vertex]): Set[Vertex] = {
  current.edges.foldLeft(acc) {
    (results, next) =>
      if (results.contains(next)) results
      else dfsFunctionalFold(next, results + current)
  } + current
}</code></pre>
</p>

<p>
On the complex graph, this also needs to recurse only 6 times, and is - just as <code class="inline">dfsMutableRecursive</code> - stable in regards to the number of vertices: For any given 6-vertices graph, the number of recursions is 6, and grows to 13 for a 13-vertices graph, while <code class="inline">dfsFunctional</code> grows to 30 recursions.
</p>
