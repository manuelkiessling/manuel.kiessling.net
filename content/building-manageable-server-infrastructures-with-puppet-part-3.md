---
date: 2014-03-26T14:13:00+01:00
lastmod: 2014-03-26T14:13:00+01:00
title: "Building manageable server infrastructures with Puppet: Part 3"
description: "Part 3 of the series shows how to extend the first simple manifest developed in the previous part into a more complex one, and how to structure it into a generic and reusable module."
authors: ["manuelkiessling"]
slug: 2014/03/26/building-manageable-server-infrastructures-with-puppet-part-3
canonical: https://develop-build-deploy.com/archived/building-manageable-server-infrastructures-with-puppet-part-3/
---

<h2>About</h2>
<p>
In <a href="/2014/03/26/building-manageable-server-infrastructures-with-puppet-part-2/">Part 2 of <em>Building manageable server infrastructures with Puppet</em></a>, we started to configure our <em>puppetclient</em> machine by writing a first, simple manifest on the Puppet master. We are now going to look at more complex configuration setups and we’ll learn how to put our manifests into a useful structure.
</p>

<h2>Modules</h2>
<p>
Keeping the managed configuration for a server infrastructure in just one file won’t scale well once this infrastructure grows beyond a handful of systems. An infrastructure with several servers that fullfill different roles can become complex, and we want to use Puppet to tame this complexity. To achieve this, we need to keep the information in our manifests clean and orderly.
</p>

<p>
One way to do this is to separate the manifests into modules. A module is a collection of one or more manifests that belong together because they serve the same puprose. A typical example for a module is a collection of manifests that enable a target machine to serve web pages through the Apache HTTP server. This module would assemble several manifests that take care of the different configuration aspects that need to be managed in order to provide a fully functional web server: software package installation, config file management, and service management.
</p>

<p>
We will create such a module now. Once finished, it will take care of providing a fully operational web server on the <em>puppetclient</em> machine.
</p>

<h2>Module folder structure</h2>
<p>
From an outside perspective, a Puppet module is simply a certain folder structure containing certain files. If you put the right files into the right folder structure, then the manifests within this structure can be referenced from within other manifests.
</p>

<p>
Let’s demonstrate this by moving the relevant parts from our first simple manifest – which we wrote in part 2 – into a module. Then, we will reference this modularized manifest from within our main manifest <em>site.pp</em>, instead of having the manifest declaration directly within <em>site.pp</em>.
</p>

<p>
Of course, our first manifest is just a “Hello World” example. Therefore, let’s call the module <em>helloworld</em>.
</p>

<p>
To do so, simply create a folder <em>/etc/puppet/modules/helloworld/manifests</em> on the <em>puppetserver</em> system:
</p>

<p>
<span class="filename beforecode">On the puppetserver VM</span>
</p><pre><code>~# <strong>sudo mkdir -p /etc/puppet/modules/helloworld/manifests</strong></code></pre>
<p></p>

<p>
Besides the manifests themselves, modules also carry the files associated with them, in a subfolder <em>files</em>. Let’s create it, and move our <em>helloworld.txt</em> file into it:
</p>

<p>
<span class="filename beforecode">On the puppetserver VM</span>
</p><pre><code>~# <strong>sudo mkdir -p /etc/puppet/modules/helloworld/files</strong>
~# <strong>sudo mv /etc/puppet/files/helloworld.txt /etc/puppet/modules/helloworld/files/</strong>
</code></pre>
<p></p>

<p>
Now we need to create the main manifest file of our new module. Put the following content into <em>/etc/puppet/modules/helloworld/manifests/init.pp</em>:
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/helloworld/manifests/init.pp on puppetserver</span>
</p><pre><code>class helloworld {

  file { "/home/ubuntu/helloworld.txt":
    ensure =&gt; file,
    owner  =&gt; "ubuntu",
    group  =&gt; "ubuntu",
    mode   =&gt; 0644,
    source =&gt; "puppet://puppetserver/modules/helloworld/helloworld.txt"
  }

}</code></pre>
<p></p>

<p>
As you can see, this is basically our original <em>file</em> configuration block, but it is now enclosed in a <em>class</em> block, and the path to the <em>helloworld.txt</em> file has changed. In Puppet manifests, a class block is the place where configuration blocks can be <em>defined</em>, for using them elsewhere later. That was not the case while the <em>file</em> block was part of our node definition – we defined it as part of the node, but it was also evaluated there. A class itself doesn’t actually do anything; it is set in motion only if it is <em>declared</em> elsewhere. We can declare our newly defined class within our <em>node</em> block by <em>including</em> it:
</p>

<p>
<span class="filename beforecode">/etc/puppet/manifests/site.pp on puppetserver</span>
</p><pre><code>node "puppetclient" {

  include helloworld

}</code></pre>
<p></p>

<p>
Instead of carrying the configuration block directly, our node definition now only references the block as defined in our new <em>helloworld</em> class, which in turn is part of our new <em>helloworld</em> module. Having all the <em>helloworld</em>-related configuration in a module gives us much more flexibility. Imagine we had a cluster of hundreds of nodes, and all of them are supposed to receive the <em>helloworld</em> configuration. We could copy-paste our node configuration block, but that wouldn’t scale well. The <em>helloworld</em> module, however, is reusable. It can be included in an arbitrary number of <em>node</em> blocks.
</p>

<p>
We have now restructured our existing configuration setup. That doesn’t change the actual configuration catalogue, however. Running the agent once again on the <em>puppetclient</em> system proves this:
</p>

<p>
<span class="filename beforecode">On the puppetclient VM</span>
</p><pre><code>~# <strong>sudo puppet agent --verbose --no-daemonize --onetime</strong>

info: Caching catalog for puppetclient
info: Applying configuration version '1396287576'
notice: Finished catalog run in 0.05 seconds</code></pre>
<p></p>

<p>
Because the expected configuration still matches the actual situation, no action is taken by the agent.
</p>

<p>
Here is an overview of the new structure in <em>/etc/puppet</em> regarding our manifests:
</p>

<p>
</p><pre><code>files

manifests
  site.pp

modules
  helloworld
    manifests
      init.pp
    files
      helloworld.txt</code></pre>
<p></p>

<h2>A first real module: apache2</h2>
<p>
Now, enough with those boring Hello World examples I say. Let’s set up a real web server on <em>puppetclient</em>.
</p>

<p>
We start by renaming the <em>helloworld</em> module, because we no longer need it. We are going to use the <em>apache2</em> Ubuntu package to build our webserver, so we can as well call the new module <em>apache2</em>:
</p>

<p>
<span class="filename beforecode">On the puppetserver VM</span>
</p><pre><code>~# <strong>sudo mv /etc/puppet/modules/helloworld /etc/puppet/modules/apache2</strong></code></pre>
<p></p>

<p>
A fully featured <em>apache2</em> Puppet module has to take care of several aspects: it must ensure that certain software packages are installed, it must take care of several configuration files, it must make sure that the http daemon service is running (and restart it whenever there is a change to the server’s configuration).
</p>

<p>
The good news is that Puppet modules can be further divided into multiple classes. This helps us to keep those different concerns of a module cleanly separated. It’s not that Puppet itself needs this separation; it just makes it easier for us in the long run.
</p>

<p>
We will touch the existing <em>init.pp</em> manifest file of the module last. We will instead start by creating a manifest file called <em>install.pp</em> in folder <em>/etc/puppet/modules/apache2/manifests</em>. In this file, we will take care of having the right software packages installed:
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/apache2/manifests/install.pp on puppetserver</span>
</p><pre><code>class apache2::install {

  package { [ "apache2-mpm-prefork", "apache2-utils" ]:
    ensure =&gt; present
  }

}</code></pre>
<p></p>

<p>
This introduces a new block type, <em>package</em>. We can almost read its purpose in natural language from the way it is used: We use it to <u>ensure</u> that the <u>package</u>s <u>apache2-mpm-prefork</u> and <u>apache2-utils</u> are <u>present</u> on our target system.
</p>

<p>
Also, note the new syntax used for naming the class. The double-colon introduces a namespace into our class structure. The main class for the module is <em>apache2</em> (we will use this class name in our init.pp manifest), but further classes exist that live in the <em>apache2</em> namespace. They can be named however we like – <em>install</em> probably is a sensible name for a manifest that takes care of installation issues.
</p>

<p>
As explained earlier, Puppet does all the heavy lifting for us and utilizes <em>apt-get</em> in order to fullfill our expectation of having these software packages in question installed.
</p>

<p>
Now, installing these packages actually is enough if all you want is a running webserver. We will take it a step further, though, and will take care of the configuration of our webserver, too.
</p>

<h2>Templates and variables</h2>
<p>
To do so, let’s create the next class, <em>apache2::config</em>, in file <em>/etc/puppet/modules/apache2/manifests/config.pp</em>:
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/apache2/manifests/config.pp on puppetserver</span>
</p><pre><code>class apache2::config {

  file { "/etc/apache2/sites-available/${hostname}.conf":
    mode    =&gt; 0644,
    owner   =&gt; "root",
    group   =&gt; "root",
    content =&gt; template("apache2/etc/apache2/sites-available/vhost.conf.erb")
  }

}</code></pre>
<p></p>

<p>
This looks similar to the <em>file</em> block we already encountered, but also has some significant differences. It introduces two new concepts: variables and templates (and, as we will see, variables <em>in</em> templates).
</p>

<p>
Variables are a powerful tool and allow us to write more intelligent manifests. As you can see, the file path itself is parametrized through the <em>hostname</em> variable, which resolves to the <em>fully qualified domain name</em> of the target host. The hostname of our <em>puppetclient</em>system is, of course, <em>puppetclient</em>:
</p>

<p>
<span class="filename beforecode">On the puppetclient VM</span>
</p><pre><code>~# <strong>hostname</strong>

puppetclient</code></pre>
<p></p>

<p>
This means that when our manifest is applied on the target host, it will create the file <em>/etc/apache2/sites-available/puppetclient.conf</em>
</p>

<p>
<em>hostname</em> is one of many variables whose value Puppet determines itself. We will see how to define our own variables later in this series.
</p>

<p>
Another difference in our <em>file</em> block is the <em>content</em> statement. It differs from the <em>source</em> statement we encountered earlier in that it refers not to a static file, but to an <em>embedded ruby</em> template. A static file is simply transferred from the puppet master to its clients; a template file is dynamic and may contain variables (which are replaced with their values) and statements (which are evaluated).
</p>

<p>
Let’s look at file <em>/etc/puppet/modules/apache2/templates/etc/apache2/sites-available/vhost.conf.erb</em> on the <em>puppetserver</em> system to get an idea of how template files look:
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/apache2/templates/etc/apache2/sites-available/vhost.conf.erb on puppetserver</span>
</p><pre><code>&lt;VirtualHost *:80&gt;
  ServerName &lt;%= hostname %&gt;

  ServerAdmin webmaster@&lt;%= hostname %&gt;

  DocumentRoot /var/www

  &lt;Directory /&gt;
    Options FollowSymLinks
    AllowOverride None
  &lt;/Directory&gt;

  &lt;Directory /var/www/&gt;
    Options Indexes FollowSymLinks MultiViews
    AllowOverride All
    Order allow,deny
    allow from all
  &lt;/Directory&gt;

  ScriptAlias /cgi-bin/ /usr/lib/cgi-bin/
  &lt;Directory "/usr/lib/cgi-bin"&gt;
    AllowOverride None
    Options +ExecCGI -MultiViews +SymLinksIfOwnerMatch
    Order allow,deny
    Allow from all
  &lt;/Directory&gt;

  ErrorLog ${APACHE_LOG_DIR}/&lt;%= hostname %&gt;.error.log
  LogLevel warn

  CustomLog ${APACHE_LOG_DIR}/&lt;%= hostname %&gt;.access.log combined
&lt;/VirtualHost&gt;</code></pre>
<p></p>

<p>
As you can see, this is basically your average Apache virtual host file, but with placeholders. In this case, only one placeholder, <em>&lt;%= hostname %&gt;</em>. When the file is placed at the target file location on the target system, then every occurence of this placeholder will be replaced with the fully qualified domain name of the target system.
</p>

<p>
We could give our manifest a first try, but it has some imperfections we should first correct. The thing with Puppet manifests is that you can’t really predict the order of the application of their blocks. Puppet manifests are not batch files – they are not simply executed from top to bottom. Every block – like <em>file</em> or <em>package</em> – stands on its own. Puppet does try to decide on a sensible order of execution, but it’s not perfect. Where order is important, we need to assist Puppet.
</p>

<p>
What could possibly go wrong with our simple <em>apache2</em> manifest in regards to execution order? Well, we install a software package, and we place a file into a folder that is created by the installation process for that software package. If Puppet would try to place the virtual host file into the <em>sites-available</em> folder before this folder has been created (by installing the <em>apache2-mpm-prefork</em> package), an error would occur.
</p>

<p>
We can explain Puppet, in our manifests, if manifest blocks depend on each other. To state that the <em>file</em> block for our virtual host file depends on the installation of package <em>apache2-mpm-prefork</em> being finished, we add a <em>require</em> statement to the <file> block:
</file></p>

<p>
<span class="filename beforecode">/etc/puppet/modules/apache2/manifests/config.pp on puppetserver</span>
</p><pre><code>class apache2::config {

  file { "/etc/apache2/sites-available/${hostname}.conf":
    mode    =&gt; 0644,
    owner   =&gt; "root",
    group   =&gt; "root",
    content =&gt; template("apache2/etc/apache2/sites-available/vhost.conf.erb"),
<span class="highlight">    require =&gt; Package["apache2-mpm-prefork"]</span>
  }

}</code></pre>
<p></p>

<p>
Note that when referencing a package, we write the <em>Package</em> statement with a capital P.
</p>

<p>
With this, Puppet knows how to decide on the order of the manifests, and it will ensure that the rules from the <em>file</em> block will only apply if the <em>apache2-mpm-prefork</em> package is installed on the system.
</p>

<h2>A first test run</h2>
<p>
We now have a first working version of our <em>install</em> and <em>config</em> manifests for our <em>apache2</em> module. We now need to make sure that this module is applied on our <em>puppetclient</em> system. To do so, we first need to rewrite the main manifest of our module in <em>/etc/puppet/modules/apache2/manifests/init.pp</em>:
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/apache2/manifests/init.pp on puppetserver</span>
</p><pre><code>class apache2 {

  include apache2::install
  include apache2::config

}</code></pre>
<p></p>

<p>
Then, we need to map our new module to the <em>puppetclient</em> node in <em>/etc/puppet/manifests/site.pp</em>:
</p>

<p>
<span class="filename beforecode">/etc/puppet/manifests/site.pp on puppetserver</span>
</p><pre><code>node "puppetclient" {

  include apache2

}</code></pre>
<p></p>


<p>
<span class="filename beforecode">On the puppetclient VM</span>
</p><pre><code>~# <strong>sudo puppet agent --verbose --no-daemonize --onetime</strong>

info: Caching catalog for puppetclient
info: Applying configuration version '1396980729'
notice: /Stage[main]/Apache2::Install/Package[apache2-utils]/ensure: ensure changed 'purged' to 'present'
notice: /Stage[main]/Apache2::Install/Package[apache2-mpm-prefork]/ensure: ensure changed 'purged' to 'present'
notice: /Stage[main]/Apache2::Config/File[/etc/apache2/sites-available/puppetclient.conf]/ensure: defined content as '{md5}c55c5bd945cea21c817bca1a465b7dd3'
notice: Finished catalog run in 16.62 seconds</code></pre>
<p></p>

<p>
Well, this worked. But we have not yet reached our goal. The virtual host <em>puppetclient</em> needs to be activated. To achieve this, we only need a symbolic link from <em>/etc/apache2/sites-enabled/puppetclient.conf</em> to <em>/etc/apache2/sites-available/puppetclient.conf</em>. Another <em>file</em> type block makes this possible:
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/apache2/manifests/config.pp on puppetserver</span>
</p><pre><code>class apache2::config {

  file { "/etc/apache2/sites-available/${hostname}.conf":
    mode    =&gt; 0644,
    owner   =&gt; "root",
    group   =&gt; "root",
    content =&gt; template("apache2/etc/apache2/sites-available/vhost.conf.erb"),
    require =&gt; Package["apache2-mpm-prefork"]
  }

<span class="highlight">  file { "/etc/apache2/sites-enabled/${hostname}.conf":
    ensure  =&gt; link,
    target  =&gt; "/etc/apache2/sites-available/${hostname}.conf",
    require =&gt; File["/etc/apache2/sites-available/${hostname}.conf"]
  }</span>

}</code></pre>
<p></p>

<p>
We apply the new manifest:
</p>

<p>
<span class="filename beforecode">On the puppetclient VM</span>
</p><pre><code>~# <strong>sudo puppet agent --verbose --no-daemonize --onetime</strong>

info: Caching catalog for puppetclient
info: Applying configuration version '1396983687'
notice: /Stage[main]/Apache2::Config/File[/etc/apache2/sites-enabled/puppetclient.conf]/ensure: created
notice: Finished catalog run in 0.07 seconds</code></pre>
<p></p>

<p>
…and we are done, right? Well, in a sense, we are. Apache is installed, and our virtual host has been configured. With Puppet, however, we can do even better. What would we do if we managed the puppetclient manually? After changing the Apache configuration, we would test if it contains any errors (using <em>apachectl configtest</em>, and if not, we would restart the <em>apache2</em> service. Turns out, Puppet can do the same.
</p>

<h2>Refining the module</h2>
<p>
To make this work, we first need to teach Puppet about the <em>apache2</em> service. To do so, we need to create another manifest file on the <em>puppetserver</em> system at <em>/etc/puppet/modules/apache2/manifests/service.pp</em>:
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/apache2/manifests/service.pp on puppetserver</span>
</p><pre><code>class apache2::service {

  service { "apache2":
    ensure     =&gt; running,
    hasstatus  =&gt; true,
    hasrestart =&gt; true,
    restart    =&gt; "/usr/sbin/apachectl configtest &amp;&amp; /usr/sbin/service apache2 reload",
    enable     =&gt; true,
    require    =&gt; Package["apache2-mpm-prefork"]
  }

}</code></pre>
<p></p>

<p>
As you can see, Puppet ships with a type <em>service</em> that knows how to handle daemon applications. With this manifest, we ask Puppet to take charge of the <em>apache2</em> service. Whenever the Puppet agent runs on the target system, it will make sure that this service is running. Also, Puppet is able to restart services, and in this case, we even teached it to restart the <em>apache2</em> service only if <em>apachectl configtest</em> returns no errors. This allows for fully automated service management without giving up the safety that manual management provides.
</p>

<p>
Of course, we need to declare the new class in our main mainfest file:
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/apache2/manifests/init.pp on puppetserver</span>
</p><pre><code>class apache2 {

  include apache2::install
  include apache2::config
<span class="highlight">include apache2::service</span>
}</code></pre>
<p></p>

<p>
The last thing to do is to connect our <em>config</em> with our <em>service</em> manifest, because we would like to trigger an Apache restart whenever we change our virtual host configuration. This is achieved with the <em>notify</em> statement:
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/apache2/manifests/config.pp on puppetserver</span>
</p><pre><code>class apache2::config {

  file { "/etc/apache2/sites-available/${hostname}.conf":
    mode    =&gt; 0644,
    owner   =&gt; "root",
    group   =&gt; "root",
    content =&gt; template("apache2/etc/apache2/sites-available/vhost.conf.erb"),
    require =&gt; Package["apache2-mpm-prefork"]<span class="highlight">,
    notify  =&gt; Service["apache2"]</span>
  }

  file { "/etc/apache2/sites-enabled/${hostname}.conf":
    ensure  =&gt; link,
    target  =&gt; "/etc/apache2/sites-available/${hostname}.conf",
    require =&gt; File["/etc/apache2/sites-available/${hostname}.conf"]
  }

}</code></pre>
<p></p>

<p>
Let’s see if this works as intented. Simply change the virtual host template file at <em>/etc/puppet/modules/apache2/templates/etc/apache2/sites-available/vhost.conf.erb</em> (adding a space or empty line does the job), and then re-run the agent on the client. I have highlighted the interesting parts:
</p>

<p>
<span class="filename beforecode">On the puppetclient VM</span>
</p><pre><code>~# <strong>sudo puppet agent --verbose --no-daemonize --onetime</strong>

info: Caching catalog for puppetclient
info: Applying configuration version '1396998784'
info: FileBucket adding {md5}c55c5bd945cea21c817bca1a465b7dd3
info: /Stage[main]/Apache2::Config/File[/etc/apache2/sites-available/puppetclient.conf]: Filebucketed /etc/apache2/sites-available/puppetclient.conf to puppet with sum c55c5bd945cea21c817bca1a465b7dd3
notice: /Stage[main]/Apache2::Config/File[/etc/apache2/sites-available/puppetclient.conf]/content: content changed '{md5}c55c5bd945cea21c817bca1a465b7dd3' to '{md5}afafea12b21e61c5e18879ce3fe475d2'
<span class="highlight">info: /Stage[main]/Apache2::Config/File[/etc/apache2/sites-available/puppetclient.conf]: Scheduling refresh of Service[apache2]
notice: /Stage[main]/Apache2::Service/Service[apache2]: Triggered 'refresh' from 1 events</span>
notice: Finished catalog run in 0.32 seconds</code></pre>
<p></p>

<p>
Let’s also check if the safety mechanism works as expected. Again, edit the virtual host template file, and make it invalid, e.g. by removing the closing <strong>&gt;</strong> from one of the tags.
</p>

<p>
The agent will react as expected:
</p>

<p>
<span class="filename beforecode">On the puppetclient VM</span>
</p><pre><code>~# <strong>sudo puppet agent --verbose --no-daemonize --onetime</strong>

info: Caching catalog for puppetclient
info: Applying configuration version '1396998943'
info: FileBucket adding {md5}d15f727106b64c29d1c188efc9e6c97d
info: /Stage[main]/Apache2::Config/File[/etc/apache2/sites-available/puppetclient.conf]: Filebucketed /etc/apache2/sites-available/puppetclient.conf to puppet with sum d15f727106b64c29d1c188efc9e6c97d
notice: /Stage[main]/Apache2::Config/File[/etc/apache2/sites-available/puppetclient.conf]/content: content changed '{md5}d15f727106b64c29d1c188efc9e6c97d' to '{md5}7c86c7ba3cd4d7522d36b9d9fdcd46e2'
info: /Stage[main]/Apache2::Config/File[/etc/apache2/sites-available/puppetclient.conf]: Scheduling refresh of Service[apache2]
<span class="highlight">err: /Stage[main]/Apache2::Service/Service[apache2]: Failed to call refresh: Could not restart Service[apache2]: Execution of '/usr/sbin/apachectl configtest &amp;&amp; /usr/sbin/service apache2 reload' returned 1:  at /etc/puppet/modules/apache2/manifests/service.pp:10</span>
notice: Finished catalog run in 0.19 seconds
</code></pre>
<p></p>

<p>
Don’t forget to fix the template file so it’s working again.
</p>

<h2>Conclusion and outlook</h2>
<p>
Using templates, variables, dependencies and notifications, building full-fledged and robust manifests is straightforward and simple. Using modularization makes manifests re-usable for a wide range of clients. In <a href="/2014/03/26/building-manageable-server-infrastructures-with-puppet-part-4/">part 4 of this series</a> we discuss how parametrization allows us to make our modules even more flexible.
</p>