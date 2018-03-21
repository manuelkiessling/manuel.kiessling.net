---
date: 2010-02-26T16:13:00+01:00
lastmod: 2010-02-26T16:13:00+01:00
title: "Database Change Management mithilfe von VCS: Teil 1"
description: "Dieses Dokument beschreibt Werkzeuge und Prozesse, um Datenbankänderungen innerhalb von großen Softwareprojekten einfach, fehlerfrei und nachvollziehbar durchzuführen und zu managen."
authors: ["manuelkiessling"]
slug: 2010/02/26/database-change-management-mithilfe-von-vcs-teil-1
lang: de
---

<strong>Dieser Artikel ist Work in Progress!</strong>

<h3>Vorüberlegungen</h3>

Dieses Dokument beschreibt Werkzeuge und Prozesse, um Datenbankänderungen innerhalb von großen Softwareprojekten einfach, fehlerfrei und nachvollziehbar durchzuführen und zu managen.

Zentraler Ansatz dieser Lösung ist: Datenbankänderungen und Codeänderungen sind <strong>prinzipiell genau dasselbe</strong>. Denn Datenbankänderungen haben genau wie Codeänderung die folgenden Eigenschaften:

<ul>
 <li>Sie ändern das Verhalten des Softwaresystems</li>
 <li>Sie entwickeln sich verteilt in verschiedenen Projekten bzw. Branches, und müssen für Abnahme und Rollout/Release zusammengeführt werden</li>
 <li>Beim Zusammenführen kann es Überschneidungen und Konflikte geben, die man mitbekommen und lösen können möchte</li>
 <li>Man möchte sie auch später noch nachvollziehen können, also sehen wer wann was gemacht hat</li>
 <li>Man möchte diese Änderungen ggf. einem Reviewprozess unterziehen</li>
</ul>

Wenn wir Datenbankänderungen in diesem Sinne genau wie Codeänderungen <em>verstehen</em>, macht es auch Sinn, Datenbankänderungen genau wie Codeänderungen zu <em>behandeln</em>. Und das bedeutet, diese innerhalb des bereits vorhandenen Entwicklungsprozesses zu managen und im selben VCS Repository zu verwalten.

<h3>Abbildung der Datenbankänderungen im VCS</h3>

Unter <em>Datenbankänderungen</em> müssen wir verstehen: Alle SQL Statements, welche die Strukturen oder Inhalte einer Datenbank verändern.

Eine Datenbankänderung im Zuge eines Projekts, Bugfixes oder sonstigen Tickets ist daher folgerichtig eine Sammlung von SQL Statements, welche zusammen mit den Codeänderungen des zugehörigen Tickets im selben Branch vom Entwickler hinterlegt wird. Hinzu kommt, dass es eine klar definierte <em>Lokalität</em> für diese Änderung geben muss, damit ein Raum geschaffen ist, in dem Konflikte entstehen (und gelöst werden) können. So wie die gleichzeitige Änderung an der Datei <em>myFile.txt</em> in zwei verschiedenen, zu mergenden Branches zu einem Konflikt führt – da in beiden Branches die Datei den selben Speicherort, also dieselbe Lokalität besitzt – müssen auch Änderungen an derselben Tabelle in zwei Branches innerhalb derselben Lokalität des jeweiligen Branches stattfinden. Der vorgeschlagene Ansatz ist daher, die Struktur der Datenbank, also die Databases mit den darunterliegenden Tables, in einer analog aufgebauten Ordner-Datei-Struktur abzubilden.

Die Lokalität  für die Tabelle <em>users.hobbies</em> wäre beispielsweise die Datei <em>/dbchanges/users/hobbies.sql</em> innerhalb des VCS. Abgebildet wird die gesamte DB Struktur, also alle Databases mit allen ihren Tables:

<code>
/dbchanges/users/hobbies.sql
/dbchanges/users/contact.sql
...
/dbchanges/products/colors.sql
/dbchanges/products/forms.sql
...
</code>

und so weiter. Gerade bei komplexen Datenbanken macht es natürlich Sinn, diese Struktur mit einem Skript zu erzeugen, für MySQL kann man dazu in einem beliebigen Verzeichnis auf dem DB Server folgenden Code ausführen (geht davon aus, dass die MySQL Daten unterhalb /var/lib/mysql liegen):

<code>
find /var/lib/mysql -type f -name *.frm -exec dirname {} \;| cut -d "/" -f 5| xargs mkdir -pfind /var/lib/mysql -type f -name *.frm | cut -d "/" -f 5,6 | sed "s/.frm/.sql/g" | xargs touch
</code>

Diese Dateien nenne ich im folgenden <em>DB Change Container</em>.

<h3>Prozessbeschreibung</h3>

<h4>Während der Produktion eines neuen Release</h4>

Wichtig ist, dass sämtliche DB Change Container nach einem Release, nachdem diese Änderungen also auf dem Produktivsystem angewendet wurden, wieder leer sind – denn zum Start der Produktion eines neuen Releases liegen noch keine neuen Änderungen für die DB vor.

Nun beginnen die Entwickler, Tickets (Feature Requests, Bugs etc.) umzusetzen, einige gemeinsam in einem Branch, einige in eigenen Branches. Sind im Zuge einer Implementation Datenbankänderungen notwendig, hinterlegt der Entwickler innerhalb des zugehörigen Branches diese Änderungen nach folgendem Muster:

<ul>
 <li><u><strong>Case 1:</strong> Die Tabelle user.hobbies soll verändert werden (neues Feld, Feld löschen, Index anlegen oder löschen, einfügen, löschen oder ändern von Einträgen etc.)</u>

  Der Entwickler legt alle benötigten Statements in der Datei <em>/dbchanges/users/hobbies.sql</em> ab:

  <code>
USE users;
ALTER TABLE hobbies ADD newfield1 INT NOT NULL AFTER userId;
ALTER TABLE hobbies DROP oldfield;
ALTER TABLE hobbies ADD newfield2 TINYINT NOT NULL;
ALTER TABLE hobbies ADD INDEX (newfield2);
INSERT INTO hobbies ( id, name, value ) VALUES (1234, 'hobbyname', 'hobbyvalue');
  </code>
 </li>

 <li><u><strong>Case 2:</strong> Der Entwickler legt eine komplett neue Tabelle pets im vorhandenen Schema users an</u>

  Er erzeugt dazu eine neue Datei <em>/dbchanges/users/pets.sql</em> und füllt sie mit dem CREATE Statement (sowie ggf. INSERT Statements):

  <code>
USE users;
CREATE TABLE pets(
 id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 petname VARCHAR( 64 ) NOT NULL,
 FULLTEXT ( petname )
);
  </code>
 </li>

 <li><u><strong>Case 3:</strong> Der Entwickler legt eine neue Database products und darin eine neue Tabelle colors an</u>

   Er erzeugt einen neuen Ordner <em>/dbchanges/products</em> und darin eine Datei <em>colors.sql</em> mit folgendem Inhalt:
   <code>
CREATE DATABASE products;
USE products;
CREATE TABLE colors (
 id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 colorname VARCHAR( 24 ) NOT NULL);
   </code>
 </li>

 <li><u><strong>Case 4:</strong> Der Entwickler löscht die Tabelle colors in der Database products</u>

   Er füllt die Datei <em>/dbchanges/products/colors.sql</em> mit folgendem Inhalt:

  <code>
USE products;
DROP TABLE colors;
  </code>
 </li>
</ul>

Ansonsten läuft der Entwicklungsprozess wie gewohnt.

<h4>Merge aller Tickets für den Release</h4>

Werden nun verschiedene Tickets für den Release gebündelt, werden die einzelnen Branches wie gehabt gemerged. In Hinblick auf die DB Änderungen passiert nun folgendes:

Sämtliche Änderungen in den einzelnen Branches unterhalb von <em>/dbchanges</em> werden naturgemäß unterhalb <em>/dbchanges</em> im Merge zusammengeführt. Hierbei greifen die bekannten VCS Mechanismen: Wurden Änderungen in einer Datei nur in einem einzigen Branch oder Commit vorgenommen, werden diese Änderungen einfach angewendet. Wurden Änderungen an einer Datei (also innerhalb derselben Lokalität) in mehreren Branches vorgenommen, kommt es zu einem Konflikt.

Dies ist der erste wichtige Mechanismus der hilft, die drei Anforderungen – einfach, fehlerfrei und nachvollziehbar – zu gewährleisten: Da der Konflikt garantiert eintritt, ist auch garantiert, dass der Vorgang völlig automatisch die notwendige Aufmerksamkeit erzeugt und nicht übersehen werden kann.

Nun muss, wie auch bei Codekonflikten, gelöst werden: Machen beide Änderungen Sinn, oder widersprechen sie sich? Wie genau kann man sie am sinnvollsten zusammenführen? Relevant ist hier nur, dass am Ende ein Set an Änderungsanweisungen in den Approval committet wird, welches in sich rund ist. Falls es eine eigene Test oder QA Datenbank gibt auf die diese Änderungen angewendet werden müssen, wird dies gemacht nachdem alle Tickets fertig gemerged wurden.

<h4>Durchführung des Release</h4>

Wurde im Vorfeld alles richtig gemacht, muss im Zuge des Rollout oder Release nur noch das zusammengefasste Set an Änderungen ermittelt werden, und diese müssen dann, entsprechend ihrer jeweiligen Eigenschaft, ausgeführt werden. Die Summe der Änderungen ergibt sich aus der Summe aller Anweisungen in den DB Change Containern unterhalb <em>/dbchanges</em> – hier macht es natürlich Sinn, dass man diese mithilfe eines Skripts “zusammensammelt”, aber ich gehe hier nicht näher darauf ein.

Nach dem Rollout/Release, und vor dem Erzeugen neuer Branches, müssen dann im Trunk sämtliche Datenbank-Änderungsanweisungen aus den DB Change Containern entfernt werden (auch hier macht ein Skript wie z.B.

<code>
for f in `find . -type f -name *.sql`; do echo -n "" &gt; $f; done
</code>

Sinn, um diesen Schritt zu vereinfachen), und dies muss in den Trunk (oder von wo aus auch immer neue Branches gebildet werden) committet werden – denn sonst würden dieselben Änderungen beim nächsten Rollout erneut angewendet werden.
