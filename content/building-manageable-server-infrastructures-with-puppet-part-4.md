---
date: 2014-03-26T13:13:00+01:00
lastmod: 2014-03-26T13:13:00+01:00
title: "Building manageable server infrastructures with Puppet: Part 4"
description: "The fourth part of this series shows how an infrastructure-wide users, rights and SSH key management can be realized through Puppet and demonstrates the use of macros in order to streamline the creation of manifests with similar content."
authors: ["manuelkiessling"]
slug: 2014/03/26/building-manageable-server-infrastructures-with-puppet-part-4
---

<h2>About</h2>
<p>
In <a href="/2014/03/26/building-manageable-server-infrastructures-with-puppet-part-3/">Part 3 of <em>Building manageable server infrastructures with Puppet</em></a>, we created our first reusable real-world Puppet module, <em>apache2</em>. In part 4 and following, we will stop using examples and start building a fully featured infrastructure with users and rights management, Nagios monitoring, file servers, load balancers, web servers, databases, VPN, development systems <em>et cetera</em>.
</p>

<h2>Managing user and group accounts through Puppet</h2>
<p>
At the company I work for, I use Puppet to manage the Unix user accounts of me and my coworkers on our Linux machines. This works well because only a hand full of people need shell or ssh access to the systems. In case you need to support a large user base, with each user having his or her own account on the machines, a solution like LDAP might be preferable.
</p>

<p>
But if you, like me, have a handful of software developers and systems administrators that need to access the machines, and a centralized directory service is overkill, then managing their user accounts through Puppet is feasible and simple.
</p>

<p>
The manifests for user and group management are a typical example for manifests that are applied to every machine that is managed through Puppet. This way, every user can expect his or her own account available on every machine (not neccessarily with the same rights on every system, of course). No need to share the <em>root</em> account, or any other Unix account, with multiple users – sudo takes care of giving each account the rights it needs.
</p>

<p>
Here, using centralized configuration management shows its strengths: whenever a new machine is added to the infrastructure, each user can expect it to have his or her account already set up, including one’s personal configuration like Bash settings and the like. Also, SSH key management turns from a hassle into a breeze.
</p>

<p>
It might make sense to define a simple but strict ruleset regarding the user and group ids in your infrastructure.
</p>

<p>
In my case, this ruleset looks a bit like this:
</p>

<p>
Internal systems administrators: UID/GID between 1000 and 1999<br>
External systems administrators: UID/GID between 2000 and 2999<br>
SFTP accounts: UID/GID between 3000 and 3999
</p>

<p>
On our Ubuntu systems, UID/GID 1000 has already been taken by the <em>ubuntu</em> user created during installation; but as we will see, we can manage it through Puppet anyways.
</p>

<p>
As mentioned earlier, I assume you have an infrastructure with only a handful of users that need Unix accounts on your machines. In this case, it makes sense to create a Puppet module for each user (versus putting all user account manifests into one module). This way, you can create simple and complex account modules that live peacefully next to each other without ending up with one chaotic module. And, you can “mix” accounts onto nodes as needed. If Bob and Mary both need access to your webserver, but only Mary needs access to the database machine, then this mapping can be achieved by simply mapping nodes to modules. And if you have a group of 10 users that need access to all machines, this can still be achieved without the need to map every single account to every single node, by grouping these 10 user modules into a class, as will be demonstrated.
</p>

<h2>A first user module</h2>

<p>
So, how does this look in practice? Let’s start by creating a first user module, for the already existing <em>ubuntu</em> account. In order to keep our modules easily identifiable, we should prefix the name of all user modules with <em>user-</em> – therefore, we need to create the directory structure for our module as follows:
</p>

<p>
<span class="filename beforecode">On the puppetserver VM</span>
<pre><code>~# <strong>sudo mkdir -p /etc/puppet/modules/user-ubuntu/manifests</strong></code></pre>
</p>

<p>
The user accounts and its groups can be managed through two dedicated blocks, <em>user</em> and <em>group</em>. Using them looks like this:
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/user-ubuntu/manifests/init.pp on puppetserver</span>
</p><pre><code>class user-ubuntu {

  user { "ubuntu":
    comment    =&gt; "ubuntu,,,",
    home       =&gt; "/home/ubuntu",
    shell      =&gt; "/bin/bash",
    uid        =&gt; 1000,
    gid        =&gt; 1000,
    managehome =&gt; "true",
    password   =&gt; '$6$WzFG7Ga3$.BbRW/DFGkx5EIakXIt1udCGxVDPs2uFZg.o8EFzH8BX7cutimTCfTUWDdyHoFjDVTFnBkUWVPGntQTRSo1zp0',
    groups     =&gt; ["adm", "cdrom", "sudo", "dip", "plugdev", "lpadmin", "sambashare"]
  }

  group { "ubuntu":
    gid =&gt; 1000,
  }
}</code></pre>
<p></p>

<p>
As you can see, this basically mirrors the setup of this user just as it already exits on the system. Note that the password hash is set in single quotes instead of double quotes like the other parameters – this is because the <em>$</em> symbol has a special meaning within Puppet when set into double quotes.
</p>

<p>
As always, in order to apply this new manifest (or rather, the new module we created), we need to declare the new module within our node:
</p>

<p>
<span class="filename beforecode">/etc/puppet/manifests/site.pp on puppetserver</span>
</p><pre><code>node "puppetclient" {

<span class="highlight">  include user-ubuntu</span>
  include apache2

}</code></pre>
<p></p>

<p>
The output shows that this didn’t change anything (well, in your case, that might not be true – the password might have been generated with a different hash, and it will be updated – nevertheless, you should end up with a user <em>ubuntu</em> that still has <em>ubuntu</em> as his password).
</p>

<h2>SSH key management with Puppet</h2>

<p>
The <em>user</em> block works fine for a very basic user management, but of course we want more. One area where Puppet can really remove a lot of administrative pain is SSH key management. Let’s create a new private/public SSH key pair for the root user on the <em>puppetserver</em>, and let’s add the public key to the authorized_keys file of user <em>ubuntu</em> on the <em>puppetclient</em>.
</p>

<p>
To do so, first generate a new key pair, and write the public key to the console:
</p>

<p>
<span class="filename beforecode">On the puppetserver VM</span>
</p><pre><code>~# <strong>sudo ssh-keygen</strong>
Generating public/private rsa key pair.
Enter file in which to save the key (/root/.ssh/id_rsa):
Created directory '/root/.ssh'.
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /root/.ssh/id_rsa.
Your public key has been saved in /root/.ssh/id_rsa.pub.
The key fingerprint is:
e8:5e:ae:f4:be:1c:a1:79:da:a4:94:50:20:dd:7e:b3 root@puppetserver
The key's randomart image is:
+--[ RSA 2048]----+
|  ....           |
|   ....          |
|     ..          |
|     ...o        |
|    . ..So       |
|     o +E.       |
|      B =        |
|     + @ .       |
|      =oB.       |
+-----------------+

~# <strong>sudo cat /root/.ssh/id_rsa.pub</strong>
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCvphOrxjMvgtBVTjMzPolL4JGarEigbPuH3cE3iNIcSBPgHyBjDwtin6ls6aMzm0ZbHMdinj1qxSbolkTQ1danZpOAe0G9NB9/ZnYCNd/kUeMAX91B0Pitx6NKoaz0x7H7V1Javd11RN3ylBw6dtOh35Lqmjx22RXNK8sMpLW8tKYOQuY01F5Eiv08U/AKO83w2ZNxYbNuuhHWeN7wHTb176uhuhGGnob0ArvaxCJgJ96bvDYLSph6V067q0chTuutLGSDA4AbC1Bb/d3wcAIqEM1s6VMT8oU0rUHkPH/1AqaKhWDrEcbSp94gAqTMWQxVz+XWBvu1Dc+CsujsqigT root@puppetserver</code></pre>
<p></p>

<p>
(Of course, you will end up with a different pair of keys when generating on your system).
</p>

<p>
Puppet also has a block statement for managing authorized SSH keys of a user. We use it as follows to authorize the newly generated key:
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/user-ubuntu/manifests/init.pp on puppetserver</span>
</p><pre><code>class user-ubuntu {

  user { "ubuntu":
    comment    =&gt; "ubuntu,,,",
    home       =&gt; "/home/ubuntu",
    shell      =&gt; "/bin/bash",
    uid        =&gt; 1000,
    gid        =&gt; 1000,
    managehome =&gt; "true",
    password   =&gt; '$6$WzFG7Ga3$.BbRW/DFGkx5EIakXIt1udCGxVDPs2uFZg.o8EFzH8BX7cutimTCfTUWDdyHoFjDVTFnBkUWVPGntQTRSo1zp0',
    groups     =&gt; ["adm", "cdrom", "sudo", "dip", "plugdev", "lpadmin", "sambashare"]
  }

  group { "ubuntu":
    gid =&gt; 1000,
  }

<span class="highlight">  ssh_authorized_key { "default-ssh-key-for-ubuntu":
    user   =&gt; "ubuntu",
    ensure =&gt; present,
    type   =&gt; "ssh-rsa",
    key    =&gt; "AAAAB3NzaC1yc2EAAAADAQABAAABAQCvphOrxjMvgtBVTjMzPolL4JGarEigbPuH3cE3iNIcSBPgHyBjDwtin6ls6aMzm0ZbHMdinj1qxSbolkTQ1danZpOAe0G9NB9/ZnYCNd/kUeMAX91B0Pitx6NKoaz0x7H7V1Javd11RN3ylBw6dtOh35Lqmjx22RXNK8sMpLW8tKYOQuY01F5Eiv08U/AKO83w2ZNxYbNuuhHWeN7wHTb176uhuhGGnob0ArvaxCJgJ96bvDYLSph6V067q0chTuutLGSDA4AbC1Bb/d3wcAIqEM1s6VMT8oU0rUHkPH/1AqaKhWDrEcbSp94gAqTMWQxVz+XWBvu1Dc+CsujsqigT",
    name   =&gt; "root@puppetserver",
  }
</span>
}</code></pre>
<p></p>

<p>
As expected, this results in the following <em>authorized_keys</em> file for user <em>ubuntu</em> on system <em>puppetclient</em>:
</p>

<p>
<span class="filename beforecode">/home/ubuntu/.ssh/authorized_keys on puppetclient</span>
</p><pre><code># HEADER: This file was autogenerated at Tue Apr 22 21:58:56 +0200 2014
# HEADER: by puppet.  While it can still be managed manually, it
# HEADER: is definitely not recommended.
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCvphOrxjMvgtBVTjMzPolL4JGarEigbPuH3cE3iNIcSBPgHyBjDwtin6ls6aMzm0ZbHMdinj1qxSbolkTQ1danZpOAe0G9NB9/ZnYCNd/kUeMAX91B0Pitx6NKoaz0x7H7V1Javd11RN3ylBw6dtOh35Lqmjx22RXNK8sMpLW8tKYOQuY01F5Eiv08U/AKO83w2ZNxYbNuuhHWeN7wHTb176uhuhGGnob0ArvaxCJgJ96bvDYLSph6V067q0chTuutLGSDA4AbC1Bb/d3wcAIqEM1s6VMT8oU0rUHkPH/1AqaKhWDrEcbSp94gAqTMWQxVz+XWBvu1Dc+CsujsqigT root@puppetserver</code></pre>
<p></p>

<h2>Using macros to avoid repetition</h2>

<p>
Now, this is all fine and dandy, but looking at the resulting manifest file, we see a lot of duplication:
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/user-ubuntu/manifests/init.pp on puppetserver</span>
</p><pre><code>class user-ubuntu {

  user { "ubuntu":
    comment    =&gt; "ubuntu,,,",
    home       =&gt; "/home/ubuntu",
    shell      =&gt; "/bin/bash",
    uid        =&gt; 1000,
    gid        =&gt; 1000,
    managehome =&gt; "true",
    password   =&gt; '$6$WzFG7Ga3$.BbRW/DFGkx5EIakXIt1udCGxVDPs2uFZg.o8EFzH8BX7cutimTCfTUWDdyHoFjDVTFnBkUWVPGntQTRSo1zp0',
    groups     =&gt; ["adm", "cdrom", "sudo", "dip", "plugdev", "lpadmin", "sambashare"]
  }

  group { "ubuntu":
    gid =&gt; 1000,
  }

  ssh_authorized_key { "default-ssh-key-for-ubuntu":
    user   =&gt; "ubuntu",
    ensure =&gt; present,
    type   =&gt; "ssh-rsa",
    key    =&gt; "AAAAB3NzaC1yc2EAAAADAQABAAABAQCvphOrxjMvgtBVTjMzPolL4JGarEigbPuH3cE3iNIcSBPgHyBjDwtin6ls6aMzm0ZbHMdinj1qxSbolkTQ1danZpOAe0G9NB9/ZnYCNd/kUeMAX91B0Pitx6NKoaz0x7H7V1Javd11RN3ylBw6dtOh35Lqmjx22RXNK8sMpLW8tKYOQuY01F5Eiv08U/AKO83w2ZNxYbNuuhHWeN7wHTb176uhuhGGnob0ArvaxCJgJ96bvDYLSph6V067q0chTuutLGSDA4AbC1Bb/d3wcAIqEM1s6VMT8oU0rUHkPH/1AqaKhWDrEcbSp94gAqTMWQxVz+XWBvu1Dc+CsujsqigT",
    name   =&gt; "root@puppetserver",
  }

}</code></pre>
<p></p>

<p>
The information actually needed to set up the user is the username, the UID, the password hash, the groups, and the SSH key. But for our manifest, we need to provide the username 6 times, and the UID 3 times. Now imagine you had to manage 20 users this way. Luckily, there is a better solution.
</p>

<p>
Puppet allows us to define our own parametrized macros (called <em>defines</em>) which enable us to re-use manifests multiple times with different values, without the need to spell out the whole manifest again and again.
</p>

<p>
We start by creating a new module which will hold our macro:
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/macro-useradd/manifests/init.pp on puppetserver</span>
</p><pre><code>
define macro-useradd ( $name, $uid, $password, $groups, $sshkeytype, $sshkey ) {

  $username = $title

  user { "$username":
    comment    =&gt; "$name",
    home       =&gt; "/home/$username",
    shell      =&gt; "/bin/bash",
    uid        =&gt; $uid,
    gid        =&gt; $uid,
    managehome =&gt; "true",
    password   =&gt; "$password",
    groups     =&gt; $groups,
  }

  group { "$username":
    gid =&gt; $uid,
  }

  ssh_authorized_key { "default-ssh-key-for-$username":
    user   =&gt; "$username",
    ensure =&gt; present,
    type   =&gt; "$sshkeytype",
    key    =&gt; "$sshkey",
    name   =&gt; "$username",
  }

}</code></pre>
<p></p>

<p>
The manifest code is probably self-explaining, with the exception of the <em>$username = $title</em> line. Every block in Puppet manifests always has a title – it’s the string after the opening parenthesis, followed by the colon:
</p>

<p>
</p><pre><code>file { "/this/is/a/title":
  ...
}

group { "and-so-is-this".
  ...
}

package { "yet-another-title":
  ...
}</code></pre>
<p></p>

<p>
The title is used to uniquely identify a block statement. For a given node, you cannot have multiple blocks of a certain type with identical titles – that is, you cannot declare two <em>file</em> blocks for file <em>/foo/bar</em>. And, as you can see from these examples, the title is often used as a value when a block is executed – in <em>file</em> blocks, for example, the title is used as the path to the file the block should handle.
</p>

<p>
We do the same in our own macro: as the title passed to our <em>define</em>, we expect a Unix user name, and we use it accordingly within the blocks of our macro.
</p>

<p>
Note how in our macro quotation marks are used when dealing with parameters: Numerical values like <em>uid</em> and <em>gid</em> and array values like <em>groups</em> don’t need quotation marks, while string values like <em>comment</em> and <em>key</em> do. We learned before that the password hash, which contains the <em>$</em> character, needs to be put into single quotation marks in order to prevent interpretation of the <em>$</em> as the beginning of a parameter. This remains true when calling our macro, as we will see in a moment. Within the macro itself, we need to use double quotes again – this results in the <em>$password</em> parameter being interpreted, while the content of the parameter (the password hash containing <em>$</em> characters) isn’t interpreted again.
</p>

<p>
Now that the macro is defined, we need to rewrite our <em>user-ubuntu</em> manifest in order to use the macro there:
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/user-ubuntu/manifests/init.pp on puppetserver</span>
</p><pre><code>class user-ubuntu {

  macro-useradd { "ubuntu":
    name       =&gt; "ubuntu",
    uid        =&gt; "1000",
    password   =&gt; '$6$WzFG7Ga3$.BbRW/DFGkx5EIakXIt1udCGxVDPs2uFZg.o8EFzH8BX7cutimTCfTUWDdyHoFjDVTFnBkUWVPGntQTRSo1zp0',
    groups     =&gt; ["adm", "cdrom", "sudo", "dip", "plugdev", "lpadmin", "sambashare"],
    sshkeytype =&gt; "ssh-rsa",
    sshkey     =&gt; "AAAAB3NzaC1yc2EAAAADAQABAAABAQCvphOrxjMvgtBVTjMzPolL4JGarEigbPuH3cE3iNIcSBPgHyBjDwtin6ls6aMzm0ZbHMdinj1qxSbolkTQ1danZpOAe0G9NB9/ZnYCNd/kUeMAX91B0Pitx6NKoaz0x7H7V1Javd11RN3ylBw6dtOh35Lqmjx22RXNK8sMpLW8tKYOQuY01F5Eiv08U/AKO83w2ZNxYbNuuhHWeN7wHTb176uhuhGGnob0ArvaxCJgJ96bvDYLSph6V067q0chTuutLGSDA4AbC1Bb/d3wcAIqEM1s6VMT8oU0rUHkPH/1AqaKhWDrEcbSp94gAqTMWQxVz+XWBvu1Dc+CsujsqigT"
  }

}</code></pre>
<p></p>

<p>
Another run of <em>sudo puppet agent –verbose –no-daemonize –onetime</em> reveals that again, nothing changes on the target machine, because we only refactored our manifests but didn’t change their meaning.
</p>

<h2>Adding more users</h2>

<p>
The result of our refactoring is a very concise <em>user-ubuntu</em> manifest; using the new macro, adding lots of users is straight-forward. As an example, let’s add two more, Mary and Bob. I will simply reuse the password hash and SSH key of user <em>ubuntu</em>.
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/user-mary/manifests/init.pp on puppetserver</span>
</p><pre><code>class user-mary {

  macro-useradd { "mary":
    name       =&gt; "Mary",
    uid        =&gt; "1001",
    password   =&gt; '$6$WzFG7Ga3$.BbRW/DFGkx5EIakXIt1udCGxVDPs2uFZg.o8EFzH8BX7cutimTCfTUWDdyHoFjDVTFnBkUWVPGntQTRSo1zp0',
    groups     =&gt; ["sudo"],
    sshkeytype =&gt; "ssh-rsa",
    sshkey     =&gt; "AAAAB3NzaC1yc2EAAAADAQABAAABAQCvphOrxjMvgtBVTjMzPolL4JGarEigbPuH3cE3iNIcSBPgHyBjDwtin6ls6aMzm0ZbHMdinj1qxSbolkTQ1danZpOAe0G9NB9/ZnYCNd/kUeMAX91B0Pitx6NKoaz0x7H7V1Javd11RN3ylBw6dtOh35Lqmjx22RXNK8sMpLW8tKYOQuY01F5Eiv08U/AKO83w2ZNxYbNuuhHWeN7wHTb176uhuhGGnob0ArvaxCJgJ96bvDYLSph6V067q0chTuutLGSDA4AbC1Bb/d3wcAIqEM1s6VMT8oU0rUHkPH/1AqaKhWDrEcbSp94gAqTMWQxVz+XWBvu1Dc+CsujsqigT"
  }

}</code></pre>
<p></p>

<p>
<span class="filename beforecode">/etc/puppet/modules/user-bob/manifests/init.pp on puppetserver</span>
</p><pre><code>class user-bob {

  macro-useradd { "bob":
    name       =&gt; "Bob",
    uid        =&gt; "1002",
    password   =&gt; '$6$WzFG7Ga3$.BbRW/DFGkx5EIakXIt1udCGxVDPs2uFZg.o8EFzH8BX7cutimTCfTUWDdyHoFjDVTFnBkUWVPGntQTRSo1zp0',
    groups     =&gt; [],
    sshkeytype =&gt; "ssh-rsa",
    sshkey     =&gt; "AAAAB3NzaC1yc2EAAAADAQABAAABAQCvphOrxjMvgtBVTjMzPolL4JGarEigbPuH3cE3iNIcSBPgHyBjDwtin6ls6aMzm0ZbHMdinj1qxSbolkTQ1danZpOAe0G9NB9/ZnYCNd/kUeMAX91B0Pitx6NKoaz0x7H7V1Javd11RN3ylBw6dtOh35Lqmjx22RXNK8sMpLW8tKYOQuY01F5Eiv08U/AKO83w2ZNxYbNuuhHWeN7wHTb176uhuhGGnob0ArvaxCJgJ96bvDYLSph6V067q0chTuutLGSDA4AbC1Bb/d3wcAIqEM1s6VMT8oU0rUHkPH/1AqaKhWDrEcbSp94gAqTMWQxVz+XWBvu1Dc+CsujsqigT"
  }

}</code></pre>
<p></p>

<h2>Managing user rights</h2>

<p>
Let’s use those two accounts to demonstrate how we can handle not only the accounts themselves, but also their superuser privileges, through Puppet. The goal here is to be able centrally define who has which rights on what machine.
</p>

<p>
As you can see in the user manifests, <em>mary</em> is a member of the group <em>sudo</em>, but <em>bob</em> isn’t. This already results in <em>mary</em> being able to execute every command on all our machines with superuser privileges. However, we don’t want to give <em>bob</em> no superuser privileges at all – we just want to restrict his superuser privileges to the <em>puppetclient</em> system, while making him a “normal” user on all other machines. Group membership alone won’t cut it here – for this, we need a module that takes care of the <em>sudoers</em> file on all our machines.
</p>

<p>
Let’s first create the folder structure needed for this module:
</p>

<p>
<span class="filename beforecode">On the puppetserver VM</span>
</p><pre><code>~# <strong>sudo mkdir -p /etc/puppet/modules/sudo/manifests</strong>
~# <strong>sudo mkdir -p /etc/puppet/modules/sudo/files/etc</strong></code></pre>
<p></p>

<p>
We then create the manifest for this module:
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/sudo/manifests/init.pp on puppetserver</span>
</p><pre><code>class sudo {

  package { "sudo":
    ensure =&gt; present,
  }

  file { "/etc/sudoers":
    owner   =&gt; "root",
    group   =&gt; "root",
    mode    =&gt; 0440,
    source  =&gt; "puppet://$puppetserver/modules/sudo/etc/sudoers",
    require =&gt; Package["sudo"],
  }

}</code></pre>
<p></p>

<p>
The <em>/etc/sudoers</em> file that is managed by this manifests needs to be added to the module’s <em>file</em> folder:
</p>

<p>
<span class="filename beforecode">/etc/puppet/modules/sudo/files/etc/sudoers on puppetserver</span>
</p><pre><code>Defaults        env_reset
Defaults        secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# Host alias specification

# User alias specification

# Cmnd alias specification

# User privilege specification
root ALL=(ALL:ALL) ALL

# Members of the admin group may gain root privileges
%admin ALL=(ALL) ALL

# Allow members of group sudo to execute any command
%sudo ALL=(ALL:ALL) ALL

# Bob has superuser privileges on puppetclient only
bob puppetclient=(ALL:ALL) ALL</code></pre>
<p></p>

<p>
The idea here is to have only one <em>sudoers</em> for all machines in our infrastructure. This gives us a centralized rights management even though every machine refers to its local copy of <em>/etc/sudoers</em> when checking these rights.
</p>

<p>
Before we can deploy these changes, we need to map our new manifests to our node. We will group all user modules and the <em>sudo</em> module together into a new class, which avoids repetition once we add more nodes to our Puppet infrastructure:
</p>

<p>
<span class="filename beforecode">/etc/puppet/manifests/site.pp on puppetserver</span>
</p><pre><code><span class="highlight">class users {
  include user-ubuntu
  include user-mary
  include user-bob
  include sudo
}</span>

node "puppetclient" {
<span class="highlight">  include users</span>
  include apache2
}</code></pre>
<p></p>

<p>
And now we can finally apply the changes:
</p>

<p>
<span class="filename beforecode">On the puppetclient VM</span>
</p><pre><code>~# <strong>sudo puppet agent --verbose --no-daemonize --onetime</strong>

info: Caching catalog for puppetclient
info: Applying configuration version '1399957763'
info: FileBucket adding {md5}1b00ee0a97a1bcf9961e476140e2c5c1
info: /Stage[main]/Sudo/File[/etc/sudoers]: Filebucketed /etc/sudoers to puppet with sum 1b00ee0a97a1bcf9961e476140e2c5c1
notice: /Stage[main]/Sudo/File[/etc/sudoers]/content: content changed '{md5}1b00ee0a97a1bcf9961e476140e2c5c1' to '{md5}c5de61ca64ad4ef2e85e37d728d1be9f'
notice: /Stage[main]/User-mary/Macro-useradd[mary]/Group[mary]/ensure: created
notice: /Stage[main]/User-mary/Macro-useradd[mary]/User[mary]/ensure: created
notice: /Stage[main]/User-mary/Macro-useradd[mary]/Ssh_authorized_key[default-ssh-key-for-mary]/ensure: created
notice: /Stage[main]/User-bob/Macro-useradd[bob]/Group[bob]/ensure: created
notice: /Stage[main]/User-bob/Macro-useradd[bob]/User[bob]/ensure: created
notice: /Stage[main]/User-bob/Macro-useradd[bob]/Ssh_authorized_key[default-ssh-key-for-bob]/ensure: created
notice: Finished catalog run in 0.47 seconds</code></pre>
<p></p>

<h2>Summary</h2>

<p>
In this part, we demonstrated how Puppet can be used to deploy a centralized user and rights management solution without actually using a centralized directory service. We also learned how macros can be utilized to streamline and simplify more complex Puppet modules that are used multiple times.
</p>

<p>
In the upcoming part 5, we will look at Puppet’s Nagios integration, demonstrating that building a manageable server infrastructure using Puppet can deliver monitoring without additional management overhead.
</p>
