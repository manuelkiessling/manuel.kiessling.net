---
date: 2015-11-29T16:13:00+01:00
lastmod: 2015-11-29T16:13:00+01:00
title: "Entwicklung und Betrieb einer Symfony2 Webanwendung – Teil 1"
description: "Ich möchte ein Projekt aus der realen Welt heranziehen um den Leser durch all jene Details des Produktentwicklungsprozesses zu führen, die eine relevante Rolle spielen im Zusammenhang mit dem Schreiben und Betreiben von Anwendungen auf Basis von Symfony2 – hierbei gehe ich ein auf Aspekte wie Projektsetup, Testing, Datenbankmigrationen, Continuous Delivery, Sicherheit, und vieles mehr."
authors: ["manuelkiessling"]
slug: 2015/11/29/entwicklung-und-betrieb-einer-symfony2-webanwendung-teil-1
lang: de
---

<h2 id="ber-diesen-artikel">Über diesen Artikel</h2>

<p>
<em>Dies ist ein Crosspost vom <a href="http://galeria-kaufhof.github.io/tutorials/2015/10/27/entwicklung-und-betrieb-einer-symfony2-webanwendung-teil-1/">GALERIA Kaufhof Technology Blog</a></em>.
</p>

<p>Vor kurzem standen wir vor der Herausforderung, eine kleine Onlineanwendung für eine zeitlich begrenzte Rabattaktion zu realisieren, die keinerlei Verbindung mit dem Galeria.de Webshop hatte.</p>

<p>Während <a href="/general/2014/09/20/jump-ein-technologiesprung-bei-galeria-kaufhof">der Technologiestack rund um unseren Onlineshop</a> auf Scala, Ruby und Casssandra basiert, wurde hier die Entscheidung gefällt, die Anwendung außerhalb unserer bestehenden Dienste und Systeme zu realisieren, und auch nicht im Kontext unserer Scala und Ruby Teams, mit dem Ziel den normalen Produktentwicklungsprozess nicht mit diesem Sonderprojekt zu “stören”.</p>

<p>Weiterhin waren hier die für den Online-Shop geltenden Skalierungsanforderungen, die ein zentraler Treiber hinter den technologischen Entscheidungen unseres Hauptstacks sind, nicht von Belang.</p>

<p>Da die Deadline für dieses Projekt sehr knapp gesteckt war, hat man sich der technologischen Lösung sehr pragmatisch genähert. Es fiel die Entscheidung, die Anwendung mit dem PHP-basierten Symfony2 Framework und MySQL als Datenbank zu bauen. Diese Kombination ist sehr gut etabliert und hat sich als genau die richtige Wahl für diese Art von Projekt herausgestellt.</p>

<p>Ich möchte dieses Projekt aus der realen Welt heranziehen um den Leser durch all jene Details des Produktentwicklungsprozesses zu führen, die eine relevante Rolle spielen im Zusammenhang mit dem Schreiben und Betreiben von Anwendungen auf Basis von Symfony2 – hierbei gehe ich ein auf Aspekte wie Projektsetup, Testing, Datenbankmigrationen, Continuous Delivery, Sicherheit, und vieles mehr.</p>

<p>Der hierzu gewählte Ansatz hebt alle signifikanten Entscheidungen hervor, erklärt die Implementationsdetails die sich aus diesen Entscheidungen ergaben, und diskutiert die Vor- und Nachteile dieser Entscheidungen. Ich werde weiterhin diejenigen Teile der Anwendungen herausstellen, die weiter verbessert werden könnten.</p>

<h2 id="zielgruppe">Zielgruppe</h2>

<p>Dieser Beitrag richtet sich an PHP-Entwickler, die mindestens erste Erfahrungen in der Arbeit mit Symfony2 haben, und für die bspw. die Arbeit mit Composer bekanntes Terrain ist.</p>

<h2 id="die-anforderungen">Die Anforderungen</h2>

<p>Mit Wirkung zum 1. Oktober 2015 wurde die GALERIA Kaufhof GmbH Teil der Hudson’s Bay Company. Zuvor waren wir Teil der METRO GROUP. Vor Abschluss dieser Transaktion wurde eine allerletzte Rabattaktion für unsere nunmehr ehemaligen Kolleginnen und Kollegen der METRO aufgesetzt: <em>Good Buy METRO</em>.</p>

<p>Der Use Case sah wie folgt aus: Für eine begrenzte Zeit konnten sich Mitarbeiterinnen und Mitarbeiter bestimmter METRO-Tochterunternehmen über die hier beschriebene Webanwendung für die Rabattaktion registrieren, basierend auf ihrer Mailadresse und Personalnummer. Nach Abschluss der Registrierung erhielt jeder Benutzer eine Mail mit einem PDF-Anhang, auf dem insgesamt sechs personalisierte Gutscheine abgedruckt waren. Jeder Gutschein enthielt einen QR Code, der an der Kasse einer unserer Filialen eingescannt werden konnte, um den Rabatt auf den Einkauf zu erhalten.</p>

<p>Im Kern lauteten die funktionalen Anforderungen daher:</p>

<ul>
  <li>Erlaube Zugriff auf eine Webanwendung</li>
  <li>Ermögliche über die Webanwendung eine Registrierung auf Basis von Mailadresse und Personalnummer</li>
  <li>Verifiziere die Gültigkeit der Personalnummer über einen internen Prozess, sowie die Gültigkeit der Mailadresse über ein Double Opt-In Verfahren</li>
  <li>Wähle für jeden verifizierten Benutzer aus dem Pool aller Rabattcodes sechs freie Codes aus</li>
  <li>Erstelle für jeden dieser Codes einen QR Code</li>
  <li>Erstelle auf Basis der sechs QR Codes ein PDF Dokument für den Benutzer und sende es ihm per Mail</li>
</ul>

<p>Hinzu kamen nicht-funktionale Anforderungen. Um in der kurzen Projektphase stets zeitnah und zuverlässig auf Detailänderungen in den funktionalen Anforderungen reagieren zu können, war eine hohe Testabdeckung erforderlich. Weiterhin sollten Änderungen immer umgehend in der Produktionsumgebung verfügbar sein, damit eine enge Feedback-Schleife mit den Anforderern möglich war. Dies wiederum bedingte eine vollautomatische Continuous Delivery Pipeline, und eine der Voraussetzungen hierfür war der Einsatz von Datenbank-Migrations.</p>

<p>Da das System personenbezogene Daten speichern würde, wurde eine externe Sicherheitsüberprüfung eingeplant, und diese mit einem guten Ergebnis zu bestehen war eine weitere Anforderung. Zusätzlich war das Thema Laststabilität im Fokus – zwar wurde die Anwendung nur einem begrenzten Nutzerkreis zur Verfügung gestellt, aber da es sich um eine zeitlich eng begrenzte Sonderaktion handelte, war ein gewisser Ansturm zu Beginn der Aktion zumindest möglich. Daher wurde auch ein Lasttest eingeplant mit der Anforderung, dass die Webanwendung auch bei vielen parallelen Zugriffen gute Antwortzeiten lieferte.</p>

<p>Eine weitere nicht-funktionale Anforderung war, dass die Anwendung auch auf mobilen Geräten angenehm zu bedienen sein sollte. </p>

<h2 id="die-umsetzung">Die Umsetzung</h2>

<h3 id="aufsetzen-des-projekts">Aufsetzen des Projekts</h3>

<blockquote>
  <p>Die <a href="https://github.com/Galeria-Kaufhof/goodbuy-metro#good-buy-metro">README des Projekts</a> auf GitHub bietet einen Leitfaden zur Einrichtung eines Mac OS X Systems als Entwicklungsumgebung für die Anwendung.</p>
</blockquote>

<p>Der erste Schritt in der Entwicklung war das Anlegen eines neuen Symfony2 Projekts. Ich entschied mich für die aktuelle stabile nicht-LTS Version von Symfony, zum damaligen Zeitpunkt 2.7.3. So verständlich ich die Idee von Long Term Support Versionen finde, ziehe ich dennoch vor, lieber immer mit einer aktuellen stabilen Version zu arbeiten und auch immer zeitnah (vielleicht nach 2-3 minor releases) auf eine neue stabile Version upzugraden, wenn diese verfügbar wird.</p>

<p>Meiner Meinung nach läuft man ein eine Falle wenn man zu lange auf einer älteren Version verharrt, ein Vorgehen, welches durch LTS Versionen begünstigt wird. Man verliert einfach den Anschluss und ein Wechsel, der ja irgendwann erfolgen <em>muss</em>, wird immer furcheinflößender, komplexer und teurer. Lieber regelmäßig durch einen kleinen Schmerz gehen (der bei guter Testabdeckung eh überschaubar ist) und nicht in die Falle laufen, irgendwann ein Legacy-System zu haben. Für mich ist dieses Vorgehen ein Beispiel für das agile Prinzip <em>If It Hurts, Do It More Often</em> – guten Lesestoff bietet hier zum Beispiel Martin Fowler in <a href="http://martinfowler.com/bliki/FrequencyReducesDifficulty.html">FrequencyReducesDifficulty</a>.</p>

<p>Wie unter <a href="http://symfony.com/doc/current/book/installation.html">Installing and Configuring Symfony</a> beschrieben wurde der Symfony Installer heruntergeladen und installiert, um dann mittels <code class="inline">symfony new goodbye-metro 2.7.3</code> das Projekt aufzusetzen.</p>

<p>Symfony2 ist die Basis der Anwendung im Backend, aber eine Webanwendung hat auch ein Frontend, und auch dieses will z.B. in Hinblick auf externe Bibliotheken und Frameworks gemanaged werden. Hierzu wurde <em>Bower</em>, der JavaScript Paketmanager, benutzt. Über die Datei <em>bower.json</em> im Hauptverzeichnis des Projekts wurde <em>Bootstrap</em> als Abhängigkeit definiert:</p>

<pre><code>{
  "name": "goodbye-metro",
  "version": "0.0.1",
  "dependencies": {
    "bootstrap": "~3.3.5"
  }
}
</code></pre>

<p>Um Bower und Symfony2 sinnvoll zu integrieren ist es wichtig dafür zu sorgen, dass Bower seine Bibliotheken im richtigen Zielverzeichnis ablegt. Der Symfony Best Practice folgend, sollte die Anwendung im Bundle <em>AppBundle</em> entstehen. Die öffentlichen Webdateien für dieses Bundle gehören in <em>src/AppBundle/Resources/public</em> – über das Assetsystem von Symfony wird dieser Ort nach <em>web/bundles/app</em> gespiegelt, und von dort können die Dateien vom Webserver geserved werden. Da wir mit Bower externen Code in unser Projekt holen (analog zu den externen PHP Libraries, die mittels Composer in <em>vendor</em> im Wurzelverzeichnis des Projekts landen), macht es Sinn auch diese in einem <em>vendor</em> Ordner abzulegen, um sie nicht mit internen Frontend-Dateien zu vermischen.</p>

<p>Um dies zu erreichen, wurde die Datei <em>.bowerrc</em> mit folgendem Inhalt angelegt:</p>

<pre><code>{
  "directory": "src/AppBundle/Resources/public/vendor",
  "interactive": false
}
</code></pre>

<p><code class="inline">"interactive": false</code> ist nützlich, um Bower ausführen zu können ohne dass Eingaben an der Kommandozeile abgefragt werden.</p>

<p>Wichtiges Detail: die externen Bibliotheken, die per Bower gemanaged werden, sollen nicht Teil des git Repositories werden. Daher wurde die Zeile <code class="inline">src/AppBundle/Resources/public/vendor</code> zur <em>.gitignore</em> Datei hinzugefügt.</p>

<p>Die Dependencies der PHP Welt hat der Symfony Installer automatisch nach <em>vendor/</em> heruntergeladen. Für die Frontend Dependencies müssen wir mittels Bower selber tätig werden: <code class="inline">bower install</code></p>

<h3 id="migrations-als-grundlage-fr-continuous-delivery">Migrations als Grundlage für Continuous Delivery</h3>

<p>Damit war nun ein Grundgerüst für die zu bauende Anwendung, sowohl in Hinblick auf das Backend als auch das Frontend, verfügbar. Aber dieses Grundgerüst musste noch erweitert werden, um den zukünftigen Anforderungen gerecht zu werden.</p>

<p>Ein ganz zentrales Element für das Erreichen einer Continuous Delivery sind Datenbankmigrationen. Statt händisch Schemaänderungen vorzunehmen, sind Veränderungen an der Struktur einer Datenbank abgebildet in Codedateien, die Teil des Projektrepositories sind wie anderer Code auch. Das Schema der Datenbank ist somit einerseits versioniert, andererseits können Schemaänderungen ohne menschliches Zutun durchgeführt werden.</p>

<p>Ist dieses Verfahren aufgesetzt, kann neuer Code automatisiert auf die Produktionsumgebung ausrollen, selbst wenn dieser Code eine veränderte Datenbankstruktur erwartet – im Zuge des Ausrollens wird die Datenbank automatisch auf die Struktur angepasst, die der neue Code erwartet.</p>

<p>Datenbankmigrationen sind in Symfony2 Projekten sehr leicht zu realisieren, da hierfür ein entsprechendes Bundle existiert. Um dieses zu installieren (und automatisch zu den Composer-verwalteten externen Abhängigkeiten hinzuzufügen), reicht folgender Aufruf:</p>

<pre><code>composer require doctrine/doctrine-migrations-bundle "^1.0"
</code></pre>

<p>Das neue Bundle musste nun dem Kernel der Anwendung bekannt gemacht werden, indem <em>app/AppKernel.php</em> um den Eintrag</p>

<pre><code>new Doctrine\Bundle\MigrationsBundle\DoctrineMigrationsBundle()
</code></pre>

<p>erweitert wurde, und die folgenden Konfigurationsparameter mussten in <em>app/config/config.yml</em> hinzugefügt werden:</p>

<pre><code>doctrine_migrations:
    dir_name: "%kernel.root_dir%/DoctrineMigrations"
    namespace: Application\Migrations
    table_name: migration_versions
    name: Application Migrations
</code></pre>

<p>Um nun zu ersten Migrations zu kommen machte es Sinn, eine erste Entität zu schaffen und die Erzeugung der dazugehörigen Datenbankstruktur in einer ebensolchen Migration abzubilden. Symfony2 bietet alle Hilfsmittel um diesen Weg nicht komplett zu Fuß gehen zu müssen.</p>

<p>Der naheliegenste Kandidat für diese erste Entität war der Nutzer der Rabattaktion, intern <em>Customer</em> genannt – die Namensgebung <em>User</em> oder, da es sich grundsätzlich im Konzernmitarbeiter handelte, <em>Employee</em>, wäre sicherlich ebenfalls möglich gewesen.</p>

<p>Über <code class="inline">php app/console doctrine:generate:entity</code> erfolgte die interaktive Erzeugung der Entität <em>Customer</em>. Das Ergebnis sieht man unter <a href="https://github.com/Galeria-Kaufhof/goodbuy-metro/blob/ff28bc6d1d9e823e17a5b153b1911527ef45aa55/src/AppBundle/Entity/Customer.php">src/AppBundle/Entity/Customer.php auf GitHub</a>.</p>

<p>Direkt mit Bordmitteln gelangt man von der neuen Entität zur zugehörigen Migrations-Datei: <code class="inline">php app/console doctrine:migrations:diff</code> stellt die Unterschiede zwischen dem Code (dem die <em>Customer</em> Entität bereits bekannt ist) und der Datenbank (die noch keine zugehörige Tabelle kennt) fest und legt unter <em>app/DoctrineMigrations/</em> eine Datei mit entsprechenden SQL Statements an (siehe <a href="https://github.com/Galeria-Kaufhof/goodbuy-metro/blob/ff28bc6d1d9e823e17a5b153b1911527ef45aa55/app/DoctrineMigrations/Version20150828083456.php">app/DoctrineMigrations/Version20150828083456.php auf GitHub</a>).</p>

<p>Um die Datenbank nun mit dem Code zu synchronisieren, führt man schlicht <code class="inline">php app/console doctrine:migrations:migrate</code> aus.</p>

<blockquote>
  <p>Hierbei sollte man beachten, dass neu erzeugte Migrations immer sofort angewendet werden sollten, bevor man weitere Veränderungen an Entitäten vornimmt. Der <em>diff</em> Befehl ist sehr gut darin zu erkennen, was die Unterschiede zwischen Entitäten und Datenbank sind, aber er kann nicht berücksichtigen, welche unangewendeten Migrations bereits existieren. Führt man zum Beispiel nach dem Erzeugen der Entität den <em>diff</em> Befehl zwei Mal direkt hintereinander aus, dann erhält man zwei Migrationsdateien, die aber bei den den gleichen Inhalt haben (Anlegen der Tabelle für die Entität), und ein Ausführen von <em>migrate</em> würde fehlschlagen wenn nach Anwenden der ersten Migrationsdatei die Anwendung der zweiten versucht, die soeben erstellte Tabelle noch mal anzulegen.</p>
</blockquote>

<h3 id="motivation-fr-continuous-delivery">Motivation für Continuous Delivery</h3>

<p>Warum eigentlich noch mal das Ganze? Das Ziel ist die Schaffung und Nutzung einer Continuous Delivery Pipeline, und Migrations sind neben Tests ein notwendiges Mittel zum Zweck.</p>

<p>In der Softwareentwicklung bei Galeria.de ist Continuous Delivery ein sehr zentraler Baustein unseres Produktentwicklungsprozesses, deshalb wurde auch bei diesem sehr kleinen Sonderprojekt Wert darauf gelegt.</p>

<p>Wer Software entwickelt, kennt vermutlich das Phänomen: In der eigenen Entwicklungsumgebung funktioniert alles wie gewünscht, aber auf dem Produktionssystem verhält sich die Software anders, und nicht selten fehlerhaft. Oder auch: man ist zu 95% fertig mit dem Projekt, nun muss man es “nur noch” releasen, und stellt fest, dass man nicht 5%, sondern noch 30% des Aufwands vor sich hat, bis man wirklich gelauncht ist.</p>

<p>Das hervorragende Buch <em>Growing Object-Oriented Software, Driven By Tests</em> macht dieses Phänomen auf interessante Weise anschaulich. Würde man eine “Stresskurve” über die Projektdauer plotten die anzeigt, welches Level von Stress oder Chaos im Projekt zu einem beliebigen Zeitpunkt auf dem Weg zum Launch herrscht, dann sieht diese klassischerweise wie folgt aus:</p>

<pre><code>Stress/Chaos

      ^
      │
      │                            *
      │                            *
      │                            *
      │                           * *
      │                           * *
      │                           * *
      │ **************************   *
      +───────────────────────────────&gt; Zeit
                                   |
                                Launch
</code></pre>

<p>In der Zeit vor dem Launch ist es verhältnismäßig ruhig – man arbeitet vor sich hin, die Anwendung entsteht und lebt in der Entwicklungsumgebung, welche überschaubar und gut beherrscht ist. Dann kommt die Launchphase, und es wird hektisch: in Produktion sind Softwarepakete auf einem ganz anderen Stand, einzelne Nodes in der Entwicklungsumgebung werden zu Clustern mit vielen Nodes in Produktion, Netzwerkrouten funktionieren nicht, bei jedem Deployment ist die Seite einige Minuten lang offline und so weiter und so fort.</p>

<p>Eine Anwendung zu bauen hat aus dieser Perspektive zwei Aspekte: Das Herstellen von Funktionalität, und das Herstellen von Betriebsbereitschaft. Im klassischen Vorgehen liegt während nahezu der gesamten Projektphase der Fokus fast ausschließlich auf dem ersten Aspekt, und die Betriebsbereitschaft kommt zu kurz. Continuous Delivery dreht den Spieß um:</p>

<pre><code>Stress/Chaos

      ^
      │
      │
      │
      │
      │ *
      │  *
      │   *                        *
      │    ************************ **
      +───────────────────────────────&gt; Zeit
                                   |
                                Launch
</code></pre>

<p>Bei diesem Ansatz werden die knackigen Herausforderungen, die Software betriebsbereit zu bekommen und einen funktionierenden und zuverlässigen Releaseprozess sicherzustellen, an den Projektanfang gesetzt (<em>“Do the hard stuff first”</em>). Das ist durchaus anstrengend, denn es dauert in der Regel einen Moment bis zum allerersten Mal die (zu diesem Zeitpunkt in ihrer Funktionalität und Komplexität natürlich noch äußerst rudimentäre) Software sauber bis zu den Produktionssystemen ausrollt – dabei will man doch “richtig loslegen” und Features bauen, statt sich jetzt schon mit dem Aufsetzen von Serversystemen auseinanderzusetzen.</p>

<p>Aber hat man diese Hürde erst einmal genommen, erntet man für die gesamte Lebensdauer der Anwendung, und ganz besonders in der Launchphase, die Früchte dieses Ansatzes. Der finale Release, d.h. das zur-Verfügung-stellen der Anwendung für den eigentlichen Kunden, ist zum Zeitpunkt des Launches bereits dutzende, wenn nicht hunderte Male geübt und eingespielt. Wenn man ein Feature fertiggestellt hat, ist es <em>wirklich</em> fertig: Es liefert die geforderte Funktionalität, <em>und</em> rollt zuverlässig zum Kunden aus, <em>und</em> funktioniert auch im Live-Betrieb. Eine Funktionalität, die letzteres nicht bietet, ist aus Kundensicht exakt so wertvoll wie die vollständige Abwesenheit der Funktionalität.</p>

<p>Continuous Delivery ist dabei natürlich kein singuläres Event – so, wie die Anwendung in der Projektphase in ihrer Funktionalität wächst, wächst auch der Deliveryprozess mit. Hier ist man nicht davor gefeit, ab und zu eine kleine Überraschung zu erleben und nachbessern zu müssen – aber meiner Erfahrung nach lebt es sich deutlich besser mit seltenen kleineren Überraschungen als mit einer großen zum ungünstigsten denkbaren Zeitpunkt, dem Launch.</p>

<h3 id="erste-tests">Erste Tests</h3>

<p>Zurück zur Anwendung. Migrations waren nun aufgesetzt, und eine funktionierende Continuous Delivery das nächste Ziel. Um dies nicht ganz im luftleeren Raum zu verfolgen, ging es nun darum, erste Funktionalität zu erzeugen – und die Korrektheit dieser Funktionalität mit einem Testfall zu beweisen, denn die Idee einer Continuous Delivery Pipeline ist ja, dass sie automatisch, ohne weiteren menschlichen Eingriff, die Software auf Produktionssystemen veröffentlicht; da also auch kein Mensch die Korrektheit testet, muss die Korrektheit über automatisierte Testfälle gewährleistet werden.</p>

<p>Zu diesem Zeitpunkt existierte lediglich die <em>Customer</em> Entität, und diese verfügte nicht wirklich über nennenswertes Verhalten, welches sinnvoll zu testen gewesen wäre. Der nächste Schritt war daher die Schaffung eines ersten Testfalls, der relevantes Verhalten der Anwendung überprüfen würde, und der innerhalb eines Delivery-Durchlaufs bewies, dass die Anwendung auf dem Zielsystem erwartungsgemäß funktionierte. Der Fokus lag daher auch auf einem funktionalen Test, und nicht auf einem Unit-Test; Units wie Methoden und Klassen sind in der Regel so isoliert, dass ihr Funktionieren innerhalb eines Testcases wenig darüber aussagt, ob die Anwendung an sich auf dem Zielsystem korrekt läuft – sprich, selbst eine ganze Batterie an fehlerfrei durchlaufenden Unittests sagt mir nicht, ob meine Continuous Delivery eine für den Benutzer korrekt laufende Anwendung zum Ergebnis hat.</p>

<p>Funktionale Tests zu schreiben ist in Symfony2 Anwendungen glücklicherweise sehr einfach und komfortabel. Man testet hierbei zwar nicht auf Basis realer HTTP-Anfragen und -Antworten, aber man testet dennoch die integrierte Anwendung in ihrer Gesamtheit und kann somit sicherstellen, dass sich alle relevanten Komponenten im Zusammenspiel korrekt verhalten.</p>

<p>Um funktionale Tests schreiben zu können, bedurfte es nur wenig Vorbereitung. Zum einen musste PHPUnit als Dependency definiert werden mittels <code class="inline">require phpunit/phpunit "^4.8"</code>, und eine <em>phpunit.xml.dist</em> musste im Wurzelverzeichnis des Projekts angelegt werden – siehe <a href="https://github.com/Galeria-Kaufhof/goodbuy-metro/blob/master/phpunit.xml.dist">phpunit.xml.dist auf GitHub</a> für den Inhalt.</p>

<p>Nun kann man über das Schreiben von Testklassen, die <em>Symfony\Bundle\FrameworkBundle\Test\WebTestCase</em> erweitern, funktionale Testfälle erzeugen. Der allererste funktionale Testfall im Projekt, in Datei <em>src/AppBundle/Tests/Functional/RegistrationTest.php</em>, sah wie folgt aus:</p>

<pre><code>&lt;?php

namespace AppBundle\Tests\Functional;

use AppBundle\Tests\TestHelpers;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class RegistrationTest extends WebTestCase
{
    public function testContents()
    {
        $client = static::createClient();

        $client-&gt;request('GET', '/');

        $this-&gt;assertEquals(200, $client-&gt;getResponse()-&gt;getStatusCode());
    }
}
</code></pre>

<p>Der Testfall selber ist sehr überschaubar, aber sein Funktionieren beweist, dass die integrierte Anwendung in der Lage ist, korrekt auf einen Request gegen die Route / zu antworten. Wie gesagt werden hierbei keine realen HTTP Requests über eine reale Leitung geschickt – der <em>$client</em>, den man über den <em>WebTestCase</em> von Symfony2 erzeugt, ist lediglich eine clevere Abstraktion, die stets im Kontext der PHP Laufzeit bleibt. Jedoch läuft der Client gegen die vollständig integrierte Symfony-Anwendung, d.h. der Testfall kann nur erfolgreich sein, wenn Dependencies, Konfiguration, Routing, Controller, Datenbank usw. richtig funktionieren und zusammenspielen. Für das angestrebte Ziel ist dies völlig ausreichend.</p>

<p>Ausgeführt wird dieser Testfall nun schlicht mittels <code class="inline">php ./vendor/phpunit/phpunit/phpunit</code>.</p>

<p>An diesem Punkt war ein wichtiger erster Zwischenstand erreicht: Die Anwendung war grundsätzlich aufgesetzt, Veränderungen an der Datenbank waren dank Migrations codeseitig steuerbar, und die notwendigen Strukturen für einen ersten Testcase waren in Stellung gebracht. Mit anderen Worten: Das erste Paket für die Delivery war geschnürt – nun brauchte es die Pipeline zum Produktivsystem, über die das Paket geliefert werden konnte.</p>

<blockquote>
  <p>Im demnächst erscheinenden Teil 2 dieser Serie wird der Aufbau der Continuous Delivery Pipeline in allen Details beleuchtet.</p>
</blockquote>