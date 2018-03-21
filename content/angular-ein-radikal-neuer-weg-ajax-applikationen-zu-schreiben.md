---
date: 2010-08-25T16:13:00+01:00
lastmod: 2010-08-25T16:13:00+01:00
title: "<angular/> – ein radikal neuer Weg, Ajax Applikationen zu schreiben"
description: "JavaScript, Ajax und DHTML sind nicht wirklich meine Welt. Zum einen, weil ich einfach grundsätzlich eher mit dem Backend einer Software als mit dem Frontend zu tun habe, zum anderen, weil ich immer schon das ungute Gefühl hatte, in diesem Bereich muss man einfach deutlich zu viel Code produzieren um damit dann gefühlt deutlich zu wenig zu erreichen. Umso mehr hat <angular/> mein Interesse geweckt."
authors: ["manuelkiessling"]
slug: 2010/08/25/angular-ein-radikal-neuer-weg-ajax-applikationen-zu-schreiben
lang: de
---

<p>
JavaScript, Ajax und DHTML sind nicht wirklich meine Welt. Zum einen, weil ich einfach grundsätzlich eher mit dem Backend einer Software als mit dem Frontend zu tun habe, zum anderen, weil ich immer schon das ungute Gefühl hatte, in diesem Bereich muss man einfach deutlich zu viel Code produzieren um damit dann gefühlt deutlich zu wenig zu erreichen.
</p>

<p>
Umso mehr hat <em>&lt;angular/&gt;</em> mein Interesse geweckt. Die Autoren versprechen:
</p>

<blockquote>Write less code. A lot less. Forget about writing all that extra JavaScript to handle event listeners, DOM updates, formatters, and input validators. <angular> comes with autobinding and built-in validators and formatters which take care of these. And you can extend or replace these services at will. With these and other services, you’ll write about 10x less code than writing your app without <angular>.</angular></angular></blockquote>

<p>
In einem Video versucht Miško Hevery zu erklären, was <em>&lt;angular/&gt;</em> eigentlich ist, und stellt fest dass diese Erklärung schwierig ist:
</p>

<p align="center">
<object width="270" height="176"><param name="movie" value="http://www.youtube.com/v/0iQCLlu1dko?fs=1&amp;hl=de_DE&amp;rel=0&amp;hd=1"><param name="allowFullScreen" value="true"><param name="allowscriptaccess" value="always"><embed src="http://www.youtube.com/v/0iQCLlu1dko?fs=1&amp;hl=de_DE&amp;rel=0&amp;hd=1" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="270" height="176"></object>
</p>

<p>
Mein Verständnis ist in erster Linie: <em>&lt;angular/&gt;</em> bringt JavaScript-Logik und das dazugehörige HTML Dokument deutlich näher zueinander als bestehende Frameworks wie beispielsweise <em>jQuery</em>. Es entfernt gleich mehrere Ebenen an Abstraktion, die ein Stück JavaScript-Code und das DOM-Element, auf welchem der Code operieren möchte, voneinander trennen.
</p>

<p>
Während man bei traditioneller JavaScript-Programmierung stets gezwungen ist, explizit das HTML Dokument mit JavaScript-Code zu manipulieren, macht <em>&lt;angular/&gt;</em> die Verbindung zwischen Logik und HTML-Repräsentation implizit – etwas, das mich übrigens stark an die Mechanik erinnert, die Max Winde für <a href="http://172.16.111.147/2010/04/08/siqqel-ein-sehr-nutzliches-tool-fur-entwickler-business-analysten-produktmanager-und-qaler/">siqqel</a> einsetzt.
</p>

<p>
Spielen wir ein einfaches Beispiel durch, welches ich dank der rein clientseitigen Arbeitsweise von <em>&lt;angular/&gt;</em> problemlos direkt hier im Post zum laufen bringen kann.
</p>

Zuerst binde ich die <em>&lt;angular/&gt;</em> JavaScript Bibliothek ein:

<pre><code>&lt;script type="text/javascript"
 src="http://angularjs.org/ng/js/angular-debug.js" ng:autobind&gt;
&lt;/script&gt;
</code></pre>

Nun definiere ich ein Input Feld sowie einen <em>&lt;angular/&gt;</em>-Platzhalter, welche beide in einer Beziehung zueinander stehen:

<pre><code>Dein Name: &lt;input type="text" name="deinname" value="Manuel"/&gt;
&lt;br /&gt;
Hallo {<span class="nospace">{deinname}<span class="nospace">}!
</span></span></code></pre>

<p>
Wodurch entsteht diese Beziehung? Sie ist dank Autobinding implizit, und mappt alleine aufgrund des Formularfeldnamens und des Platzhalternamens beide zusammen.
</p>

<p>
Das Ergebnis sieht man hier – einfach den Inhalt des Textfeldes ändern:
</p>

<p>
<script type="text/javascript" src="http://angularjs.org/ng/js/angular-debug.js" ng:autobind="">
</script>

Eingabe: <input name="yourname" value="Welt" type="text"> – Hallo {{yourname}}!
</p>

<p>
Dieses Beispiel geht natürlich maximal als Spielerei durch. Es zeigt aber schon, wieviel weniger Code nötig ist, als dies mit einem klassischen Framework der Fall wäre.
</p>

Ein etwas praxisnäheres Beispiel findet man unter <a href="http://angularjs.org/Cookbook:BasicForm">http://angularjs.org/Cookbook:BasicForm</a>. In diesem Beispiel geht es um den klassischen Fall, Eingaben in ein Textfeld per JavaScript clientseitig zu validieren – dies ist einfach möglich durch folgende schlanke und ausdrucksstarke Syntax:

<pre><code>&lt;input type="text" name="user.address.state" size="2"
 ng:required ng:validate="regexp:/^\w\w$/"/&gt;
</code></pre>

Für weitere Informationen verweise ich auf <a href="http://angularjs.org/Overview">http://angularjs.org/Overview</a>.
