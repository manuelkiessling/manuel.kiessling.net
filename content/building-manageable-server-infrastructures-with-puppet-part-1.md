---
date: 2014-03-26T16:13:00+01:00
lastmod: 2014-03-26T16:13:00+01:00
title: "Building manageable server infrastructures with Puppet: Part 1"
description: "With this series I would like to provide a comprehensive hands-on tutorial that explains step-by-step how to build an automated and centrally managed Linux server infrastructure using Puppet. Part 1 of the series explains in great detail how to set up a virtual machine infrastructure which allows to create a realistic Puppet server-client setup."
authors: ["manuelkiessling"]
slug: 2014/03/26/building-manageable-server-infrastructures-with-puppet-part-1
canonical: https://develop-build-deploy.com/archived/building-manageable-server-infrastructures-with-puppet-part-1/
---

<h2>About</h2>

<p>
With this series I would like to provide a comprehensive hands-on tutorial that explains step-by-step how to build a centrally managed Linux server infrastructure using Puppet.
</p>


<h2>Target audience</h2>

<p>
I believe that the readers who will get most out of this series are Linux systems administrators who already manage a small-sized network of server systems and wonder how they can grow the existing infrastructure – without having to grow the amount of time and effort put into managing these systems linearly with the number of new systems. Maybe you currently manage 5 server systems, and you ask yourself if there is a clever approach to manage 50 systems without growing your staff. You have heard about centralized configuration management and Puppet, and are eager to give it a try.
</p>


<h2>Prerequisites</h2>

<p>
If you are sitting at a Linux, Windows or Mac OS X desktop system with at least 4 GB of RAM, 16 GB free disk space, and a CPU that is capable of running virtual machine guests, then you are already good to go. Everything that needs to be done and anything that you need will be provided through in the course of this series.
</p>


<h2>Getting started</h2>

<p>
I will simply skip the part where I try to sell you the idea of tool-based configuration management with Puppet. When you arrive at this text, you probably already know you want to use it. Let’s get our feet wet right away.
</p>

<p>
I promised a hands-on and comprehensive tutorial, and for this we need to prepare an environment that allows us to not only talk about using Puppet, but instead enables us to set up a real – albeit small – server infrastructure that runs an actual Puppet server that serves an actual Puppet client. In other words, we need two Linux virtual machines.
</p>

<p>
For this tutorial, I would like use two Ubuntu 12.04 LTS <em>Precise Pangolin</em> machines, simply because that’s the Linux distribution I have the most experience with personally. The steps described herein shouldn’t be much different if you use a more recent version of Ubuntu or, say, Debian 7.0 <em>Wheezy</em>.
</p>

<p>
The first thing to do is to download and install VirtualBox from Oracle. It’s a free virtual machine manager which we will use to run our two virtual Ubuntu systems. As of this writing, version 4.3.8-92456 is the current release of VirtualBox, so head over to <a href="http://download.virtualbox.org/virtualbox/4.3.8/">http://download.virtualbox.org/virtualbox/4.3.8/</a> and download either <em>VirtualBox-4.3.8-92456-Win.exe</em>, <em>VirtualBox-4.3.8-92456-OSX.dmg</em>, or <em>VirtualBox-4.3.8-92456-Linux_amd64.run</em>, depending on the operating system you use. Just install it with default options once you’ve downloaded it.
</p>

<p>
Once VirtualBox is installed on your computer, it’s time to download the installation medium for Ubuntu 12.04 LTS Server 64bit. Go to <a href="http://releases.ubuntu.com/12.04/">http://releases.ubuntu.com/12.04/</a> and choose the link <em>64-bit PC (AMD64) server install CD</em> to download it. We will use the same ISO to install both virtual machines.
</p>

<p>
Once the download has finished and the ISO file is available on your computer, start VirtualBox and select <em>New…</em> from the <em>Machine</em> menu.
</p>

<p>
We will start with installation of the virtual machine that is going to be the Puppet server, therefore, name the virtual machine <em>puppetserver</em> in the dialogue that pops up. As <em>Type</em>, choose <em>Linux</em>, and set <em>Version</em> to <em>Ubuntu (64 bit)</em>. A memory size of 512 MB does the job. Let VirtualBox create a hard drive file for the VM – a size of 8 GB is more than enough.
</p>

<p>
You can now <em>Start</em> your newly created virtual machine. VirtualBox will ask for an installation medium – point it at the Ubuntu ISO you have downloaded.
</p>

<p>
VirtualBox will start the VM and boot into the Ubuntu installer CD. Choose <em>English</em> as the language used during the installation, and continue by choosing <em>Install Ubuntu Server</em>.
</p>

<p>
During the installation process, these are the options you should choose:

</p><ul>
<li>Language: <em>English</em></li>
<li>Country: Simply choose your country</li>
<li>Locale: <em>en_US.UTF-8</em></li>
<li>Keyboard: Choose the keyboard layout that best fits your needs</li>
<li>Default User: <em>ubuntu</em>, with password <em>ubuntu</em></li>
<li>Encrypt home directory: <em>No</em></li>
<li>Timezone: Choose the time zone you’re in</li>
<li>Partitioning: <em>Guided – use entire disk</em></li>
<li>When asked what packages to install, only select <em>OpenSSH server</em></li>
<li>Install grub into the MBR</li>
<li>Set the system clock to <em>UTC</em></li>
<li>Do not install security updates automatically</li>
</ul>
<p></p>

<p>
Once the first virtual machine is completely installed, boot into it. Then, set up the second virtual machine, the one that will act as our puppet client. Proceed just as you did with the first machine, with one exception: In VirtualBox and within the Ubuntu installation process, name the second machine <em>puppetclient</em> instead of <em>puppetserver</em>.
</p>

<p>
Upon finishing the installation, boot into the second VM just as you did with the first one. This should result in two VirtualBox windows, both running Ubuntu 12.04, both offering you a login prompt. Next, we need to configure some VirtualBox settings, so please log into both machines (user: <em>ubuntu</em>, password <em>ubuntu</em>), and shut them down with <em>sudo poweroff</em>.
</p>


<h2>Networking</h2>

<p>
Because we are setting up a Puppet server and client, both machines need to be able to talk with each other over the network. Also, it would be nice to be able to reach both machines from our host computer – this way, we can SSH into the machines and are not forced to work on the rather small and
uncomfortable VirtualBox console. Last but not least, both machines need to be able to reach the Internet in order to install packages.
</p>

<p>
To achieve all this, we need two virtual networks, a <em>Host-only Network</em> and a <em>NAT Network</em>. Both machines then need to have two ethernet adapters, <em>eth0</em> for connecting to the Host-only Network, and <em>eth1</em> to connect to the NAT Network.
</p>

<p>
The Host-only Network allows both machines to connect to each other, and allows us to connect to both machines from the host system. The NAT Network allows both machines to reach the Internet.
</p>

<p>
Within VirtualBox itself, both networks are set up. Choose <em>File -&gt; Preferences</em> and go to <em>Network</em>. The tab <em>NAT Networks</em> does not list a network, but one is available anyways; no need to configure one. Change to tab <em>Host-only Networks</em>. Make sure that a network named <em>vboxnet0</em> is availble. Click on the small screwdriver icon next to the list, and make sure that in the following popup, the <em>Adapter</em> and <em>DHCP Server</em> settings look as follows:
</p>

<p>
<a href="/images/2014-03-23-1395585448_999x519_scrot.png"><img src="/images/2014-03-23-1395585448_999x519_scrot.png" alt="" title="VirtualBox Host-only Network settings" class="aligncenter size-medium wp-image-811" width="100%"></a>
</p>

<p>
<a href="/images/2014-03-23-1395585577_1002x520_scrot.png"><img src="/images/2014-03-23-1395585577_1002x520_scrot.png" alt="" title="VirtualBox Host-only Network DHCP settings" class="aligncenter size-medium wp-image-812" width="100%"></a>
</p>

<p>
Our host computer automatically has the address <em>192.168.56.1</em> on the Host-only Network. Our <em>puppetserver</em> machine should bind to <em>192.168.56.2</em>, and the <em>puppetclient</em> to <em>192.168.56.3</em>.
</p>

<p>
In order to configure this, change into the <em>Settings</em> dialogue for both virtual machines. Goto <em>Network</em>, and set <em>Adapter 1</em> to be attached to <em>Host-only Adapter</em> with <em>Name</em> set to <em>vboxnet0</em>. Then enable <em>Adapter 2</em> and attach it to <em>NAT</em> (not <em>NAT Network</em>!). These settings must be identical for both machines.
</p>

<p>
Now boot up both machines and log in with the <em>ubuntu</em> user. We need to configure two network interfaces on both machines in <em>/etc/network/interfaces</em>. For the <em>puppetserver</em>, this looks like this:
</p>

<p>
<span class="filename beforecode">/etc/network/interfaces on puppetserver</span>
</p><pre><code>auto lo
iface lo inet loopback

auto eth0
iface eth0 inet static
	address 192.168.56.2
	netmask 255.255.255.0

auto eth1
iface eth1 inet dhcp</code></pre>
<p></p>

<p>
And this is how it must look on the <em>puppetclient</em>:
</p>

<p>
<span class="filename beforecode">/etc/network/interfaces on puppetclient</span>
</p><pre><code>auto lo
iface lo inet loopback

auto eth0
iface eth0 inet static
	address 192.168.56.3
	netmask 255.255.255.0

auto eth1
iface eth1 inet dhcp</code></pre>
<p></p>

<p>
As you can see, the only difference is the IP address. These settings will allow Internet access via <em>eth1</em>, and VM-to-VM connectivity with static IP addresses through <em>eth0</em>.
</p>

<p>
The last step is to add both machine’s names to the <em>hosts</em> file on both systems, which allows us to address them by name instead of IP addresses. This is how <em>/etc/hosts</em> should look on the <em>puppetserver</em>:
</p>

<p>
<span class="filename beforecode">/etc/hosts on puppetserver</span>
</p><pre><code>127.0.0.1       localhost
127.0.1.1       puppetserver
192.168.56.3    puppetclient

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters</code></pre>
<p></p>

<p>
And on the <em>puppetclient</em>:
</p>

<p>
<span class="filename beforecode">/etc/hosts on puppetclient</span>
</p><pre><code>127.0.0.1       localhost
127.0.1.1       puppetclient
192.168.56.2    puppetserver

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters</code></pre>
<p></p>

<p>
After rebooting both virtual machines, you should now be able to <em>ping puppetclient</em> from the <em>puppetserver</em> and vice versa, and from your host computer, you should be able to ping <em>192.168.56.2</em> and <em>192.168.56.3</em>, respectively.
</p>


<h2>Setting up the Puppet server</h2>

<p>
Now that the virtual machines for the Puppet server and the Puppet client are set up with a basic Ubuntu installation and networking is up and running, we can start to set up the Puppet server system.
</p>

<p>
Everything that is needed for our server system to actually act as a Puppet server is provided through the Ubuntu software repositories – no manual software installation or fiddling with external packages is required.
</p>

<p>
To install the neccessary software packages, log in to the <em>puppetserver</em> VM as user <em>ubuntu</em> and run the following commands:
</p>

<p>
<span class="filename beforecode">On the puppetserver VM</span>
</p><pre><code>~# <strong>sudo apt-get update</strong>
~# <strong>sudo apt-get install puppetmaster</strong></code></pre>
<p></p>

<p>
No further steps are neccessary – the Puppet server runs with a reasonable default config that will do for now.
</p>

<h2>Setting up the Puppet client</h2>

<p>
Getting the Puppet client (or, in Puppet lingo, <em>agent</em>) up and running on our <em>puppetclient</em> machine isn’t that much different. First, we need to install the Puppet client package:
</p>

<p>
<span class="filename beforecode">On the puppetclient VM</span>
</p><pre><code>~# <strong>sudo apt-get update</strong>
~# <strong>sudo apt-get install puppet</strong></code></pre>
<p></p>

<p>
Then, we need to tell the agent what the domain name of the Puppet server is, by editing <em>/etc/puppet/puppet.conf</em>. All we need to do is to add the line <em>server=puppetserver</em>:
</p>

<p>
<span class="filename beforecode">/etc/puppet/puppet.conf on puppetclient</span>
</p><pre><code>[main]
server=puppetserver
logdir=/var/log/puppet
vardir=/var/lib/puppet
ssldir=/var/lib/puppet/ssl
rundir=/var/run/puppet
factpath=$vardir/lib/facter
templatedir=$confdir/templates
prerun_command=/etc/puppet/etckeeper-commit-pre
postrun_command=/etc/puppet/etckeeper-commit-post

[master]
# These are needed when the puppetmaster is run by passenger
# and can safely be removed if webrick is used.
ssl_client_header = SSL_CLIENT_S_DN
ssl_client_verify_header = SSL_CLIENT_VERIFY</code></pre>
<p></p>

<p>
With this, the client is capable of connecting to the Puppet master process on <em>puppetserver</em>, but it can’t really talk to the server yet, because it’s not in the list of verified and allowed clients. To achieve this, we need to make a very first connection from the client to the server:
</p>

<p>
<span class="filename beforecode">On the puppetclient VM</span>
<code>~# <strong>sudo puppet agent --verbose --no-daemonize --onetime</strong></code>
</p>

<p>
This starts a connection to the Puppet master process that is listening on port 8140 on <em>puppetserver</em>. The output will be <em>verbose</em>, and the agent will not continue running in the background as a <em>daemon</em>. Also, it will run only <em>onetime</em>, that is, after the connection is closed, the agent process will exit.
</p>

<p>
If everything has been correctly set up, then the output of this first run will look like this:
</p>

<p>
<span class="filename beforecode">On the puppetclient VM, after running the Puppet agent</span>
</p><pre><code>info: Creating a new SSL key for puppetclient
info: Creating a new SSL certificate request for puppetclient
info: Certificate Request fingerprint (md5): 20:74:A7:BD:69:5D:50:8D:6A:79:67:6E:DC:5E:41:E0
Exiting; no certificate found and waitforcert is disabled</code></pre>
<p></p>

<p>
This sounds a little bit like an error, but it isn’t – the client has made itself known to the server, but the server has not yet accepted the client. This is the next step; we must sign the SSL certificate request that the <em>puppetclient</em> has created and sent to the server. We can see a list of yet-to-be-signed certificate requests on the server:
</p>

<p>
<span class="filename beforecode">On the puppetserver VM</span>
<code>~# <strong>sudo puppet cert --list</strong></code>
</p>

<p>
This will print the the following list:
</p>

<p>
<span class="filename beforecode">On the puppetserver VM</span>
<code>  "puppetclient" (20:74:A7:BD:69:5D:50:8D:6A:79:67:6E:DC:5E:41:E0)</code>
</p>

<p>
We can now sign the request, which will allow the client to actually retrieve information from the server upon subsequent connections:
</p>

<p>
<span class="filename beforecode">On the puppetserver VM</span>
</p><pre><code>~# <strong>sudo puppet cert --sign puppetclient</strong>

notice: Signed certificate request for puppetclient
notice: Removing file Puppet::SSL::CertificateRequest puppetclient at '/var/lib/puppet/ssl/ca/requests/puppetclient.pem'</code></pre>
<p></p>

<p>
Switching back to the <em>puppetclient</em>, we are now able to initiate a full connection to the server:
</p>

<p>
<span class="filename beforecode">On the puppetserver VM</span>
</p><pre><code>~# <strong>sudo puppet agent --verbose --no-daemonize --onetime</strong>

info: Caching certificate for puppetclient
info: Caching certificate_revocation_list for ca
info: Caching catalog for puppetclient
info: Applying configuration version '1395687915'
info: Creating state file /var/lib/puppet/state/state.yaml
notice: Finished catalog run in 0.02 seconds</code></pre>
<p></p>

<p>
And that’s it – our Puppet infrastructure is fully up and running. However, there is nothing yet within that infrastructure that actually <em>does</em> anything. Our goal is to manage the configuration of our <em>puppetclient</em> through the Puppet master running on the <em>puppetserver</em>. But we have not yet defined any content that could trigger a configuration change on the client. This is what we will do next, in <a href="/2014/03/26/building-manageable-server-infrastructures-with-puppet-part-2/">Part 2 of <em>Building manageable server infrastructures with Puppet</em></a>.
</p>
