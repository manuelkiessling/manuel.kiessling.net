---
date: 2010-04-08T16:13:00+01:00
lastmod: 2010-04-08T16:13:00+01:00
title: "siqqel: SQL-Abfragen direkt aus HTML heraus ausführen und darstellen"
description: "Ein Kollege von mir, Max Winde, hat in den vergangenen Wochen ein Tool geschrieben welches sich innerhalb kürzester Zeit zu einem Renner in den verschiedensten Abteilungen entwickelt hat, und schon jetzt aus dem Arbeitsalltag kaum noch wegzudenken ist: siqqel."
authors: ["manuelkiessling"]
slug: 2010/04/08/siqqel-ein-sehr-nutzliches-tool-fur-entwickler-business-analysten-produktmanager-und-qaler
lang: de
---

Ein Kollege von mir, Max Winde, hat in den vergangenen Wochen ein Tool geschrieben welches sich innerhalb kürzester Zeit zu einem Renner in den verschiedensten Abteilungen entwickelt hat, und schon jetzt aus dem Arbeitsalltag kaum noch wegzudenken ist: <strong>siqqel</strong>.
<p>
</p><h3>Welchen Zweck erfüllt siqqel?</h3>
<p>
Die verschiedensten Leute in einem Unternehmen müssen aus den verschiedensten Gründen auf relationale Datenbanken zugreifen. Klassischerweise gibt es zwei Szenarien:
</p><p>
</p><ul>
<li><strong>Ich brauche eine einfache und kurze Information</strong></li>
<li>Beispiel: “Wie war noch gleich der ‘name’ des ‘product’ mit der Id 12345?” oder “Wieviele Einträge waren doch gleich in der ‘city’ Tabelle?”</li>
</ul>
<p>
Üblicherweise schmeisst man dafür direkt die SQL Kommandozeile an, oder man benutzt ein Tool wie Toad, phpMyAdmin, oder irgend einen anderen Query-Browser.
</p><p>
</p><ul>
<li><strong>Ich benötige eine komplexe Auswertung wichtiger Kennzahlen, inklusive historischer Betrachtung und Querverweisen, und diese brauche ich langfristig und regelmäßig</strong></li>
<li>Beispiel: “Wir müssen die Conversions unserer User auswerten” oder “Ich brauche eine täglich aktualisierte Auswertung unserer Produktverkäufe”</li>
</ul>
<p>
Üblicherweise werden hierfür komplexe und spezialisierte Enterprise-Tools wie Data Warehouses benutzt und manchmal auch selbst implementiert.
</p><p>
Das ist auch alles fein, und die Tools für beide Szenarien sind vielfältig und ausgereift. In der Praxis gibt es aber ein weiteres Szenario, welches sozusagen “dazwischen” liegt: Hier ein paar Beispiele:
</p><p>
</p><ul>
<li>Die QA Abteilung soll einem Bug nachspüren und muss dafür über einen Zeitraum von einigen Tagen einige mittelkomplexe Datenanalysen fahren und diese regelmäßig aktualisieren (“zu welcher Tageszeit kommt es vor dass User aus Gruppe X auf Seite Y Aktion Z durchführen, und dann die Kombination der Daten aus Tabelle A, B, und C gleich D ergibt?”)</li>
<li>Ein Produktmanager soll ein neues Feature konzeptionieren und benötigt dafür über einen sehr begrenzten Zeitraum eine Auswertung über verschiedene Business-Kennzahlen. Da die Analyse auf ganz neuen Annahmen beruht, helfen die im Data Warehouse vorhandenen Reports nicht weiter.</li>
<li>Ein Softwareentwickler arbeitet an der Anbindung eines externen Webservice, und möchte während der Implementations- und Testphase alle Tabellen und die zusammengehörenden Daten, die aus Webservice-Calls resultieren, im Blick haben, ohne jedes Mal 30 einzelne Queries abfeuern und miteinander in Verbindung bringen zu müssen.</li>
<li>Ein Business Analyst soll einen größeren Report vorbereiten, möchte aber erst mal ein Gefühl dafür bekommen welche Daten er benötigt und wie er diese sinnvoll miteinander verknüpfen kann.</li>
</ul>
<p>
Alle diese Beispiele haben eines gemeinsam: Die “kleine” Lösung, direkt einzelne Queries nacheinander an die DB zu schicken und die Ergebnisse dann händisch zusammenzutragen und miteinander in Verbindung zu bringen, ist <em>zu</em> klein, damit zu anstrengend und ineffektiv. Man kennt das, man fängt dann an sich die Queries in irgendein Textfile zu pasten damit sie nicht verloren gehen, oder man hat in Tools wie phpmyadmin plötzlich 15 Browsertabs auf und wird langsam wahnsinnig.
</p><p>
Die “große” Lösung ist aber wiederum <em>zu</em> groß: &nbsp;Es lohnt in der Regel nicht, einen Business-Analysten mehrere Stunden oder Wochen mit dem Bau eines Reports aus dem Data Warehouse zu beauftragen, nur weil man wenige Tage lang etwas beobachten oder nur vorübergehend Daten debuggen muss.
</p><p>
Der Kompromiss sieht dann häufig so aus, dass man anfängt eine Zwischen-Notlösung auf irgend einer Insel zu bauen: Man fängt an, mit irgendwelchen ODBC Kontrukten und Excel. Schick mir so eine Excel Datei, und ich sehe nichts, denn ich habe ODBC gerade nicht richtig eingerichtet. Oder der Produktmanager, der seine temporäre, aber komplexe Auswertung braucht, bekommt eine virtuelle Maschine mit einer Basisinstallation von PHP, ein Developer gibt ihm einen Crash-Kurs in PHP-Entwicklung, und los geht das Gefrickel. Irgendwo fliegen dann diese Skripte rum, nach ein paar Monaten, wo sie vielleicht für eine neue, ähnliche Analyse noch mal nützlich gewesen wären, findet sie dann auch keiner mehr. Der PM schlägt sich mit Programmierung rum, Sysops meckert zu Recht, dass sie jetzt auch noch diese Spielkiste managen müssen, alle sind unglücklich, und irgendwo in der Ferne fängt ein kleines Kind an zu weinen.
</p><p>
Das muss nicht sein!
</p><p>
Denn genau diese Nische zwischen “einfach mal ein Query” und “das große böse komplette Data Warehouse” besetzt <em>siqqel</em> exzellent, ohne die Probleme der frickeligen Insellösungen einzuführen.

</p><h3>Wie funktioniert siqqel?</h3>

Die Mächtigkeit von siqqel liegt darin, dass es den Applikationsstack, der benötigt wird, um Anfragen an die Datenbank zu übermitteln, die Antwort entgegenzunehmen und die empfangenen Daten darzustellen, auf etwas recht bekanntes und verbreitetes beschränkt: den Browser.
<p>
SQL Queries werden direkt in einer statischen HTML Datei notiert. Per Ajax werden diese an ein zentral abgelegtes Backend-Skript übermittelt. Das Result Set wird an den Browser zurückgeliefert und direkt dort per DHTML dargestellt. Mit (D)HTML Bordmitteln, JavaScript und CSS kann man direkt innerhalb des HTML Dokuments dann beliebig flexibel mit den Result Sets arbeiten.

Richtig, ganz ohne PHP geht es nicht. Es braucht einen Punkt im Backend, welcher den SQL Query vom Browser entgegennimmt, an die DB übermittelt, und das Result Set als JSON an den Browser zurückliefert. Aber man beachte die Vorteile zur vorhin beschriebenen Insellösung:
</p><ul>
	<li>Das Skript wird einmalig an zentraler Stelle in der Serverlandschaft hinterlegt – zum Beispiel an dieselbe Location, an der bereits der phpMyAdmin läuft; dann hat man vielleicht sogar gleich die Frage der Zugriffsrechte erschlagen, denn (üblicherweise) haben nur die richtigen Personen im Unternehmen Zugriff auf diese Ressource, und Sicherheitsmechanismen, die für die Zugriffsicherung des phpMyAdmin bereits implementiert wurden (wie .htaccess, SSL Public Keys etc.), greifen ohne zusätzlich notwendige Handgriffe auch für das PHP Backend von siqqel.</li>
	<li>Nun kann jeder sofort anfangen, Reports auf Basis von siqqel zu bauen – alles was er braucht: Zugriffsrecht auf die HTTP Location des PHP Backend Skripts – und einen Browser!</li>
</ul>
<p>
Wie funktioniert das nun im Detail?
</p><p>
Angenommen, es gibt im Intranet eine MySQL Datenbank mit einer Tabelle, in der stehen alle Produkte des Unternehmens. Nennen wir sie ‘product’, und nehmen an sie befindet sich im Schema ‘data’. Nehmen wir weiterhin an, es gibt einen Server, auf dem wurde phpmyadmin installiert, damit man über diese Datenbank browsen kann. Dieses ist erreichbar unter unter <em>http://intranet/secure/phpmyadmin</em>. <em>/secure</em> ist der mit Zugriffsrechten versehene Teil des Servers.

Nun muss ein Systemadministrator die PHP Backendskripte unter <em>http://intranet/secure/siqqel/</em> hinterlegen, und die Konfiguration anpassen um dem siqqel PHP Code Zugriff auf die genannte Datenbank zu ermöglichen.

Ein siqqel User muss dann nur eine HTML Datei erzeugen (auf seinem Desktop oder wo auch immer, ein LAMP Kontext wird ja nicht benötigt), die folgendes enthält:
<pre><code>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;

&lt;script type="text/javascript" src="http://intranet/secure/siqqel/siqqel.js.php"&gt; &lt;/script&gt;

&lt;/head&gt;
&lt;body&gt;

&lt;table sql="SELECT * FROM data.product"&gt;&lt;/table&gt;

&lt;/body&gt;
</code></pre>

Öffnet er diese Datei lokal in seinem Browser, wird das SQL Statement im Attribut der Table an das Backend Skript übermittelt, das Result Set als JSON zurückgegeben, und der Inhalt der Datenbanktabelle automatisch in das table Element gerendert.

</p><p>

Von hier aus hat man alle Möglichkeiten: Man möchte mehrere Tabellen auf einmal anzeigen? Man erzeugt einfach mehrere table Elemente mit den entsprechenden Queries. Man möchte alle Zeilen im Result Set, bei denen die Spalte <em>name</em> mit “a” beginnt in der HTML Tabelle hervorheben? Kein Problem, jede Tabelle, Zeile und Spalte liefert ein “loaded” Event, also hat man mit einem JavaScript-Konstrukt wie

<pre><code>
$('td.name').live('loaded', function(name) {
  // do something useful.
});
</code></pre>

alle Möglichkeiten. Der Client Teil von siqqel basiert auf jQuery, also kann man schnell und einfach Reports bauen mit allen sinnvollen und sinnlosen Möglichkeiten, die jQuery bietet.

</p><p>

Was sind die weiteren Vorteile? Nun, die HTML Datei ist nicht nur der View des Reports, die HTML Datei <em>IST</em> der Report. Man kann ihn in die vielleicht vorhandenen Coderepositories im Unternehmen packen, man kann ihn per Mail verschicken, man, wenn die Wikisoftware es zulässt, seine Reports sogar direkt nativ in eine Wikiseite packen und so besonders effizient mit den Kollegen im Unternehmen teilen.

Die Projektseite von siqqel ist <a href="http://github.com/MyHammerOpenSource/siqqel">http://github.com/MyHammerOpenSource/siqqel</a>. Nicht wundern, bis vor kurzem hieß das Projekt noch “sqlHammer”, der Begriff mag noch an verschiedenen Stellen auftauchen.

Bei Fragen zu siqqel empfehle ich, ein <a href="http://github.com/MyHammerOpenSource/siqqel/issues">Issue Ticket bei github zu öffnen</a>, oder wendet euch an <a href="mailto:opensource@myhammer.com">opensource@myhammer.com</a>.</p>
