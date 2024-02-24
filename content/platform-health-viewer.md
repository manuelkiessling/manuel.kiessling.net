---
date: 2011-01-11T16:13:00+01:00
lastmod: 2011-01-11T16:13:00+01:00
title: "New project: Platform Health Viewer"
description: "Platform Health Viewer is my current Ruby on Rails pet project."
authors: ["manuelkiessling"]
slug: 2011/01/11/platform-health-viewer
---

<p>
Platform Health Viewer is my current Ruby on Rails pet project.
</p>
<p>
Once stable, it will allow users to easily collect and visualize different types of statistical data which is typically produced by internet platforms, like CPU performance, user logins, HTTP requests etc.
</p>
<p>
The main application is build on <a href="http://rubyonrails.org/">Rails</a>, the server used for data collection is written in <a href="http://nodejs.org/">node.js</a>, the web interface makes heavy use of <a href="http://jquery.com/">jQuery</a> and uses <a href="http://raphaeljs.com/">Raphaël</a> to create SVG graphs. Mass data is saved in a SQL db, other data is stored using <a href="http://couchdb.apache.org/">CouchDB</a>.
</p>
<p>
The project’s code is hosted on Github at <a href="https://github.com/manuelkiessling/PlatformHealthViewer">https://github.com/manuelkiessling/PlatformHealthViewer</a>.
</p>
<p>
This video is a short introduction to the current alpha version of the project. A funny voice and lots of grammatical shortcomings are included for free:
</p>

<iframe width="560" height="315" src="https://www.youtube.com/embed/HI6SRqz_3D0?si=yvuGFMJWXNDPIIoK" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

<br>
<p>
</p><p>

Transcription of the video:

</p><blockquote>
Hi. Platform Health Viewer – or PHV – is my current pet project.
<p>
I need an easy and lightweight way to collect and visualize the different key performance indicators of the web platform I’m responsible for – stuff like CPU performance of important systems, user logins, http requests.
</p><p>
So I started to play around with Ruby on Rails, jQuery, CouchDB and node.js, and here is an early alpha I would like to demonstrate.
</p><p>
My primary goal was to make the process from feeding data into the system to visualizing that data as simple as possible.
</p><p>
In order to get data into the system, all you need to make is an HTTP call, which makes it very easy to collect data from very different sources.
</p><p>
Let’s try an example. I would like to visualize the cpu usage of my local machine.
</p><p>
I’m going to collect this data using a standard unix command, sar.
</p><p>
That’s an important aspect of my approach: It doesn’t play any role for the Platform Health Viewer where the data comes from, you’re completely free to choose how to collect it.
This way you can feed really anything into the system, from generic data like CPU load to highly individual stuff like the user logins of your specific web site.
</p><p>
Ok, here is how I can get my cpu “usr” value on my OS X command line:
</p><p>
sar 1 1| grep Average| cut -b 14-15
</p><p>
Great, that will do.
</p><p>
How do we push these values into the system? It’s a simple http post request using curl:
</p><p>
curl –data “event[value]=`sar 1 1| grep Average| cut -b 14-15`&amp;event[source]=macbook&amp;event[name]=cpu_usr_percentage” http://localhost:3000/queue_event
</p><p>
As you can see, the payload of the post requests is just 3 parameters: the source of the event, the name of the event, and its value.
</p><p>
Again, you’re completely free here, you don’t need to configure event names and sources inside PHV – just define them when pushing data into the system, it will happily accept it. We will see in a moment how to make sense of different events that were pushed into the system.
</p><p>
Ok, let’s use a small helper script I wrote in order to feed the CPU sys, idle, usr and nice values into my system:
</p><p>
cat script/agents/macosx/cpu_overview_percent.sh
</p><p>
As you can see, this is all done using only standard unix commands.
</p><p>
Let’s start the script:
</p><p>
bash ./script/agents/macosx/cpu_overview_percent.sh http://localhost:3000/ macbook
</p><p>
I’m just providing two parameters here, the URL to my platform health viewer installation, which resides on the same host for this demo, and the source name, which I call “macbook”.
</p><p>
As you can see, my script pushes all four CPU usage values into the system. Now let’s have a look at this data within platform health viewer.
</p><p>
Well, the Dashboard is still empty, because we did not yet define any visualizations. But the “Tageditor” doesn’t show any events, too. This is because the events I pushed into the system have not yet been normalized to event-types.
</p><p>
This is an additional step, because it will allow the system to push incoming events into the database as quickly as possible without the need to normalize those events regarding their name and source. This normalization is done using a rake task:
</p><p>
rake queue:convert
</p><p>
This task reads the events from the incoming queue, creates new event-types as needed, or connects the event values with existing event types if they already exists. It then deletes the incoming queue.
</p><p>
Getting back to our tageditor, we can now see our 4 event types.
</p><p>
An event type is the combination of an event source and an event name, so “macbook – cpu_idle_percentage” is one event type.
</p><p>
Let’s see how we can use the tag editor to create something useful. Grouping one or more event types into a tag is what makes our data suitable for visualization. I’m not quite happy with the term “tag” by the way, maybe I will come up with something better.
</p><p>
Anyway, let’s create a very simple tag which we can use to visualize exactly one value.
</p><p>
I’m going to name my tag “macbook_cpu_usr”. It will hold all events whose source matches “macbook”, and whose name matches “cpu_usr_percentage”. I could type those parameters into the text box, but it’s easier to just drag’n'drop them there.
</p><p>
Ok, let’s add this tag.
</p><p>
Now we have this first tag, and to check if it works as expected, I can preview the values of the matching events.
</p><p>
Let’s push some new values into our system and check if they are visible here.
</p><p>
Ok, I’m starting my helper skript again in order to post new values to the server, and I start my rake task in order to normalize these values.
</p><p>
Clicking again on “Show latest events” now shows these values.
</p><p>
I will now start data push and normalization in a loop in order to get a lot of values.
</p><p>
Ok, we still have no data visualization, so let’s do this now. Let’s switch to the Dashboard and add a frame, which is a container that will hold our graph.
</p><p>
A frame is the visualization of all values connected to a tag, so I need to provide the name of the tag I want to visualize with this frame.
</p><p>
“Add frame”, and here we go. A simple line graph representing one of my CPU values. The graph is actually an SVG, created using Raphael, an awesome JavaScript library.
</p><p>
And thanks to jQuery, I can freely move and resize the graph.
</p><p>
Let’s create a graph with all my CPU values in it. Back to the Tageditor, I’m going to drag all my values together.
</p><p>
I can also create tags by combining event-sources and -names with already existing tags, as you can see here.
</p><p>
Let’s check the values of my new tag, and there are all the different CPU values my script collects.
</p><p>
Back to the Dashboard, I’m going to create another frame for my new tag. As you can see, this one contains 4 linegraphs and gives me a nice overview of my system’s CPU performance. Of course, a graph legend is needed, something that’s not yet implemented.
</p><p>
Well, that’s it, that’s the current state of this project, I would love to hear your feedback, you can fork the code on github and drop me an e-mail.
</p><p>
Thanks for your interest.
</p></blockquote>
