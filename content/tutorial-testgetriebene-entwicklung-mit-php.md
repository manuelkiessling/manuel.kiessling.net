---
date: 2010-08-23T16:13:00+01:00
lastmod: 2010-08-23T16:13:00+01:00
title: "Tutorial: Testgetriebene Entwicklung mit PHP"
description: "Testgetriebene Entwicklung (test driven development) ist eine Arbeitsmethodik, die Softwareentwickler dabei unterstützt, wichtige Qualitätsprinzipien bei der Erstellung von Code zu erreichen. Dieses Tutorial beschreibt Schritt für Schritt die Motivation, einem testgetriebenen Ansatz zu folgen, und stellt die notwendigen Werkzeuge und Techniken vor."
authors: ["manuelkiessling"]
slug: 2010/08/23/tutorial-testgetriebene-entwicklung-mit-php
lang: de
---

<h3>Einleitung</h3>
<p>
Testgetriebene Entwicklung (test driven development) ist eine Arbeitsmethodik, die Softwareentwickler dabei unterstützt, wichtige Qualitätsprinzipien bei der Erstellung von Code zu befolgen:
</p><p>

</p><p>
</p><ul>
	<li><strong>Lose Kopplung (loose couping)</strong> – weil man beim Schreiben von Unittests, dem zentralen Werkzeug der Methodik, ganz automatisch dazu verführt wird, innerhalb der Tests von Codeunits (Klassen, Methoden usw.) auszugehen, die möglichst wenige Abhängigkeiten zu anderen Modulen haben – einfach deshalb, weil das Schreiben der Tests dann zu nervig wird.</li>
	<li><strong>Saubere Trennung von Verantwortlichkeiten (separation of concerns)</strong> – aus ganz ähnlichen Gründen wie der erste Punkt: Jeder Test testet genau ein gewünschtes Verhalten, und dies führt ganz automatisch dazu, dass man später den Code, der die Tests erfüllen muss, in sauber voneinander getrennte und logisch strukturierte Einheiten teilt.</li>
	<li><strong>Schlanke Lösungen</strong> – testgetrieben bedeutet eben auch, dass man von den Tests getrieben ist, im besten Sinne: Man tut alles, um einen noch fehlschlagenden Test zu erfüllen; aber eben auch nur genau das und nicht mehr. Salopp gesagt: Man programmiert nicht mehr “einfach rum”, sondern arbeitet äußerst zielgerichtet und erzeugt Code, der nur genau das tut was er tun muss, was ganz automatisch zu einer schlanken und damit eleganten Lösung führt, in der sich zum Beispiel Bugs sehr viel schlechter verstecken können.</li>
</ul>
<p></p>

<p>
Darüber hinaus hat der testgetriebene Ansatz weitere nützliche Nebeneffekte:
</p>

<p>
</p><ul>
	<li>Die im Laufe der Zeit aufgebaute Sammlung von Unittests kann man benutzen, um die mit Tests versehenen Units automatisiert immer wieder testen zu können, zum Beispiel um beim Mergen eines Entwicklungszweigs mit einem anderen Zweig (oder auch nach jedem einzelnen Commit in ein Versionskontrollsystem) sicherzustellen, dass sich alle Units auch nach der Zusammenführung zweier Entwicklungslinien noch so verhalten wie erwartet. Das Stichwort für weiterführende Lektüre ist hier die <em>Kontinuierliche Integration</em> (continuous integration).</li>
	<li>Ein Unittest ist in der Praxis nicht nur ein Stück Code, sondern immer auch Dokumentation des erwarteten Verhaltens eines Systems – zumindest in einer für Programmierer lesbaren Form. Um als Unbeteiligter ein Stück Code oder ganze Teile eines Systems kennen zu lernen, ist es häufig effizienter, die dazugehörigen Tests zu lesen, als den Code selbst.</li>
	<li>Hat man erst einmal die Tests komplett geschrieben, welche die noch zu erzeugenden Units testen sollen, ist es sehr einfach, die Arbeit am eigentlichen Code einfach mittendrin auch für längere Zeit zu unterbrechen – die Tests geben einem sofort einen Anhaltspunkt, wo man “weiterprogrammieren” muss, selbst wenn man gedanklich längst aus dem Thema war.</li>
	<li>Testgetrieben zu entwickeln, erzeugt ein gutes Gefühl. Das mag banal klingen, aber es ist ein realer und wichtiger Faktor. Irgendwo habe ich mal eine sehr gute Definition des Begriffs “legacy code” gelesen: “legacy code” ist Code, vor dem man sich fürchtet – weil man nicht genau weiss was er tut, und deshalb Angst hat, ihn zu verändern. Testgetriebene Entwicklung ist die beste Vorsorge gegen legacy code – man weiss, es gibt eine Instanz die überwacht und aussagt, was der Code tun soll. Es wächst das Vertrauen in den eigenen Code und damit auch in die eigenen Fähigkeiten.</li>
</ul>
<p></p>

<p>
Die Unterteilung in zentrale Effekte und Nebeneffekte ist subjektiv. Ich habe die Erhöhung der Codequalität an sich für mich als wichtiger erlebt als zum Beispiel die Tatsache, dank der sich entwickelnden Testsammlung Regressionstests durchführen zu können. Geschadet hat mir jedenfalls noch kein einziger durch testgetriebene Entwicklung entstandener Effekt.
</p>

<h3>Voraussetzungen</h3>
<p>
Was benötigt man nun, um in PHP testgetrieben zu entwickeln? Im Wesentlichen vier Dinge:
</p>

<p>
</p><ul>
	<li>Eine <strong>Arbeitsmethodik</strong>, um effizient zu testgetrieben entwickeltem Code zu kommen</li>
	<li>Ein <strong>Organisationsprinzip</strong>, um Tests und zu testenden Code sinnvoll strukturieren zu können</li>
	<li>Ein PHP <strong>Framework</strong>, um Testfälle schreiben zu können</li>
	<li>Ein <strong>Tool</strong>, um Testfälle ausführen und auswerten zu können</li>
</ul>
<p></p>

<p>
Beginnen wir mit den letzten beiden Punkten, denn dank der Maßstäbe setzenden Arbeit von Sebastian Bergmann (<a href="http://sebastian-bergmann.de/">http://sebastian-bergmann.de/</a>) existiert ein Softwareprojekt, welches beide Anforderungen hervorragend erfüllt und längst der de-facto Standard für Unittesting unter PHP ist: PHPUnit.
</p>

<p>
Unter <a href="http://www.phpunit.de/manual/current/en/installation.html">http://www.phpunit.de/manual/current/en/installation.html</a> befindet sich eine ausführliche Anleitung für die in der Regel sehr einfache Installation.
</p>

<p>
PHPUnit ist sowohl ein Framework aus PHP Klassen, die es erlauben, Unittests für den eigenen PHP Code zu schreiben, als auch Kommandzeilen-Werkzeug, um die eigenen Tests auszuführen und in verschiedenen Formaten die Testergebnisse darzustellen.
</p>

<p>
Im weiteren Verlauf des Tutorials gehe ich davon aus, dass PHPUnit installiert und funktionsfähig ist.
</p>

<p>
Im Mittelpunkt von testgetriebener Entwicklung stehen aber nicht die Werkzeuge, sondern der Arbeitsprozess. Dieser folgt stets diesem Muster:
</p>

<p>
</p><ul>
	<li>Schreiben des Tests für eine neu zu implementierende Funktionalität</li>
	<li>Erfüllen des Tests mit so wenig Aufwand wie möglich, so dass dieser fehlerfrei durchläuft</li>
	<li>Überarbeiten des Codes, der den Test erfüllt, so dass dieser keine Duplizierungen enthält, sauber abstrahiert ist, und dem eigenen Code-Style entspricht – und dabei immer noch den Test erfüllt</li>
</ul>
<p></p>

<p>
Diese Schritte werden immer wieder wiederholt, bis man keine neuen sinnvollen Tests mehr findet für die neue Funktionalität.
</p>

<p>
Möchte man bereits vorhandene Funktionalität ändern, die bereits mit Tests versehen ist, bedeutet testgetriebene Entwicklung, dass man zuerst die Tests ändert, um das neue erwartete Verhalten widerzuspiegeln, sicherstellt, dass die veränderten Tests fehlschlagen, und dann erst den Code anpasst, um die veränderten Tests wieder zu erfüllen.
</p>

<p>
Wäre noch die Frage der Testorganisation zu klären – einfacher ausgedrückt: Wohin mit den Tests? Meiner Meinung nach ist der einzig wirklich sinnvolle Ansatz, Code und Tests identisch zu strukturieren. Das bedeutet, der Test für die Klasse <em>DefaultUser</em> in
</p>

<p>
</p><pre><code>lib/core/user/default_user.php</code></pre>
<p></p>

<p>
sollte in der Datei
</p>

<p>
</p><pre><code>tests/core/user/default_user_test.php</code></pre>
<p></p>

<p>
in der Testklasse <em>DefaultUserTest</em> liegen.
</p>

<p>
Aber solange wir noch kein Beispiel für einen Unittest durchgespielt haben, bleibt vieles sehr abstrakt, also beginnen wir den praktischen Teil des Tutorials.
</p>

<h3>Ein erstes Beispiel</h3>
<p>
Angenommen, wir möchten mithilfe von PHP ein Forum programmieren. Auf die ein oder andere Art und Weise wird diese Software eine Unit enthalten müssen, die eine E-Mail Adresse auf Gültigkeit prüft. Wir haben also eine Erwartungshaltung, was der Code später einmal tun soll. Der Einfachheit halber definieren wir diese Erwartungshaltung in diesem Beispiel so:
</p>

<p>
<em>Wenn eine E-Mail Adresse ohne @-Zeichen übergeben wird, dann liefere mir FALSE zurück, sonst TRUE</em>
</p>

<p>
Diese Erwartungshaltung gießen wir nun in Form von PHP Code in einen Unittest. Da wir testgetrieben arbeiten, existiert noch keinerlei Code der diese Erwartungen erfüllen könnte.
</p>

<p>
Wir geben der Unit, die später einmal unsere formulierte Erwartung erfüllen soll, den Namen <em>Verify</em>. Daraus leitet sich als Klassenname für den Unittest die Bezeichnung <em>VerifyTest</em> ab.
</p>

<p>
Wir erzeugen daher folgende Datei:
</p>

<p>
<em>tests/verify_test.php</em>
</p>

<p>
Und füllen sie mit folgendem Grundgerüst:
</p>

<p>
</p><pre><code>&lt;?php

require_once('/usr/lib/php/PHPUnit/Framework.php');

class VerifyTest extends PHPUnit_Framework_TestCase {}
</code></pre>
<p></p>

<p>
Dieser Code repräsentiert einen Testcase, der noch keine Tests enthält. Wir inkludieren das PHP-Klassen Framework von PHPUnit, da wir unsere Testcase-Klassen von einer Klasse dieses Frameworks ableiten müssen. Je nach Plattform liegt die zu inkludierende Framework.php auch schon mal unter <em>/usr/share/php/PHPUnit/Framework.php</em>.
</p>

<p>
Den Testcase selbst formulieren wir, indem wir eine Klasse definieren, deren Name auf <em>Test</em> endet, und die von <em>PHPUnit_Framework_TestCase</em> erbt.
</p>

<p>
Dieser Testcase kann nun mithilfe des PHPUnit Kommandozeilentools ausgeführt werden. Dazu starten wir folgenden Befehl an der Kommandozeile:
</p>

<p>
<em>phpunit tests/verify_test.php</em>
</p>

<p>
Dadurch erhalten wir die folgende Ausgabe:
</p>

<p>
</p><pre><code>PHPUnit 3.4.13 by Sebastian Bergmann.

F

Time: 0 seconds, Memory: 7.25Mb

There was 1 failure:

1) Warning
No tests found in class "VerifyTest".
</code></pre>
<p></p>

<p>
PHPUnit wertet den Testlauf als nicht erfolgreich (“Failure”), da keinerlei Tests innerhalb des Testcases gefunden wurden. Als nächstes fügen wir daher einen Test hinzu:
</p>

<p>
</p><pre><code>&lt;?php

require_once('/usr/lib/php/PHPUnit/Framework.php');

class VerifyTest extends PHPUnit_Framework_TestCase {

  public function test_falseIfNoAtSign() {
    $actual = Verify::checkEmail('manuel.kiessling.net');
    $this-&gt;assertFalse($actual);
  }

}
</code></pre>
<p></p>

<p>
Einen Test innerhalb eines Testcase formuliert man, indem man der Testcase-Klasse eine Methode hinzufügt, deren Name mit <em>test</em> beginnt.
</p>

<p>
Innerhalb der Methode schreibt man nun den Code, der notwendig ist, um den oder die Werte von der zu testenden Unit zu bekommen, mithilfe derer man das erwartete Verhalten verifizieren kann.
</p>

<p>
Die von der Unit erhaltenen Werte testet man nun gegen eine Behauptung, einen <em>assert</em>: Wir drücken hier also aus, dass der Test erwartet, dass der zu testende Wert FALSE ist.
</p>

<p>
Letztendlich muss man sich aber immer bewusst machen: Man möchte Verhalten testen, nicht Daten. Daten drücken nur das Ergebnis eines Verhaltens aus. Entsprechen die tatsächlichen (actual) Daten den erwarteten (expected) Daten, dann entspricht das tatsächliche Verhalten dem im Test erwarteten.
</p>

<p>
Nun lassen wir den neu formulierten Testcase erneut durchlaufen, mit folgendem Ergebnis:
</p>

<p>
</p><pre><code>bash$ phpunit tests/verify_test.php
PHPUnit 3.4.13 by Sebastian Bergmann.

PHP Fatal error:  Class 'Verify' not found in tests/verify_test.php on line 8
</code></pre>
<p></p>

<p>
Wenig überraschend beschwert sich PHP (nicht PHPUnit!), dass wir eine Klasse verwenden, die nirgends definiert wurde. Tun wir dies also, indem wir eine Datei <em>lib/verify.php</em> erzeugen und mit folgendem Inhalt füllen:
</p>

<p>
</p><pre><code>&lt;?php

class Verify {}

</code></pre>
<p></p>

<p>
Dann muss im Testcase noch sichergestellt werden, dass die Datei mit dieser Klasse auch inkludiert wird:
</p>

<p>
</p><pre><code>&lt;?php

require_once('/usr/lib/php/PHPUnit/Framework.php');
require_once('lib/verify.php');

class VerifyTest extends PHPUnit_Framework_TestCase {

  public function test_falseIfNoAtSign() {
    $actual = Verify::checkEmail('manuel.kiessling.net');
    $this-&gt;assertFalse($actual);
  }

}
</code></pre>
<p></p>

<p>
Lassen wir den Testcase nun laufen, ändert sich das Bild:
</p>

<p>
</p><pre><code>bash$ phpunit tests/verify_test.php
PHPUnit 3.4.13 by Sebastian Bergmann.

PHP Fatal error:  Call to undefined method Verify::checkEmail() in tests/verify_test.php on line 9
</code></pre>
<p></p>

<p>
Wir rufen eine Methode auf, die noch nicht existiert, also muss diese implementiert werden:
</p>

<p>
</p><pre><code>&lt;?php

class Verify {

  public static function checkEmail($email) {}

}
</code></pre>
<p></p>

<p>
Nun steht zumindest die Codestruktur komplett, so dass PHPUnit ohne Fatals durchlaufen kann:
</p>

<p>
</p><pre><code>bash$ phpunit tests/verify_test.php
PHPUnit 3.4.13 by Sebastian Bergmann.

F

Time: 0 seconds, Memory: 7.00Mb

There was 1 failure:

1) VerifyTest::test_falseIfNoAtSign
Failed asserting that  is false.

tests/verify_test.php:10

FAILURES!
Tests: 1, Assertions: 1, Failures: 1.
</code></pre>
<p></p>

<p>
Eine Zwischenbemerkung: Das Vorgehen ist hier natürlich sehr kleinschrittig – ob man die offensichtlichen Dinge wie das Anlegen der benötigten Klassen und Methoden nicht gleich in einem Rutsch macht, bleibt Geschmackssache. Ich persönlich habe Gefallen gefunden an dem Vorgehen, meine ganze Energie in die Tests zu stecken, und dann in einen anderen Modus zu schalten und ganz stupide Schritt für Schritt immer wieder die Implementierung anzupassen und den Testlauf neu zu starten, bis keinerlei Fehler mehr auftreten.
</p>

<p>
Wie auch immer, PHPUnit läuft nun wieder ohne PHP Fehler durch, bestätigt aber wenig überraschend, dass die nunmehr vorhandene Code-Unit nicht das Verhalten zeigt, welches wir laut Test von ihr erwarten. Wechseln wir nun also auf die inhaltliche Ebene der Implementierung und sorgen dafür, dass unser Code sich wie gewünscht verhält:
</p>

<p>
</p><pre><code>&lt;?php

class Verify {

  public static function checkEmail($email) {
    if (!strstr($email, '@')) return FALSE;
  }

}
</code></pre>
<p></p>

<p>
Nun besteht unser Testcase alle Tests:
</p>

<p>
</p><pre><code>bash$ phpunit tests/verify_test.php
PHPUnit 3.4.13 by Sebastian Bergmann.

.

Time: 0 seconds, Memory: 7.00Mb

OK (1 test, 1 assertion)
</code></pre>
<p></p>

<p>
Damit wäre der erste Testzyklus komplett. Stellt sich die Frage, ob uns noch weitere Verhaltensweisen für unsere Unit einfallen, die wir von ihr erwarten. Es liegt auf der Hand, dass wir den Positivfall ebenfalls testen wollen, nämlich dass eine E-Mail Adresse mit @-Zeichen als valide erkannt wird. Natürlich würde man in der Realität noch viel mehr Ansprüche an die Validierung einer E-Mail Adresse stellen, aber in diesem Beispiel bleibe ich der Einfachheit halber unrealistisch.
</p>

<p>
Eine Faustregel der testgetriebenen Entwicklung lautet, immer nur ein Verhalten pro Test zu überprüfen, anders ausgedrückt “ein assert pro Test”. Dies hilft, die einzelnen Tests übersichtlich und nachvollziehbar zu halten, und hat auch ganz praktischen Nutzen, da PHPUnit bei der Ausgabe eines Failures innerhalb eines Tests nicht darauf hinweist, welcher assert genau nicht erfüllt wurde, sondern immer den gesamten Test als fehlgeschlagen zu melden – hat man einen Test mit 20 asserts geschrieben, wird die Fehlersuche aufwendig.
</p>

<p>
Formulieren wir also einen weiteren Test:
</p>

<p>
</p><pre><code>&lt;?php

require_once('/usr/lib/php/PHPUnit/Framework.php');
require_once('lib/verify.php');

class VerifyTest extends PHPUnit_Framework_TestCase {

  public function test_falseIfNoAtSign() {
    $actual = Verify::checkEmail('manuel.kiessling.net');
    $this-&gt;assertFalse($actual);
  }

  public function test_trueIfAtSign() {
    $actual = Verify::checkEmail('manuel@kiessling.net');
    $this-&gt;assertTrue($actual);
  }

}
</code></pre>
<p></p>

<p>
Danach sollte man allerdings, obwohl kleinschrittig, auf jeden Fall den Testcase einmal durchlaufen lassen und ihm beim Fehlschlagen zusehen: Auch beim Schreiben von Tests können Fehler passieren, und es kommt vor, dass man einen neuen Test formuliert, der wegen eines Fehlers in der Implementation oder im Test sofort erfüllt wird – geht man nach dem Schreiben des Tests sofort an die Implementation, ohne zuvor den Test einmal fehlschlagen gesehen zu haben, übersieht man möglicherweise einen Bug in der Implementation oder im Test, wenn man erst dann den Test laufen lässt und dieser dann ohne Fehler durchläuft.
</p>

<p>
Dann sorgt gar nicht die eigene Änderung an der Implementation für das funktionieren des Tests, sondern ein Bug, den man aber eben nicht bemerkt.
</p>

<p>
Also stellen wir sicher, dass unser neuer Test fehlschlägt:
</p>

<p>
</p><pre><code>bash$ phpunit tests/verify_test.php
PHPUnit 3.4.13 by Sebastian Bergmann.

.F

Time: 0 seconds, Memory: 7.00Mb

There was 1 failure:

1) VerifyTest::test_trueIfAtSign
Failed asserting that  is true.

tests/verify_test.php:15

FAILURES!
Tests: 2, Assertions: 2, Failures: 1.
</code></pre>
<p></p>

<p>
Und nun ändern wir die Implementation, um ihn zu erfüllen:
</p>

<p>
</p><pre><code>&lt;?php

class Verify {

  public static function checkEmail($email) {
    if (!strstr($email, '@')) return FALSE;
    return TRUE;
  }

}
</code></pre>
<p></p>

<p>
Nun laufen beide Tests im Testcase erfolgreich durch:
</p>

<p>
</p><pre><code>bash$ phpunit tests/verify_test.php
PHPUnit 3.4.13 by Sebastian Bergmann.

..

Time: 0 seconds, Memory: 7.00Mb

OK (2 tests, 2 assertions)
</code></pre>
<p></p>

<p>
Das hier beschriebene Beispiel ist natürlich banal, aber im Grunde ist alles Wichtige zur Methodik der testgetriebenen Entwicklung gesagt.
</p>

<p>
Aber auch in der eigenen Praxis, auch bei spannenden Projekten, wird man aber immer wieder dem Gefühl begegnen, dass der einzelne Test im Grunde trivial ist. Aber das ist auch völlig in Ordnung: Selbst komplexeste Softwareprojekte sind letztendlich die Verknüpfung kleiner und für sich betrachtet trivialer Funktionseinheiten – aber aus dem Zusammenspiel dieser vielen einfachen Module ergibt sich die Lösung komplexer Probleme für den Anwender.
</p>

<p>
<strong>Update 14. Mai 2014:</strong>
<br>
Wer tiefer in die Materie einsteigen möchte, dem möchte ich meinen aktuellen Artikel <a href="/2014/05/08/mocking-dependencies-in-php-unit-tests-with-mockery/">“Mocking Dependencies in PHP Unit Tests with Mockery”</a> empfehlen.
</p>
