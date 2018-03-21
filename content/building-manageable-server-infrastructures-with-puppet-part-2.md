---
date: 2014-03-26T15:13:00+01:00
lastmod: 2014-03-26T15:13:00+01:00
title: "Building manageable server infrastructures with Puppet: Part 2"
description: "The second part of my Puppet series explains how to use the infrastructure that was set up in part 1 in order to automatically and centrally manage the configuration of a Puppet client system."
authors: ["manuelkiessling"]
slug: 2014/03/26/building-manageable-server-infrastructures-with-puppet-part-2
---

<h2>About</h2>
<p>
In <a href="/2014/03/26/building-manageable-server-infrastructures-with-puppet-part-1/">Part 1 of <em>Building manageable server infrastructures with Puppet</em></a>, we have set up two virtual Linux systems, a <em>puppetserver</em> and a <em>puppetclient</em>. We reached an important first milestone: We installed and set up the Puppet server and Puppet client software on their respective machines, and we authenticated the Puppet client with the Puppet server. We are now going to use this setup to start configuring our <em>puppetclient</em> system through the Puppet server on the <em>puppetserver</em> system.
</p>

<h2>Hello Puppet World</h2>
<p>
Let’s start with a very basic example. We will set up a configuration for our <em>puppetclient</em> that is really simple: The result will be a plain text file named <em>helloworld.txt</em> containing the phrase “Hello World!” being created in the directory <em>/home/ubuntu</em> on the <em>puppetclient</em> system.
</p>

<p>
Puppet ships with a powerful declarative configuration language. We use this language to write so-called <em>manifests</em>. A puppet manifest is a file that describes how a certain aspect of a target system should look like. In the course of this series, we will write many different manifests: some of them will result in files being created on the target system; some will result in user accounts being created; some will install software packages.
</p>

<p>
Manifests are applied onto target systems. In Puppet, target systems are called <em>nodes</em>. Our <em>puppetclient</em> system is such a node. We have already authenticated the system with the Puppet server; this enables the server to serve the node. But our server does not yet have any information on <em>what</em> to serve this node. Let’s change this by writing a manifest and associating this manifest with our node.
</p>

<p>
To do so, we will put a very basic manifest definition into the main manifest file on the <em>puppetserver</em> system, <em>/etc/puppet/manifests/site.pp</em>:
</p>

<p>
<span class="filename beforecode">/etc/puppet/manifests/site.pp on puppetserver</span>
</p><pre><code>node "puppetclient" {

  file { "/root/helloworld.txt":
    ensure =&gt; file,
    owner  =&gt; "root",
    group  =&gt; "root",
    mode   =&gt; 0644
  }

}</code></pre>
<p></p>

<p>
As we will see later, manifests can be modularized into an arbitrary number of different files (which helps to give structure to the manifests of a large and complex site), but everything starts with <em>site.pp</em>.
</p>

<p>
Let’s dissect this minimal manifest. It consists of two sections: a <em>node</em> which contains a <em>file</em> definition. Because the <em>file</em> section is contained within the <em>node</em> section, the actions that are the result of the <em>file</em> section’s definition will apply to the node named <em>puppetclient</em>.
</p>

<p>
What this means in practice can easily be demonstrated, by running the Puppet agent on the <em>puppetclient</em> system:
</p>

<p>
<span class="filename beforecode">On the puppetclient VM</span>
</p><pre><code>~# <strong>sudo puppet agent --verbose --no-daemonize --onetime</strong>

info: Caching catalog for puppetclient
info: Applying configuration version '1395862307'
notice: /Stage[main]//Node[puppetclient]/File[/home/ubuntu/helloworld.txt]/ensure: created
notice: Finished catalog run in 0.03 seconds</code></pre>
<p></p>

<p>
It’s probably not a big surprise: The Puppet agent on system <em>puppetclient</em> contacted the Puppet master on system <em>puppetserver</em>. It then retrieved the <em>catalog</em>, that is, all the manifest definitions on the master that are relevant for this particular client. In case you are curious, the catalog is saved as a yaml structure in file <em>/var/lib/puppet/client_yaml/catalog/puppetclient.yaml</em> – it’s not simply a copy of our <em>.pp</em> manifest, but rather a compiled version of the target configuration that was created by parsing our manifest.
</p>

<p>
Then, the Puppet agent takes action – if, and only if, action has to be taken: It compares the situation that our manifest expects with the actual situation on the target node. If there is a delta – if the situation found on the target node is not in sync with the situation that is to be achieved – then the agent does whatever neccessary to remove that delta, to reach the target situation.
</p>

<p>
In our particular case, the agent learned that a file named <em>helloworld.txt</em> with owner and group <em>ubuntu</em> and mode <em>0644</em> is expected to exist at location <em>/home/ubuntu</em>. However, when checking the local system, no such file is found. The agent takes action and creates the file that is expected to exist.
</p>

<p>
We can verify this behaviour by running the agent again:
</p>

<p>
<span class="filename beforecode">On the puppetclient VM</span>
</p><pre><code>~# <strong>sudo puppet agent --verbose --no-daemonize --onetime</strong>

info: Caching catalog for puppetclient
info: Applying configuration version '1395862542'
notice: Finished catalog run in 0.03 seconds</code></pre>
<p></p>

<p>
As we can see, the agent simply does nothing, because the target situation is already satisfied. What if we change the situation on the target node? Let’s change the mode of the file:
</p>

<p>
<span class="filename beforecode">On the puppetclient VM</span>
<pre><code>~# <strong>chmod 0640 /home/ubuntu/helloworld.txt</strong></code></pre>
</p>

<p>
Run the agent again:
</p>

<p>
<span class="filename beforecode">On the puppetclient VM</span>
<pre><code>~# <strong>sudo puppet agent --verbose --no-daemonize --onetime</strong>

info: Caching catalog for puppetclient
info: Applying configuration version '1395862542'
notice: /Stage[main]//Node[puppetclient]/File[/home/ubuntu/helloworld.txt]/mode: mode changed '0640' to '0644'
notice: Finished catalog run in 0.03 seconds</code></pre>
</p>

<p>
The agent noticed the delta, and removed it by changing the mode of the file.
</p>

<p>
What if the change the content of the file…
</p>

<p>
<span class="filename beforecode">On the puppetclient VM</span>
<pre><code>~# <strong>echo "This is a test" &gt; /home/ubuntu/helloworld.txt</strong></code></pre>
</p>

<p>
…and run the agent?
</p>

<p>
<span class="filename beforecode">On the puppetclient VM</span>
</p><pre><code>~# <strong>sudo puppet agent --verbose --no-daemonize --onetime</strong>

info: Caching catalog for puppetclient
info: Applying configuration version '1395862542'
notice: Finished catalog run in 0.03 seconds</code></pre>
<p></p>

<p>
Nothing happens. Why? Because in our manifest, we didn’t say anything about the contents of the file. All we did was, we asked Puppet to ensure that a file with the given name exists, and how it’s metadata (owner, group, mode) should look like. Puppet only takes care of what it is asked to take care of.
</p>

<p>
The behaviour we witnessed in the preceding example lies at the very heart of Puppet’s philosophy. In our manifests, we don’t tell Puppet <em>what</em> to do. We don’t tell it <em>how</em> to do it. We only tell Puppet <em>what the end result should look like</em>.
</p>

<p>
This philosophy carries great power, because it abstracts away the grunt work needed to configure systems. It levels the differences between different operating systems. Imagine a situation where you have a network of different Linux systems – some run Red Hat Linux, some run Ubuntu Linux. Let’s further assume that you would like to have the package <em>htop</em> installed on all systems. If we had to tell Puppet <em>what</em> to do and <em>how</em> to do it, we would have to write a manifest that talks about <em>apt-get</em> for the Ubuntu systems and <em>yum</em> for the Red Hat systems. Instead, all we need to put into a manifest is this:
</p>

<p>
</p><pre><code>package { "htop":
  ensure =&gt; installed
}</code></pre>
<p></p>

<p>
The puppet agent on the target nodes will figure out how to reach the target situation described in this manifest. An agent on a Red Hat system will use <em>yum</em> to install the package; an agent on an Ubuntu system will use <em>apt-get</em>.
</p>

<p>
We will get back to package installation later. Let’s continue with our file example. Creating empty files through Puppet isn’t of very much use – of course we would like to deploy files with content. Puppet makes this easy: we can place files on the <em>puppetserver</em> and have them transferred onto the <em>puppetclient</em> through Puppet.
</p>

<p>
First, let’s create the source file on the <em>puppetserver</em>:
</p>

<p>
<span class="filename beforecode">On the puppetserver VM</span>
</p><pre><code>~# <strong>sudo -s</strong>
~# <strong>mkdir /etc/puppet/files</strong>
~# <strong>echo "Hello World." &gt; /etc/puppet/files/helloworld.txt</strong></code></pre>
<p></p>

<p>
Then, we need to allow access to the <em>files</em> folder on the server for Puppet clients. For this, we need to change <em>/etc/puppet/fileserver.conf</em> on the <em>puppetserver</em> by adding an <em>allow *</em> statement:
</p>

<p>
<span class="filename beforecode">/etc/puppet/fileserver.conf on puppetserver</span>
</p><pre><code># This file consists of arbitrarily named sections/modules
# defining where files are served from and to whom

# Define a section 'files'
# Adapt the allow/deny settings to your needs. Order
# for allow/deny does not matter, allow always takes precedence
# over deny
[files]
  path /etc/puppet/files
<span class="highlight">  allow *</span>
#  allow *.example.com
#  deny *.evil.example.com
#  allow 192.168.0.0/24

[plugins]
#  allow *.example.com
#  deny *.evil.example.com
#  allow 192.168.0.0/24</code></pre>
<p></p>

<p>
Now we can extend our existing <em>file</em> block in the manifest file <em>vim /etc/puppet/manifests/site.pp</em>:
</p>

<p>
<span class="filename beforecode">/etc/puppet/manifests/site.pp on puppetserver</span>
</p><pre><code>node "puppetclient" {

  file { "/root/helloworld.txt":
    ensure =&gt; file,
    owner  =&gt; "root",
    group  =&gt; "root",
    mode   =&gt; 0644,
<span class="highlight">    source =&gt; "puppet://puppetserver/files/helloworld.txt"</span>
  }

}</code></pre>
<p></p>

<p>
Let’s run the agent on the client system once again:
</p>

<p>
<span class="filename beforecode">On the puppetclient VM</span>
</p><pre><code>~# <strong>sudo puppet agent --verbose --no-daemonize --onetime</strong>

info: Caching catalog for puppetclient
info: Applying configuration version '1395878127'
info: FileBucket adding {md5}ff22941336956098ae9a564289d1bf1b
info: /Stage[main]//Node[puppetclient]/File[/home/ubuntu/helloworld.txt]: Filebucketed /home/ubuntu/helloworld.txt to puppet with sum ff22941336956098ae9a564289d1bf1b
notice: /Stage[main]//Node[puppetclient]/File[/home/ubuntu/helloworld.txt]/content: content changed '{md5}ff22941336956098ae9a564289d1bf1b' to '{md5}770b95bb61d5b0406c135b6e42260580'
notice: Finished catalog run in 0.09 seconds</code></pre>
<p></p>

<p>
Now the Puppet agent does care about the contents of the file and overwrites the existing file content with the content from the file on the <em>puppetserver</em>.
</p>

<p>
In <a href="/2014/03/26/building-manageable-server-infrastructures-with-puppet-part-3/">part 3 of <em>Building manageable server infrastructures with Puppet</em></a> we will look at more complex manifests, and how to structure our manifests into modules.
</p>
