---
date: 2011-01-11T16:13:00+01:00
lastmod: 2011-01-11T16:13:00+01:00
title: "Neues Projekt: Platform Health Viewer"
description: "Platform Health Viewer (kurz PHV) ist mein aktuelles Ruby on Rails Hobbyprojekt."
authors: ["manuelkiessling"]
slug: 2011/01/11/neues-projekt-platform-health-viewer
lang: de
---

<p>
Platform Health Viewer (kurz PHV) ist mein aktuelles Ruby on Rails Hobbyprojekt.
</p>
<p>
Sobald es einen stabilen Zustand erreicht, wird dieses Tool das Sammeln und Visualisieren verschiedener statistischer Daten, wie sie typischerweise von Internetplattformen erzeugt werden, schnell und leichtgewichtig ermöglichen. Beispiele für diese Daten sind Dinge wie die CPU Last einzelner Systeme, Benutzerlogins, Anzahl der Seitenaufrufe usw.
</p>
<p>
Die Applikation basiert in erster Linie auf <a href="http://rubyonrails.org/">Rails</a>, der HTTP Server für die Datenanlieferung ist in <a href="http://nodejs.org/">node.js</a> geschrieben, die Weboberfläche nutzt sehr ausgiebig <a href="http://jquery.com/">jQuery</a> und für die Erzeugung von SVG Graphen die <a href="http://raphaeljs.com/">Raphaël</a> Bibliothek. Massendaten werden in SQL gespeichert, weitere Daten liegen in einer <a href="http://couchdb.apache.org/">CouchDB</a>.
</p>
<p>
Der Projektcode ist auf Github abrufbar unter <a href="https://github.com/manuelkiessling/PlatformHealthViewer">https://github.com/manuelkiessling/PlatformHealthViewer</a>.
</p>
<p>
Das folgende Video ist eine kurze Einführung zur aktuellen Alphaversion des Projekts. Es enthält außerdem eine lustige Sprecherstimme und eine sehr kreative Interpretation der englischen Grammatik.
</p>

<iframe width="560" height="315" src="https://www.youtube.com/embed/HI6SRqz_3D0?si=yvuGFMJWXNDPIIoK" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

<br>
<p>
</p><p>

Im Folgenden das ins Deutsche übersetzte Transskript des Videos:

</p><blockquote>
Hi. Platform Health Viewer – oder PHV – ist mein aktuellen Hobbyprojekt.
<p>
Ich brauche eine einfache und leichtgewichtige Möglichkeit, die verschiedenen Kennzahlen der Webseite, für die ich verantwortlich bin, zu sammeln und zu visualisieren. Sachen wie die CPU Perfomance wichtiger Systeme, Userlogins, HTTP Anfragen.
</p><p>
Deshalb habe ich angefangen mit Ruby on Rails, jQuery, CouchDB und node.js zu experimentieren, und hier ist eine frühe Alphaversion, die ich demonstrieren möchte.
</p><p>
Mein Hauptziel ist es, den Prozess von der Einspeisung der Daten in das System bis hin zu ihrer grafischen Visualisierung so einfach wie möglich zu gestalten.
</p><p>
Um Daten in das System zu bekommen, benötigt man lediglich einen HTTP Aufruf, was es sehr einfach macht, die Daten der unterschiedlichsten Quellen zu sammeln.
</p><p>
Probieren wir ein Beispiel aus. I möchte die CPU Performance meiner lokalen Maschine visualisieren.
</p><p>
Ich werde diese Daten bekommen, indem ich einen Standard Unix Befehl verwende: sar.
</p><p>
Dies ist ein wichtiger Aspekt meines Ansatzes: Für den Platform Health Viewer spielt es überhaupt keine Rolle, woher die Daten stammen – man ist bei den Mitteln der Datenbeschafung völlig frei. Dadurch kann man wirklich alles in das System übermitteln, angefangen bei allgemeinen Daten wie der CPU Last bis hin zu äußerst individuellen Sachen wir den Logins auf der eigenen Webseite.
</p><p>
Ok, so bekomme ich den CPU “usr” Wert auf meiner OS X Kommandozeile:
</p><p>
sar 1 1| grep Average| cut -b 14-15
</p><p>
Fein, das wird’s tun.
</p><p>
Wie liefern wir diese Werte in das System? Es reicht ein simpler HTTP Post Aufruf mithilfe von curl:
</p><p>
curl –data “event[value]=`sar 1 1| grep Average| cut -b 14-15`&amp;event[source]=macbook&amp;event[name]=cpu_usr_percentage” http://localhost:3000/queue_event
</p><p>
Wie man sieht, die Nutzdaten des Aufrufs bestehen aus lediglich drei Parametern: Der Quelle des Events, dem Namen des Events, und seinem Wert.
</p><p>
Noch mal: Man ist an dieser Stelle komplett flexibel, man ist nicht gezwungen Eventnamen und -quellen zuvor im PHV zu konfigurieren – man definiert diese einfach im Moment der Dateneinlieferung, das das System akzeptiert diese. Wir werden gleich sehen, wie man mit den verschiedenen Events, die in das System geschrieben werden, sinnvoll umgeht.
</p><p>
Ok, ich verwende jetzt ein kleines Hilfsskript das ich geschrieben habe, um die CPU sys, idle, usr und nice Werte in das System zu liefern:
</p><p>
cat script/agents/macosx/cpu_overview_percent.sh
</p><p>
Wie man sieht, geschieht alles unter der Verwendung normaler Unixbefehle.
</p><p>
Starten wir also das Skript:
</p><p>
bash ./script/agents/macosx/cpu_overview_percent.sh http://localhost:3000/ macbook
</p><p>
Ich übergebe hier nur zwei Parameter, die URL zum Platform Health Viewer (der für diese Demonstration auf demselben Host läuft), und den Namen meiner Eventquelle, die ich “macbook” nenne. Eventnamen und -werten kommen direkt aus dem Hilfsskript.
</p><p>
Man sieht, wie das Skript alle vier CPU Kennzahlen in das System liefert. Schauen wir uns diese Daten innerhalb des Platform Health Viewer an.
</p><p>
Nun, das Dashboard ist nach wie vor leer, da wir noch keinerlei Visualisierungen definiert haben. Aber der “Tageditor” zeigt ebenfalls noch keinerlei Events an. Das liegt daran, dass die in das System eingelieferten Events noch nicht zu sogenannten Eventtypen normalisiert wurden.
</p><p>
Dies ist bewusst ein zusätzlicher Schrit, denn es erlaubt dem System, eingehende Events so schnell wie möglich in die Datenbank speichern zu können, ohne sie in Hinblick auf Name und Quelle normalisieren zu müssen. Diese Normalisierung erledigt ein Rake Task:
</p><p>
rake queue:convert
</p><p>
Dieser Task liest die Events aus der Anlieferungs-Queue, erzeugt bei Bedarf neue Eventtypen, oder verbindet die Events mit bereits existierenden Eventtypen, falls diese bereits existieren. Abschliessend wird die Anlieferungsqueue geleert.
</p><p>
Zurück im Tageditor, können wir die vier Eventtypen nun sehen.
</p><p>
Ein Eventtyp ist die Kombination einer Eventquelle und eines Eventnamen, also ist “macbook – cpu_idle_percentage” ein Eventtyp.
</p><p>
Schauen wir nun, wie wir den Tageditor verwenden können um etwas sinnvolles zu basteln. Das Gruppieren von einem oder mehreren Eventtypen unter einem Tag macht unsere eingelieferten Daten visualisierbar. Ich bin übrigens nicht ganz glücklich mit dem Begriff “Tag”, vielleicht fällt mir da noch etwas besseres ein.
</p><p>
Wie auch immer, erzeugen wir nun einen einfachen Tag den wir benutzen können, um genau einen Wert zu visualisieren.
</p><p>
Ich werde diesen Tag “macbook_cpu_usr” nennen. In diesen laufen dann alle Events, deren Quelle “macbook” und deren Name “cpu_usr_percentage” lautet. Ich könnte diese Parameter auch in die Textbox eintippen, aber es ist einfacher sie schlicht per Drag&amp;Drop in das Formular zu ziehen.
</p><p>
Ok, fügen wir diesen Tag also hinzu.
</p><p>
Wir haben nun also einen ersten Tag, und um zu sehen, ob er wie erwartet funktioniert, kann ich die Werte der zugeordneten Events in einer Vorschau kontrollieren.
</p><p>
Liefern wir jetzt ein paar weitere Werte in das System und schauen, ob sie dann hier angezeigt werden.
</p><p>
Ok, ich starte also mein Hilfsskript erneut um neue Werte in den Server zu liefern, und starte dann wiederum den Rake Task um die Werte zu normalisieren.
</p><p>
Ein erneuter Klick auf “Show latest events” zeigt diese neuen Werte nun an.
</p><p>
Ich starte die Datenanlieferung jetzt in einer Schleife, um viele Werte zu erhalten.
</p><p>
Ok, wir haben nach wie vor keine Datenvisualisierung, also gehen wir das jetzt an. Ich wechsle in’s Dashboard und füge einen Frame hinzu, dies ist ein Container der unsere Graphen enthalten wird.
</p><p>
Ein Frame ist die Visualisierung aller Werte die mit einem Tag verbunden sind, also muss ich den Namen des Tags angeben, das ich mit diesem Frame visualisieren möchte.
</p><p>
“Add frame”, und los geht’s. Ein einfacher Liniengraph, der einen meiner CPU Werte repräsentiert. Der Graph ist im Übrigen ein SVG, erzeugt mit Raphael, einer fantastischen JavaScript Bibliothek.
</p><p>
Und dank jQuery kann ich diesen Graphen frei bewegen und skalieren.
</p><p>
Erzeugen wir nun einen Graphen für alle meine CPU Werte. Zurück im Tageditor ziehe ich nun alle meine Eventtypen zusammen.
</p><p>
Ich kann übrigens Tags erzeugen, indem ich Eventquellen und -namen mit bereits existierenden Tags kombiniere, wie man hier sieht.
</p><p>
Ich überprüfe alle Werte die meinem neuen Tag zugeordnet sind, und dort sieht man alle CPU Werte, die mein Skript gesammelt hat.
</p><p>
Wieder zurück im Dashboard gehe ich her und erzeuge einen weiteren Frame, für meinen neuen Tag. Wie man sieht, enthält dieser Frame vier Liniengraphen und zeigt mir so eine hübsche Übersicht meiner kompletten CPU Performance. Natürlich wird hier eine Legende benötigt, etwas das bisher noch nicht implementiert ist.
</p><p>
Nun, das ist es, das ist der aktuelle Stand des Projekts. Ich würde mich sehr über Feedback freuen, der Code kann auf Github geforkt werden oder schreibt mir eine Mail.
</p><p>
Danke für’s Interesse.
</p></blockquote>
