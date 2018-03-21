---
date: 2010-09-01T16:13:00+01:00
lastmod: 2010-09-01T16:13:00+01:00
title: "Testgetriebene Administration – test driven administration"
description: "Ich hatte tatsächlich einmal eine ganz eigene Idee. Und sie war gut, auch nachdem ich sie mehrmals durchgekaut und von allen Seiten beleuchtet hatte."
authors: ["manuelkiessling"]
slug: 2010/09/01/testgetriebene-administration-test-driven-administration
lang: de
---

<p>
Ich hatte tatsächlich einmal eine ganz eigene Idee. Und sie war gut, auch nachdem ich sie mehrmals durchgekaut und von allen Seiten beleuchtet hatte.
</p>

<p>
Wieso eigentlich sollte man die Prinzipien und Methodiken von testgetriebener Softwareentwicklung nicht auch auf den Bereich der IT-Systemadministration übertragen? Also in aller Kürze: Ich definiere Tests, die das vom noch zu implementierenden System erwartete Verhalten prüfen, sehe zu wie diese Tests fehlschlagen, und erfülle dann schrittweise diese Tests, indem ich das System aufbaue. Test driven administration – TDA.
</p>

<p>
Da war ich ganz alleine drauf gekommen, und ich war sehr stolz.
</p>

<p>
Dann habe ich gegoogelt. Die Idee existiert seit mindestens 2006.
</p>

<p>
Aber hey, gut ist die Idee trotzdem, also beschreibe ich sie hier.
</p>

<p>
Warum möchte man testgetrieben administrieren? Die Gründe sind dieselben wie bei testgetriebener Entwicklung: Habe ich Tests, bin ich gegen Regression geschützt, d.h. ändert ein Stück Code / ein System sein Verhalten aufgrund von Änderungen, weisen mich die Tests darauf hin.
</p>

<p>
Gehe ich test<em>getrieben</em> vor, sind die Tests nicht irgendwas, das ich ganz unbedingt machen sollte, das aber doch am Ende runterfällt, sondern sie sind garantiert vorhanden. Mit den bekannten angenehmen Begleiterscheinungen, dass die Tests einen zwingen, sich Gedanken darüber zu machen, wie das Ziel eigentlich beschaffen sein soll, und automatisch dazu führen, die Lösung schlank und elegant umzusetzen.
</p>

<p>
Code und IT-Systeme sind aber nicht dasselbe, wie würde man also in der Praxis konkret vorgehen? Hier mein Vorschlag.
</p>

<p>
Zuerst benötigt man ein Testwerkzeug. Um in der Softwareentwicklung Unittests zu bauen, benutzt man Tools aus der xUnit Familie wie JUnit oder phpUnit. Das Äquivalent zu diesen Tools in der Systemadministration sind Monitoringsysteme wie Nagios oder Zabbix.
</p>

<p>
In der Softwareentwicklung formuliert man Unittest so, dass man eine kleine Einheit des Gesamtsystems, also in der Regel die einzelnen Methoden einer Klasse, mit einer gewissen Erwartungshaltung (“wenn ich diese Parameter reingebe, erwarte ich jenen Rückgabewert”) aufruft, und dann die erwartete Rückgabe mit der tatsächlichen vergleicht.
</p>

<p>
Was wäre dementsprechend “erwartetes Verhalten” bei einem IT-System? Nehmen wir an, die Anforderungen lauten wie folgt:
</p>

<blockquote>
Benötigt wird ein Linux-System, welches unter der IP 123.456.789.000 einen Webserver bereitstellt, und die Festplattengröße des Systems soll 100 GB betragen.
</blockquote>

<p>
In der Realität wären die Anforderungen natürlich umfangreicher, aber ich halte das Beispiel einfach.
</p>

<p>
Aus den Anforderungen lässt sich das gewünschte Verhalten ableiten:

</p><ul>
	<li>Bei einem Ping auf 123.456.789.000 muss eine Antwort erfolgen</li>
	<li>Die Abfrage des Betriebssystems unter dieser IP muss “Linux” ergeben</li>
	<li>Ein HTTP Request gegen diese IP unter Port 80 muss eine HTTP Antwort zur Folge haben</li>
	<li>Bei der Abfrage der Festplattengröße muss ein Wert von 100 GB zurückgeliefert werden</li>
</ul>
<p></p>

<p>
Daraus wiederum kann man im Monitoringsystem Tests formulieren. Diese lässt man einmalig laufen, um zu verifizieren, dass sie tatsächlich fehlschlagen. Und dann beginnt man damit, ein System aufzusetzen, das die Testbedingungen erfüllt, bis schliesslich alle Tests “grün” sind.
</p>

<p>
Das ist der Kern der Idee. Im weiteren Verlauf überwacht man die Tests regelmäßig (was man mit einem Monitoringsystem ja eh tut), und hat damit das Thema Continuous Integration gleich mit erschlagen. Ansonsten geht man genauso wie auch beim TDD vor: Möchte man Änderungen an einem System vornehmen, passt man zuerst die Tests an, verifiziert dass sie fehlschlagen, und ändert dann das System, um die Tests wieder zu erfüllen.
</p>
