---
date: 2016-02-04T16:13:00+01:00
lastmod: 2016-02-04T16:13:00+01:00
title: "Puppet: Evaluating defined types for each element in an array in a non-brittle way"
description: "Passing an array when declaring a defined type automatically evaluates the defined type once for each element of the array, but care must be taken if no array is declared in the Hiera structure for a given target system."
authors: ["manuelkiessling"]
slug: 2016/02/04/puppet-evaluating-defined-types-for-each-element-in-an-array-in-a-non-brittle-way
---

<p>
In <a href="https://github.com/journeymonitor/infra/blob/2675efcc91f89ecc1d521e92af10629ed7c85a59/puppet/modules/cronjobs/manifests/init.pp">one of the JourneyMonitor puppet manifests</a>, we have a <em>defined type</em> that allows us to dynamically create cronjob files on target machines:
</p>

<p>
</p><pre><code>define createCronjobFile {
  file { "/etc/cron.d/journeymonitor-${name}":
    owner   =&gt; "root",
    group   =&gt; "root",
    mode    =&gt; "0644",
    content =&gt; template("cronjobs/etc/cron.d/journeymonitor-${name}.erb"),
  }
}</code></pre>
<p></p>

<p>
Let’s assume that we have a system where we want to end up having cronjobs <code class="inline">/etc/cron.d/journeymonitor-foo</code> and <code class="inline">/etc/cron.d/journeymonitor-bar</code>.
</p>

<p>
This is achieved by defining an array in Hiera like this:
</p>

<p>
</p><pre><code>cronjobs:
  - foo
  - bar</code></pre>
<p></p>

<p>
and then passing it to <code class="inline">createCronjobFile</code> upon declaration:
</p>

<p>
</p><pre><code>
$cronjobs = hiera_array("cronjobs");

createCronjobFile { $cronjobs: }</code></pre>
<p></p>

<p>
The nice thing here is that Puppet unfolds the array for us, that is, we do not need to loop over the array entries explicitly – instead, <code class="inline">createCronjobFile</code> is automatically evaluated once for each entry in the array.
</p>

<p>
(In case this isn’t clear: passing a value before the colon when declaring a defined type makes this value available as parameter <code class="inline">$name</code> in the defined type.)
</p>

<p>
However, this implementation is brittle. If, for a given target system, no <em>cronjobs</em> array has been defined in the Hiera structure, then the above manifest will fail with <code class="inline">Could not find data item cronjobs in any Hiera data file and no default supplied</code>.
</p>

<p>
The solution is to make <code class="inline">hiera_array</code> return an empty array if <em>cronjobs</em> is not defined (by providing the empty array <code class="inline">[]</code> as the second parameter to <code class="inline">hiera_array</code>), and to check for an empty array before declaring <code class="inline">createCronjobFile</code>:
</p>

<p>
</p><pre><code>$cronjobs = hiera_array("cronjobs");

if $cronjobs != [] {
  createCronjobFile { $cronjobs: }
}</code></pre>
<p></p>

<p>
The <code class="inline">if</code> clause is necessary because an empty array unfortunately doesn’t result in <code class="inline">createCronjobFile</code> being declared zero times, as one might expect – it is declared with the empty string for parameter <code class="inline">$name</code>, which isn’t what we want.
</p>
