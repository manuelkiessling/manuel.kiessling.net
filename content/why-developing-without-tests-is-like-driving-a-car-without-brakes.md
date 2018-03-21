---
date: 2011-04-07T16:13:00+01:00
lastmod: 2011-04-07T16:13:00+01:00
title: "Why developing without tests is like driving a car without brakes"
description: "The following roots in something I heard from Jon Jagger at QCon London 2011 after his fantastic talk about Deliberate Practice. It was related to Test Driven Development. He asked “Why do cars have brakes?”. It made us think “To stop!”, but he said “No – to go faster”."
authors: ["manuelkiessling"]
slug: 2011/04/07/why-developing-without-tests-is-like-driving-a-car-without-brakes-2
---

<blockquote>
<p>
The following roots in something I heard from <a href="http://twitter.com/JonJagger">Jon Jagger</a> at QCon London 2011 after his fantastic talk about <a href="http://qconlondon.com/london-2011/presentation/Deliberate+Practice">Deliberate Practice</a>. It was related to Test Driven Development. He asked “Why do cars have brakes?”. It made us think “To stop!”, but he said “No – to go faster”.
</p>
<p>
(Jon points out he didn’t invent it, he heard it from <a href="http://twitter.com/KevlinHenney">Kevlin Henney</a>).
</p>
<p>
I have been thinking about this ever since, and here is what I came up with.
</p>
</blockquote>

<p>
Imagine I would give you the keys to my car. I would tell you “here are the keys, you can drive wherever you want, including the highway, have fun!”
</p>

<p>
How fast would go? My car is not exactly a sports car, but it can do around 200 km/h. I guess we both agree that you would drive around 50 km/h within cities (the maximum allowed in Germany), and probably up to 200 km/h on the highway, as long as there is no limit.
</p>

<p>
Fine. Now image this: I would give you the keys to my car. I would tell you “here are the keys, you can drive wherever you want, including the highway, have fun! Oh, just one thing, <strong>the brakes don’t work</strong>.”
</p>

<p>
Now let’s forget for a moment that in reality, you probably wouldn’t start at all, if you <em>had</em> to drive, then how fast would you go? 10 km/h, maybe 20? Driving extremely cautious, always trying to look as far ahead as possible if you are going to need to halt? Yeah, I thought so.
</p>

<p>
But why is that? The brakes don’t have anything to do with the speed of my car – it’s still capable of doing 200 km/h just fine!
</p>

<p>
It’s because the ability to stop is what enables you to go real fast. With only a bit of exaggaration you could say that having a brake allows for a very “iterative” way of driving – no cars within the next 300 meters, let’s accelerate a bit – oh, there’s a car coming over from the right, let’s brake a bit – ok, now I can accelerate again – ah, there is a signal that suddenly turned red, no problem, I will stop here.
</p>

<p>
For me, this metaphor is the best I could find by now to explain to myself (and in the future, to others), why I <em>really</em> want to develop test-driven, and why it actually makes me faster, not slower, although I’m doing more.
</p>

<p>
Just as the brake doesn’t directly influence your driving speed, but does so indirectly, your tests won’t influence your coding speed directly, but indirectly. It’s because once they are in place, they allow you to iterate over your code and refactor it at what I, from my own experience, can only describe as the speed of light compared to conventional programming.
</p>

<p>
With tests in place, it’s like: Mh, what if I would split this rather long method into two? – ok, works; What if I put a bit more of dependency injection into this class? – ah, now this test here fails, no problem, I will have it back to green within minutes, I know exactly where to go to fix this; Hey, I could give this method here a better name – ok, still green; There’s this performance bottleneck deep inside this one class that is heavily used by a lot of other classes, let’s see if I can fix this – my tests will tell me if I accidently changed behaviour.
</p>

<p>
Compare this to conventional programming: You will never know for sure what breaks somewhere else if you change something. If you want to find out, you need huge amounts of manpower to have your webpage or UI tested for regression. What really happens is that you slow down to a near halt: because you don’t know what’s around the next corner when developing, and you know there is nothing that will immediately stop you and save you from harm if you take that next corner, you will drive, err, code so cautious, you won’t make any real progress.
</p>

<blockquote>
On which Jon commented: “Yes. As the pragmatic programmers say, paraphrasing – <em>you don’t know why it’s broken because you didn’t know why it worked in the first place.</em>”
</blockquote>
