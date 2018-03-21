---
date: 2015-12-07T16:13:00+01:00
lastmod: 2015-12-07T16:13:00+01:00
title: "Upgrading a Symfony project from 2.6 to 3.0"
description: "Symfony 3.0 has been released recently, and I wanted to upgrade my side project JourneyMonitor, which was still based on Symfony 2.6, as quickly as possible. This post explains how I approached the upgrade, and shows which parts of the project structure and code had to be changed in order to get the project working again."
authors: ["manuelkiessling"]
slug: 2015/12/07/upgrading-a-symfony-project-from-2-6-to-3-0
---

<h2>About this post</h2>

<p>
<a href="http://symfony.com/blog/symfony-3-0-0-released">Symfony 3.0 has been released</a> recently, and I wanted to upgrade my side project <a href="http://journeymonitor.com">JourneyMonitor</a>, which was still based on Symfony 2.6, as quickly as possible.
</p>

<p>
This post explains how I approached the upgrade, and shows which parts of the project structure and code had to be changed in order to get the project working again.
</p>


<h2>Preparing the upgrade</h2>

<p>
The code base for the project – the CONTROL component of the JourneyMonitor project – lives at <a href="https://github.com/journeymonitor/control/">https://github.com/journeymonitor/control/</a>. As you can see in <a href="https://github.com/journeymonitor/control/blob/3223fb000f72f749b783c157cd632f370a31c9fa/composer.json#L13">an older revision of file <em>composer.json</em></a>, it was based on Symfony 2.6, and several other dependencies. In order to find out how exactly I would have to change the versions of these dependencies, I updated the <a href="https://github.com/symfony/symfony-installer">Symfony Installer</a> to the latest version and created a new Symfony 3.0 project via <code class="inline">symfony new foo 3.0</code> – it served as a reference only and was later thrown away. I compared its <code class="inline">composer.json</code> file with the one from my project, and changed the latter accordingly. You can <a href="https://github.com/journeymonitor/control/compare/64c9f63...5be5f63?diff=split&amp;name=5be5f63#diff-14">view the exact changes side-by-side at Github</a>.
</p>

<p>
Afterwards, I ran <code class="inline">composer --with-dependencies update</code>.
</p>


<h2>Changing the project structure</h2>

<p>
Symfony 3.0 introduces a new project directory structure. Some (but not all) of the stuff that used to live below <code class="inline">app/</code> now lives either in a new folder, <code class="inline">var/</code>, or in <code class="inline">bin/</code>. I git moved <code class="inline">app/console</code> to <code class="inline">bin/console</code>, and then copied the <code class="inline">bin/console</code> script from the <em>foo</em> project to <code class="inline">bin/console</code> in my project. Then, I moved <code class="inline">app/SymfonyRequirements.php</code> to <code class="inline">var/SymfonyRequirements.php</code>, and moved <code class="inline">app/cache</code> and <code class="inline">app/logs</code> to <code class="inline">var/</code>.
</p>

<p>
The path changes had to be reflected in several files, and <code class="inline">app/autoload.php</code> now often takes the role of <code class="inline">bootstrap.php.cache</code> – see <a href="https://github.com/journeymonitor/control/compare/64c9f63...5be5f63?diff=split&amp;name=5be5f63#diff-0">here</a>, <a href="https://github.com/journeymonitor/control/compare/64c9f63...5be5f63?diff=split&amp;name=5be5f63#diff-16">here</a>, and <a href="https://github.com/journeymonitor/control/compare/64c9f63...5be5f63?diff=split&amp;name=5be5f63#diff-27">here</a> for example.
</p>


<h2>Fixing the code</h2>

<p>
At this point, the project did not work anymore, and what followed was the grunt work of changing the code. You can see all changes that had to be made <a href="https://github.com/journeymonitor/control/compare/64c9f63...5be5f63?diff=split&amp;name=5be5f63">in this side-by-side diff</a>. Here are some of the more interesting parts:
</p>

<p>
</p><ul>

<li><a href="https://github.com/journeymonitor/control/compare/64c9f63...5be5f63?diff=split&amp;name=5be5f63#diff-bf0e70bcef1a5d5b2f87289220a51108">Bootstrap form theming config changed</a></li>

<li><a href="https://github.com/journeymonitor/control/compare/64c9f63...5be5f63?diff=split&amp;name=5be5f63#diff-0808406b2b1d4f0adf09886756c1d9a6">_configurator route no longer exists</a></li>

<li><a href="https://github.com/journeymonitor/control/compare/64c9f63...5be5f63?diff=split&amp;name=5be5f63#diff-da1af97fca8a5fcb6fb7053584105ba7">security.yml: csrf_provider removed, remember_me “key” is now “secret”</a></li>

<li><a href="https://github.com/journeymonitor/control/compare/64c9f63...5be5f63?diff=split&amp;name=5be5f63#diff-f5fc7a0c95a8ac0821192d8eb102a87e">YAML files now expect quotes where they previously didn’t</a></li>

<li><a href="https://github.com/journeymonitor/control/compare/64c9f63...5be5f63?diff=split&amp;name=5be5f63#diff-979c1ea9a70b1c9ebd5fbd6c35c8474d">Forms are now created using class names instead of instances</a></li>

<li><a href="https://github.com/journeymonitor/control/compare/64c9f63...5be5f63?diff=split&amp;name=5be5f63#diff-961fbeaec2c2c4aa63d12a00cded0e4a">Form types now work with class names instead of strings</a></li>

<li><a href="https://github.com/journeymonitor/control/compare/64c9f63...5be5f63?diff=split&amp;name=5be5f63#diff-961fbeaec2c2c4aa63d12a00cded0e4aL17">The <em>choice</em> form element now expects the key-value mapping of its choices the other way round</a> (thanks Craig Rayner for pointing this out)</li>

<li><a href="https://github.com/journeymonitor/control/compare/64c9f63...5be5f63?diff=split&amp;name=5be5f63#diff-ee3b627c49c65de9fe80561cfb0d746a">Service definitions for repositories changed a lot</a></li>

<li><a href="https://github.com/journeymonitor/control/compare/64c9f63...5be5f63?diff=split&amp;name=5be5f63#diff-bf0e70bcef1a5d5b2f87289220a51108R18">This makes the ominous <em>Unknown “asset” function in “@Twig/Exception/exception_full.html.twig</em> error go away</a></li>

</ul>
<p></p>

<p>
Finding the root cause of some of the errors did cost some nerves, but was worth it. At the end, the number of changes that had to be made turned out tractable. <a href="http://journeymonitor.com/">JourneyMonitor</a> now happily hums along on top of Symfony 3.0.
</p>

<p>
<strong>Update December 14, 2015:</strong>
</p>

<p>
Although the project was running flawlessly after the changes described above, some minor changes were still missing.
</p>

<p>
At Symfony 2.6, the tests for the AppBundle live at <code class="inline">src/AppBundle/Tests</code>, and they need to move to <code class="inline">tests/AppBundle</code>. Accordingly, the namespace of the test classes changes from <code class="inline">AppBundle\Tests</code> to <code class="inline">Tests\AppBundle</code>. See <a href="https://github.com/journeymonitor/control/commit/c7f5f2c25ab18d8b085c2784e9107b06f4bf4b85">changeset c7f5f2c</a> for details.
</p>

<p>
Another detail is that <code class="inline">AppKernel.php</code> no longer needs to be required explicitly, and for the production environment, one should include the bootstrap cache. See <a href="https://github.com/journeymonitor/control/commit/90c919001652d817e0e91839ff64c2e618c2bf0f">changeset 90c9190</a> for details.
</p>