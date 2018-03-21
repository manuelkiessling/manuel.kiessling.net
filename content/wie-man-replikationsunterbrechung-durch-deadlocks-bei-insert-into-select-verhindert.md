---
date: 2007-08-07T16:13:00+01:00
lastmod: 2007-08-07T16:13:00+01:00
title: "Wie man Replikationsunterbrechung durch Deadlocks bei INSERT INTO … SELECT verhindert"
description: "Der My-Hammer Auftragsradar, der unsere Auftragnehmer auf Wunsch regelmässig per E-Mail über neu eingestellte Auktionen anhand einstellbarer Filterkriterien informiert, baut bei jedem Durchlauf eine eigene Suchtabelle auf. Diese wird gefüllt mit einer Untermenge der Daten unserer Haupt-Auktionstabelle, nämlich nur den derzeit laufenden Auktionen. Die Verwendung von INSERT INTO … SELECT ist hier naheliegend"
authors: ["manuelkiessling"]
slug: 2007/08/07/wie-man-replikationsunterbrechung-durch-deadlocks-bei-insert-into-select-verhindert
lang: de
---

Der <a href="http://web.archive.org/web/20080407200839/http://www.my-hammer.de/showPage.php?id=auftragservice">My-Hammer Auftragsradar</a>, der unsere Auftragnehmer auf Wunsch regelmässig per E-Mail über neu eingestellte Auktionen anhand einstellbarer Filterkriterien informiert, baut bei jedem Durchlauf eine eigene Suchtabelle auf. Diese wird gefüllt mit einer Untermenge der Daten unserer Haupt-Auktionstabelle, nämlich nur den derzeit laufenden Auktionen.

Die Verwendung von <em>INSERT INTO … SELECT</em> ist hier naheliegend, zum Beispiel so:

<p class="wp_syntax"></p><p class="code"></p><pre class="sql"><span style="color: #993333; font-weight: bold">INSERT</span> <span style="color: #993333; font-weight: bold">INTO</span> Suchtabelle
&nbsp;<span style="color: #993333; font-weight: bold">SELECT</span> a, b, c <span style="color: #993333; font-weight: bold">FROM</span> Auktionstabelle <span style="color: #993333; font-weight: bold">WHERE</span> x = y</pre><p></p><p></p>


Es ergab sich folgendes Problem: Der Query wird wie jeder andere auch auf die Datenbankslaves repliziert. Dort wurde er auch korrekt ausgeführt. Jedoch nicht immer auf dem Master: hier kam es regelmäßig zu Deadlocks auf der Auktionstabelle, da dies eine InnoDB Tabelle ist (bei MyISAM Tabellen können Deadlocks nicht auftreten).

Wenn ein MySQL Slave jedoch feststellt, dass beim gleichen Query auf dem Master und auf dem Slave unterschiedliche Fehler auftreten (Slave: no error; Master: deadlock), unterbricht dieser die Replikation. Es hilft dann nur ein <em>SET GLOBAL SQL_SLAVE_SKIP_COUNTER=1; START SLAVE;</em>.

Ich habe mich daraufhin nach Lösungen umgeschaut. Erste Anlaufstelle ist das Kapitel <a href="http://web.archive.org/web/20080407200839/http://dev.mysql.com/doc/refman/5.1/de/innodb-deadlocks.html"><em>Vom Umgang mit Deadlocks</em></a> im MySQL Handbuch.

Mein erster Versuch war, den 4. Tipp dieses Kapitels zu befolgen: Das Einstellen eines niedrigeren Isolationslevels. Da perfekte Datenkonsistenz für die benötigte Suchtabelle nicht nötig ist (<em>dirty reads</em> also akzeptabel sind), verwendete ich gleich den niedrigsten Level <em>READ UNCOMMITED</em>. Das Ergebnis war gelinde gesagt verheerend, es traten noch mehr Deadlocks auf als zuvor.

Deshalb bin ich dazu übergegangen, die beteiligten Tabellen explizit mit einem <em>READ LOCK</em> zu sperren – viele Artikel zu diesem Thema haken diese Vorgehensweise sofort als nicht gangbar ab, da die Performance darunter leide. Da es sich beim Auftragsradar jedoch um einen Cronjob handelt, der nur alle paar Minuten einmal läuft, und der <em>INSERT INTO … SELECT</em> Query sehr schnell durchläuft, erschien mir das Risiko, eine unserer wichtigsten Tabellen für diesen Query zu sperren, als gering.

Wie sich zeigte, brachte dies den gewünschten Erfolg: Seitdem sind an dieser Stelle keinerlei Deadlocks mehr aufgetreten, und der Rest der Plattform zeigt sich von den seltenen und kurzen Locks völlig unbeeindruckt.
