---
date: 2011-11-07T16:13:00+01:00
lastmod: 2011-11-07T16:13:00+01:00
title: "How hosting MyHammer started in a devops way back in the day"
description: "This here is just me, bragging about myself. You have been warned. This guy with the psychopathic look standing in a room full of rubbish in front of something that vaguely looks like computers is me standing in front of the first MyHammer server cluster, only days before the whole system went into production."
authors: ["manuelkiessling"]
slug: 2011/11/07/how-hosting-myhammer-started-in-a-devops-way-back-in-the-day
---

<p>
This here is just me, bragging about myself. You have been warned.
</p>

<p>
<a href="/images/manuel_kiessling_myhammer_fai.jpg"><img src="/images/manuel_kiessling_myhammer_fai.jpg" alt="Manuel Kießling in front of the very first MyHammer FAI server cluster" title="Manuel Kießling in front of the very first MyHammer FAI server cluster" class="alignnone size-medium wp-image-434" width="300" height="225"></a>
</p>

<p>
This guy with the psychopathic look standing in a room full of rubbish in front of something that vaguely looks like computers is me standing in front of the first MyHammer server cluster, only days before the whole system went into production.
</p>

<p>
It was 2005, and I had set up the whole system in a way I’m still quite proud of. Being the only systems administrator at the company at that time, I knew that I wouldn’t face happy times if I would set up the cluster in a traditional way, that is, machine by machine. Although it started small, the system was supposed to grow, especially regarding the web servers, and even I knew that while managing 13 servers individually was doable, it wasn’t fun, and managing several dozen machines just sounded like total nightmare.
</p>

<p>
Which is why I thought about better ways to setup and manage the whole cluster. I ended up with a central installation server running <a href="http://fai-project.org/">FAI – Fully Automatic Installation</a>, and hosting a <a href="http://cfengine.com/community">cfengine</a> server. This way, new machines could be automatically provisioned with the operating system (Debian GNU/Linux) they needed by simply booting from their network adaptor, and new as well as existing systems could easily be maintained, configured, and updated via cfengine. No need to ever log in on a specific machine to change configuration or install software. A centralized syslog server completed the picture.
</p>

<p>
cfengine was a major pain in the ass at times, and with Chef and Puppet there a way more sophisticated tools available today, but the overall system ran extremely well and could easily scale over time.
</p>

<p>
Years later, the term Devops was coined, and I couldn’t help congratulating myself for getting it right so long ago.
</p>
