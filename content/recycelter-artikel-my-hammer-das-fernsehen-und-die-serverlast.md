---
date: 2007-07-17T16:13:00+01:00
lastmod: 2007-07-17T16:13:00+01:00
title: "Recycelter Artikel: “My-Hammer, das Fernsehen und die Serverlast”"
description: "Vor mittlerweile auch schon wieder einer halben Ewigkeit hatte ich mal eine kurze Artikelserie zum Thema Serverlast-Problemlösungen bei MyHammer online, die ich nun wieder ausgegraben habe."
authors: ["manuelkiessling"]
slug: 2007/07/17/recycelter-artikel-my-hammer-das-fernsehen-und-die-serverlast
lang: de
---

<p>
Vor mittlerweile auch schon wieder einer halben Ewigkeit hatte ich mal eine kurze Artikelserie zum Thema Serverlast-Problemlösungen bei MyHammer online, die ich nun wieder ausgegraben habe. Vieles entspricht gar nicht mehr den aktuell bei MyHammer eingesetzten Lösungen, aber verwahrenswert finde ich den Schrieb allemal. Leider fehlen die Grafiken, vielleicht finde ich die noch mal irgendwo.
</p>

<p>
Hier der Artikel:
</p>

<p>
Vergangenen Donnerstag zeigte das ProSieben Magazin <em>Galileo</em> einen ca. 10-minütigen Beitrag über My-Hammer (<a href="http://www.prosieben.de/wissen/galileo/themen/artikel/40712/">kurze Infos zur Sendung hier</a>). Vom Ansatz her ging es um “Branchenbuch vs. My-Hammer”, aber für die Betrachtung hier ist das gar nicht so sehr von Interesse – es ist noch nichtmal von Interesse, ob so ein Beitrag positiv oder negativ für uns ist (in dem Fall war’s wie fast immer positiv) – sobald das Magazin, in dem über uns berichtet wird, genug Reichweite hat, schießen die Zugriffe in die Höhe. Die wichtigste Erkenntnis, die wir immer wieder machen: zumindest bei den Privaten scheinen die Zuschauer sprichwörtlich mit dem Laptop auf den Knien vorm Fernseher zu sitzen. Die Zugriffe kommen extrem schnell und gebündelt (beim Galileo-Beitrag war aber interessant, dass die Zugriffe wieder auf einen Schlag kamen, aber erst in dem Moment, in dem der Beitrag vorbei war).
</p>

<p>
Genau dieses plötzliche Auftreten so vieler Zugriffe ist natürlich die Herausforderung – dieselbe Anzahl User auf nur 15 Minuten verteilt wären kein Problem, aber TV sorgt dafür, dass das meiste innerhalb der ersten 5 Minuten passiert. Und es ist wirtschaftlich natürlich ziemlich unvernünftig, die für diese 5 Minuten benötigte Rechenpower anzuschaffen, nur damit sie die anderen 525.595 Minuten im Jahr vor sich hindümpelt.
</p>

<p>
Trotzdem kann man eine Webseite auch auf solche Extremsituationen vorbereiten – My-Hammer hat am Donnerstag perfekt standgehalten, lediglich eine leichte Verzögerung in den Ladezeiten war während der kritischen Phase spürbar.
</p>

<p>
Um kurz die Dimensionen klarzumachen, erstmal eine Grafik, welche den ein- und ausgehenden IP Traffic für unser Netzwerk anzeigt. Man sieht sehr deutlich den Sprung auf das gut 2,5-fache des normalen Werts. Der Faktor selbst klingt vielleicht erstmal nicht so dramatisch, aber wie erwähnt geht es nicht um die Masse an sich, sondern das extrem gebündelte Auftreten dieser Masse an Zugriffen:
</p>

<p>
(Die Grafik ist leider nicht mehr auffindbar)
</p>

<p>
Ich behaupte mal, man erkennt recht gut, wann die Sendung lief…
</p>

<p>
Also, wie kann man die Serversysteme auf so etwas vorbereiten? Klar: mehr Server kaufen. Das ist durchaus ein Aspekt, aber nicht das Allheilmittel. Vor allen Dingen kann das sehr ineffektiv und unwirtschaftlich sein. Angenommen, man hat Server A mit einer gewissen Leistungsfähigkeit. Nun kann man sich Server B mit doppelt so schnellem Prozessor, doppeltem Arbeitsspeicher und doppelt so schnellen Festplatten kaufen. Dann hat man schon Unmengen von Geld ausgegeben, und hat gerade mal eine Steigerung der Leistungsfähigkeit von 100% (mal davon abgesehen, dass die Rechnung “doppelt so schnelle Hardware, doppelt so viel Leistung” in der Praxis auch nicht wirklich hinhaut). Dagegen kann ein einziger geschickt gesetzter Index in der Datenbank manchmal 1000% bessere Performance bringen, ohne dass man etwas an der Hardware tut.
</p>

<p>
Wenn man den Anschaffungspreis neuer Hardware mal auf den Stundenlohn eines Entwicklers umrechnet, wird man schnell zu dem Schluss kommen, dass es sich auch finanziell durchaus rechnen kann, diesen einige Tage lang auf die Datenbank anzusetzen um zu schauen, ob nicht doch irgendwo ein wichtiger Index vergessen wurde oder einige Tabellenstrukturen besser ganz anders aufgebaut sein sollten.
</p>

<p>
Das sind nur ein paar grundsätzliche Überlegungen. Spürbaren Erfolg wird man nur haben, wenn man ein ganzes Bündel an Massnahmen ergreift und vor allem immer das Gesamtsystem vom Code über die Datenbank bis hin zu den Servern und dem Netzwerk im Überblick hat. Die vielleicht wichtigste Faustregel, wenn man über Performanceoptimierung von Webseiten spricht, scheint mir daher zu sein: Coder und Admins an einen Tisch! Es hilft nichts, wenn die Entwickler meinen, die Geschwindigkeit des Systems sei doch schliesslich Sache des Admins. Umgekehrt ist es extrem hilfreich, wenn die Programmierer auch einen gewissen Sysadmin-Background haben, und die Admins umgekehrt auch Programmiererfahrung haben; was bei uns glücklicherweise sogar sehr ausgeprägt der Fall ist.
</p>

<p>
Die weiteren Teile befassen sich mit den konkreten Massnahmen, die man ergreifen kann um sich auf einen TV Beitrag vorzubereiten.
<strong>Hinweis:</strong> Thematisch durchaus verwandt berichtet Tom Bachem <a href="http://blog.thomasbachem.com/2007/05/28/die-sevenload-systemarchitektur/">über die Systemarchitektur von sevenload</a>.
</p>

<p>
Welche Massnahmen kann man nun konkret ergreifen, um sich auf einen TV Beitrag über die eigene Webseite vorzubereiten? Ich versuche so allgemein wie möglich zu bleiben, aber da es um konkrete Ratschläge gehen soll und ich holprige Umschreibungen vermeiden möchte, wird das Vokabular ab jetzt etwas LAMP-lastig; bitte entsprechend auf die eigene Technik ummünzen.
</p>

<h3>Massnahme 1: Datenbankoptimierung</h3>
<p>
Wurde ja schon erwähnt: die Indizes. Ich verrate wahrscheinlich nicht einmal DB Anfängern etwas neues, wenn ich betone, dass dies essentiell ist. Wenn man die Indizes nicht im Griff hat, braucht man sich die anderen Punkte noch gar nicht anschauen. Deshalb: Ins Slow-Log gucken. Vor allem: Immer wieder. Einen Status Quo gibt es nicht! Immer wieder <a href="http://dev.mysql.com/doc/refman/5.0/en/explain.html">EXPLAIN</a> bemühen, vom stumpf auf die Strukturen in phpMyAdmin gucken findet man die Performancefresser nicht.
</p>

<p>
Es gibt diese missverständliche Formel “Braucht man Geschwindigkeit, nimmt man MyISAM, braucht man Sicherheit, InnoDB”. InnoDB ist nicht nur einen Blick wert, wenn man Transaktionssicherheit braucht. Im Gegensatz zu MyISAM lockt InnoDB bei schreibenden Queries immer nur die betreffenden Zeilen, MyISAM dagegen grundsätzlich die gesamte Tabelle. InnoDB hat zwar aufgrund der größeren Komplexität etwas mehr “Grundoverhead”, aber das intelligentere Locking kann immens wertvoll sein in bestimmten Szenarien und das mehr als wettmachen. Wenn man eine Tabelle hat die man hinsichtlich Struktur und Indices schon perfekt durchoptimiert hat (genau das aber wiederum erstmal sicherstellen!), und trotzdem tauchen Queries auf diese Tabelle immer noch im Slow Log auf, dann sollte man prüfen, ob diese Queries vielleicht immer auf einen Lock warten. In diesem Fall InnoDB auf jeden Fall eine Chance geben. Das hat bei uns konkret bei den Session und Cachetabellen (dazu später mehr) enorm viel gebracht, weil dort die Lese- und Schreibzugriffe ein ausgewogenes Verhältnis haben.
</p>

<p>
Ein Aspekt, der wenig berücksichtigt wird, ist die Größe der Felder, auf die man Indices setzt. Es kann sich lohnen, hier sparsam zu sein, denn ein kleinerer Spaltentyp bedeutet auch weniger Speicherplatzverbrauch für den Index auf diese Spalte, und das kann im Zweifel nur gut (= schneller) sein. Man ist halt geneigt, seine Primary IDs immer als INT anzulegen. Aber nehmen wir mal den Klassiker Benutzertabelle: Wird man wirklich in nächster Zeit 4 Milliarden User haben? Das dürfte selbst bei eBay noch ein bisschen dauern. Erstmal tut es also auch ein MEDIUMINT, setzt man diesen UNSIGNED, ist das Limit bei 16 Millionen. Hat man soviele User, bewegt man sich wohl eh in völlig anderen Dimensionen.
</p>

<p>
Zumal das Umwandeln einer Spalte in einen Typ mit größerem Wertbereich (also z.B. von MEDIUMINT nach INT) unproblematisch ist. Wichtig ist allerdings auch, dass man sämtliche Felder, die einen Fremdschlüssel auf ein MEDIUMINT Feld darstellen, ebenfalls als MEDIUMINT anlegt, sonst hat man bei Joins nichts gewonnen.
</p>

<p>
Was bei der Skalierung von MySQL immer enorm hilft ist Replikation. Dazu wurde schon so viel geschrieben, dass ich mir die Wiederholung spare, nur dies: Wir fahren bisher sehr gut damit, das Balancing der Nur-Lese Zugriffe direkt in unserer Applikation zu regeln, und nicht über einen eigenen Software- oder Hardware-Loadbalancer. Da bei fast jedem Seitenaufruf der Master sowieso früher oder später konnektiert werden muss, kann man diese Verbindung auch nutzen, um MASTER STATUS und SLAVE STATUS zu vergleichen, um so ein Fallback auf den Master zu realisieren, falls alle Slaves einmal mehr als 0 Sekunden hinter dem Master zurückhängen. Was sich übrigens ziemlich gut vermeiden lässt, wenn man Master und Slaves per Gigabit statt Fast Ethernet anbindet.
</p>

<p>
Ein oft nicht wahrgenommener Vorteil von Replikation: Man kann einen Slave für’s Backup bereitstellen, auf dem man die Datenbank stoppen und auf Dateisystemebene wegkopieren kann (oder man hält nur den Slave Thread an und macht einen Dump), so dass man einen sauberen Snapshot der Datenbank hat, ohne das Gesamtsystem anhalten zu müssen.
</p>

<p>
Ein weiterer wichtiger Hebel für die Skalierung ist es, für spezielle Aufgaben jeweils eigene DB Server bereitzustellen, z.B. ein oder mehrere Maschinen nur für die Sessiontabellen, nur für Tabellen mit Cache-Inhalten, nur für Logtabellen; prinzipiell kann jede Tabelle, die nicht in Form von Joins oder Subselects zusammen mit anderen Tabellen gleichzeitig abgefragt werden muss, auch getrennt von den anderen Tabellen auf einem eigenen Server liegen. Darüber hinaus macht die Trennung von sehr verschiedenen Tabellen wie Session- und Logtabellen alleine deshalb schon Sinn, weil man dann die Datenbanksoftware für diese speziellen Aufgaben optimieren kann.
</p>

<p>
Eine praxisnahe Zusammenstellung der Massnahmen, die sich bei <a href="http://www.my-hammer.de/">My-Hammer.de</a> bewährt haben:
</p><p>

</p><h4>InnoDB vs MyISAM</h4>
<p>
Ich schrieb bereits, dass man InnoDB nicht nur dann in Erwägung ziehen sollte, wenn man Transaktionssicherheit benötigt. Eine Tabelle von MyISAM auf InnoDB umzustellen kann unter Umständen Geschwindigkeitsvorteile bringen, nämlich dann, wenn das zweite wichtige Feature von InnoDB neben der Transaktionssicherheit, das Row Level Locking, effektiv zum Zug kommen kann. Um herauszufinden, ob dies der Fall ist, kann man wie folgt vorgehen:
</p>

<h4>Mitloggen aller Queries</h4>
<p>
Wenn man für einen bestimmten Zeitraum (bei einer gut besuchten Seite reichen wenige Minuten) einmal alle Abfragen, die an die Datenbank gestellt werden, mitschreibt, kann man aus diesem Log eine Menge interessanter Informationen ziehen. Um festzustellen, ob eine Tabelle vom Row Level Locking profitieren könnte, muss man die lesenden (SELECT) und schreibenden (INSERT, UPDATE, DELETE etc.) Abfragen gegenüberstellen.
</p>

<p>
Wird aus einer Tabelle sehr häufig gelesen, die Daten in der Tabelle aber nur sehr selten verändert, dann macht das Table Level Locking von MyISAM in der Regel keine Probleme: Zwar wird bei einem UPDATE, INSERT oder DELETE die gesamte Tabelle für nachfolgende Lesezugriffe gesperrt (d.h. diese müssen warten), bis der Schreibprozess abgeschlossen ist. Aber da dies nur selten geschieht, kommt es auch selten vor, dass ein Leseprozess warten muss, so dass daraus keine spürbare Verzögerung im Gesamtsystem resultiert.
</p>

<p>
Gleiches gilt im umgekehrten Fall: Wird in eine Tabelle praktisch nur geschrieben, aber selten daraus gelesen (wie es z.B. bei Logtabellen häufig der Fall ist), dann kollidieren auch hier die “Interessen” nur so selten, dass nicht mit Performanceeinbußen zu rechnen ist.
</p>

<h4>Slow Log</h4>
<p>
Interessant sind also jene Tabellen, bei denen Schreib- und Lesezugriffe in einem ausgeglicheneren Verhältnis stehen. In welcher Relation die beiden Zugriffsarten dabei mindestens stehen müssen, damit es sich “lohnt” InnoDB einzusetzen, ist schwer zu sagen. Ein Blick ins Slow-Log von MySQL hilft hier weiter: Wenn man immer wieder bei denselben Tabellen auf langsame Queries stösst, die nicht wegen des Queries selbst langsam waren, sondern weil sie auf ein Lock warten mussten, hat man auf jeden Fall aussichtsreiche Kandidaten.
</p>

<h4>SHOW PROCESSLIST</h4>
<p>
Eine weitere Methode ist, sich einmal für einige Minuten immer wieder die Liste der laufenden Prozesse in MySQL auflisten zu lassen (SHOW PROCESSLIST). Wenn man dort immer wieder dieselben Queries sieht, deren Status <em>Locked</em> ist, dann weiss man wo das Problem liegt. Diese Methode mag zwar auf den ersten Blick wie ein Glücksspiel wirken, aber gerade weil man immer nur die Prozesse sieht, die zufällig gerade laufen wenn man den Befehl absetzt, fallen die problematischen Prozesse erst recht auf, die immer wiederkehren und oft vielleicht sogar während zwei oder mehr SHOW Aufrufen immer noch laufen. Meiner Meinung nach die schnellste Methode, Flaschenhälse zu finden.
</p>

<p>
Mehr zum Thema Locking gibt es im <a href="http://dev.mysql.com/doc/refman/5.0/en/internal-locking.html">Kapitel ‘Internal Locking Methods’ des MySQL Handbuchs</a>.
</p>

<p>
Nehmen wir also an, man hat einige Tabellen identifiziert, bei denen Queries öfter als gesund ist auf einen Lock warten müssen. Dies könnte beispielsweise eine Sessiontabelle sein (falls man z.B. PHP nutzt und die Sessionfunktionen so angepasst hat, dass diese eine MySQL Datenbank als Storage nutzen, ein ziemlich klassisches Szenario). Diese Tabelle wird bei jedem Seitenaufruf zu Beginn einmal gelesen, um die Session des aufrufenden Benutzers zu laden, und am Ende des Skripts wird der Sessioninhalt dieses Benutzers wieder geschrieben. Also ein sehr ausgewogenes Verhältnis zwischen lesenden und schreibenden Zugriffen – jeder Seitenaufruf, der gerade an dem Punkt angelangt ist, an dem die Session geschrieben wird, würde also die Tabelle sperren für sämtliche anderen Seitenaufrufe, die in diesem Moment aus der Sessiontabelle lesen möchten – das Performanceproblem ist ab einer bestimmten Anzahl von gleichzeitigen Benutzern vorprogrammiert.
</p>

<p>
Klassischerweise geht man nun so vor, dass man die Tabelle in InnoDB umwandelt und wieder einige Zeit das Slow Log oder die Prozessliste beobachtet – sinkt die Lock_Time der Abfragen deutlich, hat man einen Flaschenhals erfolgreich eliminiert.
</p>

<p>
Nun, es wäre freilich zu schön, wenn es nicht doch den ein oder anderen Haken bei der Sache gibt; zum Glück lassen sich die meisten aber zumindest einigermassen elegant umschiffen.
</p>

<p>
Eine Einschränkung von InnoDB ist beispielsweise, dass der FULLTEXT Index nicht unterstützt wird. Dies war bei My-Hammer ein Problem, weil wir eine Tabelle, die ziemlich eindeutiger Kandidat für eine Umstellung von MyISAM auf InnoDB war, in einem Teil unserer Applikation auch durchsuchen mussten, und zwar eben gerade einige TEXT-Felder, was ohne FULLTEXT Index nicht wirklich Spass macht.
</p>

<p>
Die Lösung war, die Tabelle umzuwandeln und damit in der Tabelle selbst auf die FULLTEXT Indizes zu verzichten, per cronjob aber eine weitere Tabelle regelmässig mit den Daten der Ursprungstabelle zu füllen. Geschrieben wurde in diese Tabelle nur durch besagten Crobjobs, ansonsten fanden ausschliesslich Lesezugriffe statt, womit MyISAM wieder die perfekte Wahl war – und wir hatten unsere FULLTEXTs wieder. Schöner Nebeneffekt: durchsucht werden müssen eh nur eine Untermenge aller Zeilen der Ursprungstabelle, und es müssen auch nicht alle der (recht zahlreichen) Spalten in die Suchtabelle übertragen werden.
</p>

<p>
Dadurch konnten wir nicht nur das Lockingproblem der ursprünglichen Tabelle lösen, sondern aufgrund der schlankeren Datenbasis in der Suchtabelle die Suche deutlich beschleunigen.
</p>

<p>
Wichtig ist jedoch: diese Lösung ist nur möglich, weil wir in diesem Fall darauf verzichten können, auf absoluten Livedaten zu suchen.
</p>

<p>
Meiner Erfahrung nach kann man zusammenfassend sagen: Es gibt nur eine einzige Massnahme, die mehr Performance bringt als Caching, und das ist noch mehr Caching. Das gilt, um mal zum Haupthema zurückzukehren, vor allem in Bezug auf Performance bei plötzlichen Besucheranstürmen.
</p>

<h3>Statische Inhalte</h3>
<p>
Wenn man einen TV Beitrag über die eigene Plattform überleben will, dann gibt es nichts, aber auch wirklich gar nichts Wichtigeres als dies hier: <em>Die Startseite der Plattform ist eine statische HTML Seite</em>. Und zwar in aller Konsequenz, was heissen soll, dass der Aufruf der Seite nicht nur keine Datenbankverbindung zur Folge hat, sondern dass noch nicht einmal der PHP Interpreter auch nur gestartet wird. Die Startseite von My-Hammer ist eine .html Seite, die im Gegensatz zu den .php Seiten per Apache-Konfiguration mod_php noch nicht mal von Weitem zu sehen bekommt. Selbiges sollte konsequenterweise auch für alle JavaScript und CSS Dateien, die von der Startseite eingebunden werden, gelten. Ob man hierfür nun mit Proxylösungen arbeitet oder Seiten regelmäßig vorgeneriert, ist Geschmackssache.
</p>

<p>
Man darf nie den Performancevorteil reinen HTMLs unterschätzen – selbst wenn sich die Datenbanken schon alle verabschiedet haben und die Webserver bereits richtig unter Dampf sind: Eine HTML Seite auszuliefern schafft sogar ein Webserver, der schon ziemlich am Ende ist. Und man wahrt vor allem noch am ehesten sein Gesicht, wenn die ganzen neuen Benutzer, die aufgrund des TV Beitrages neugierig geworden sind, zumindest die Startseite zu sehen bekommen. Was immer man neben der Startseite noch an Seiten statisch vorgenerieren kann, ohne dass der angebotene Dienst selber “statisch” wird, sollte man natürlich machen (denn wie oft ändern sich schon Seiten wie <em>Über uns</em>?). Hierbei macht es Sinn, sich mithilfe der Zugriffsstatistiken einmal anzuschauen, welchen Weg neue Benutzer in der Regel auf der Plattform nehmen, um so auch wirklich jene Seiten zu cachen, die bei einem Ansturm am ehesten angesurft werden.
</p>

<p>
Eine dynamische Seite als statische Seite vorzugenerieren ist dabei natürlich die konsequenteste Version von Caching, aber nicht immer praktikabel. My-Hammer nutzt eine zweite Stufe des Cachings, bei dem zwar weiterhin dynamische Seiten ausgeliefert werden, diese aber ganz oder teilweise in dedizierten Cache-Backends (wir nutzen dazu <a href="http://www.danga.com/memcached/">memcached</a>) abgelegt sind, um Ergebnisse teurer Datenbankabfragen, die nicht immer absolut live zur Verfügung stehen müssen, zwischenzuspeichern. Diese zwischengespeicherten Einträge können zum einen nach einer gewissen Zeit ablaufen und werden dann neu aus der Datenbank erzeugt, oder können gezielt als “dirty” markiert werden, wenn die Datenbestände die sie widerspiegeln sich ändern.
</p>

<p>
Wie oben erwähnt kann es sich außerordentlich lohnen, diese Cacheinhalte auf dedizierten Maschinen bereitzustellen – was wiederum deutlich zeigt, dass manche Massnahmen zur Performancesteigerung bestenfalls halbgar sind, wenn Admins und Programmierer nicht zusammenarbeiten.
</p>

<h3>Everybody needs a 304</h3>
<p>
(oder: Wie ich dem Browser des Users helfe, optimal zu cachen)
</p>

<p>
Bisher bin ich lediglich auf ein Ziel von Performanceoptimierung eingegangen – zu verhindern, dass die eigenen Server zusammenbrechen, wenn’s mal brenzlig wird. Man muss sich aber unbedingt bewusst machen, dass Optimierungen auf dem Server erstmal keinen Wert an sich darstellen, sondern nur dem eigentlichen Ziel dienen: dem User die Benutzung der eigenen Seite so schnell und angenehm wie möglich zu machen – indem die Seite grundsätzlich erreichbar bleibt, und indem die Seite sich so schnell wie möglich aufbaut.
</p>

<p>
Wenn man sich das erstmal bewusst gemacht hat, ist auch klar dass es sich sogar lohnen kann, etwas Rechenzeit auf dem Server zu investieren, um sie dem Client (also Browser) abzunehmen.
</p>

<p>
Aber der Reihe nach. Es gibt ein wichtiges Hilfsmittel, um den Aufbau einer Webseite im Browser deutlich zu beschleunigen (abgesehen von den üblichen Massnahmen wie geringer Dateigröße, möglichst wenig eingebetteten Objekten etc.), und das ist die Verwendung des HTTP Status <em>304 Not Modified</em>. Diesen kann der Server senden, wenn er anhand der Anfrage des Clients erkennt, dass exakt der Inhalt, den der Browser bereits in seinem Cache hat, nochmal über die Leitung wandern würde – in diesem Fall sendet der Server diesen Inhalt dann eben nicht nochmal, sondern teil dem Browser nur mit, er möge auf den Inhalt seines Caches zurückgreifen.
</p>

<p>
Dies kann zu erheblichen Performancesteigerungen auf Seiten des Clients führen, denn die Zeit die zum Download des Inhalts einer Seite benötigt wird, entfällt.
</p>

<p>
Es gibt nun zwei Faktoren, die das Status 304 Handling beeinflussen und spezielle Anpassungen erfordern, um optimales Clientcaching zu ermöglichen: Die Auslieferung von Seiten über PHP Skripte (gilt prinzipiell auch für andere Skriptsprachen) und der Betrieb einer Plattform in einem Webserver-Cluster.
</p>

<p>
Zuerst zu letzterem: Um in der gegenseitigen Kommunikation festzustellen, ob ein Inhalt vom Server neu ausgeliefert werden muss oder der Browser den Inhalt aus dem eigenen Cache lädt, gibt es den sogenannten <em>Etag</em>. Ein ganz kurzer Abriss, wie die Verwendung abläuft. Der Client fragt eine Ressource beim Server an. Es ist der erste Zugriff innerhalb dieser Browsersitzung, deshalb schickt der Client kein Etag mit. Der Server sendet daraufhin die Inhalte aus, und schickt in den Headern den Etag des aktuellen Inhalts dieser Ressource mit, sagen wir “12345″ (der Server schickt dazu den Header <em>Etag: “12345″</em>).
</p>

<p>
Fragt der Client nun erneut dieselbe Ressource beim Server an, schickt er in seinen Headern wiederum die Information mit, dass er in seinem Cache bereits die Inhalte mit dem ETag “12345″ gespeichert hat, und der Server ihn informieren möge falls sich die Inhalte nicht geändert haben (der Client schickt dazu den Header <em>If-None-Match: “12345″</em>). Der Server kann dann schauen, ob die Inhalte die er ausliefern würde immer noch das ETag “12345″ haben, und in diesem Fall den erwähnten HTTP Status 304 senden, oder, falls Inhalt und ETag nicht mehr zueinander passen, den neuen Inhalt schicken.
</p>

<p>
Die Frage ist nun: Wie genau ist denn definiert, was im Etag steht? Nun, im Prinzip gar nicht. Es gibt kein vorgeschriebenes Format, wichtig ist nur die Definition des Etag an sich: dass nämlich ein eindeutiges Etag zu einem eindeutigen Inhalt einer bestimmten Ressource gehört, und deshalb festgestellt werden kann ob sich der Inhalt einer Ressource zwischen zwei Requests geändert hat oder nicht. Man kann sich den Etag deshalb der Einfachheit halber als Checksumme des Inhalts vorstellen (und in der Tat besteht eine Möglichkeit den Etag zu generieren darin, z.B. die MD5 Summe des Inhalts zu berechnen).
</p>

<p>
Woher kommt der Etag? Beim Apache ist es Teil der Kernfunktionalität, für eine angeforderte Ressource den Etag zu berechnen und mitzusenden, sowie entsprechend zu reagieren wenn ein Client den <em>If-None-Match</em> Header sendet. Alles out-of-the-box also, aber genau hier liegen für uns die Probleme:
</p>

<p>
<strong>Problem 1:</strong> Defaultmässig berechnet Apache den Etag für eine Ressource, indem eine Art Quersumme aus diesen Informationen generiert wird: I-Node-Nummer der angefragten Datei, letzter Änderungszeitpunkt (mtime) der angefragten Datei, und Größe der angefragten Datei. Betreibt man eine Webseite auf nur einem Server, hat man kein Problem, denn wenn z.B. die Datei <em>/index.html</em> zwischen zwei Aufrufen nicht verändert wird, hat sie bei beiden Zugriffen denselben Etag, da keiner der drei Faktoren inode, mtime, size zwischenzeitlich verändert wurde.
</p>

<p>
Betreibt man aber einen Cluster aus mehreren Webservern, und besteht die Möglichkeit, dass ein Client bei zwei aufeinanderfolgenden Aufrufen derselben Ressource zuerst auf einem Webserver, beim zweiten Aufruf aber auf einem anderen landet, dann ist, auch wenn auf beiden Servern die exakt gleiche Datei liegt, der Etag beide Male ein anderer, denn selbst wenn letzter Änderungszeitpunkt und Größe der Datei auf beiden Servern identisch sind: dass die I-Node-Nummer die gleiche ist, ist praktisch ausgeschlossen. Der Server wird also keine 304 Status senden, obwohl er es könnte.
</p>

<p>
Abhilfe ist zum Glück sehr einfach möglich, und lohnt sich schon beim Wechseln von einem auf zwei Server: Man muss dem Apache mitteilen, dass er die I-Node-Nummer nicht mehr zur Berechnung des Etag heranziehen soll. Dies erledigt an zentraler Stelle die Anweisung <em>FileETag MTime Size</em>. Mehr dazu im <a href="http://httpd.apache.org/docs/2.2/mod/core.html#fileetag">Apache Handbuch</a>.
</p>

<p>
<strong>Problem 2:</strong> <em>mod_php</em> hebelt die Verwendung von Etag für PHP Skripte aus. Das macht ja prinzipiell auch Sinn: selbst wenn die Skriptdatei <em>/index.php</em> sich zwischen zwei Aufrufen inhaltlich überhaupt nicht geändert hat, kann sie dennoch völlig unterschiedliche Inhalte an den Client ausliefern – genau das ist ja Sinn und Zweck des Einsatzes von dynamischen Seiten.
</p>

<p>
Trotzdem kann es Sinn machen, dass der Server den Status 304 an einen Client sendet, wenn dieser dieselbe Ressource erneut anfragt. Zum Beispiel bei CSS Skripten, die von jeder Seite der Plattform eingebunden werden, und aus programmiertechnischen Erwägungen als PHP Skripte realisiert sind, aber deren Inhalt sich trotzdem sehr selten ändert. Jeder Seitenaufruf würde den Browser veranlassen, dies referenzierte CSS Datei anzufragen, und der Server würde jedes Mal den Inhalt senden, obwohl sich dieser seit dem letzten Aufruf nicht geändert hat. Das macht den Seitenaufbau im Client langsam, und ist zudem eine Ressourcenverschwendung.
</p>

<p>
Wie kann man nun sicherstellen, dass ein Client den 304 Status auch beim Abruf von PHP Skripten erhält, falls sich der Inhalt nicht verändert hat, aber auch auf keinen Fall einen 304 Status bekommt, falls der Inhalt sich geändert hat? Die Lösung ist leider nicht ganz so trivial wie beim ersten Problem, aber doch vergleichsweise einfach zu realisieren.
</p>

<p>
Da wie erwähnt der Zustand der Skriptdatei selbst praktisch keine Rolle spielt, darf man nur mit dem von diesem Skript auszuliefernden Inhalt arbeiten. Eine Lösung wäre, bei den Skripten, für die man den Etag Mechanismus einsetzen möchte, folgenden Code ans Ende anzuhängen (lässt sich natürlich einfach in eine zentrale Funktion kapseln):

<pre><code>&lt;?php
$output = ob_get_clean(); // Gesamte Ausgabe, die an den Client gesendet werden soll, abfangen und zwischenspeichern

$etag = ‘”‘.sha1($output).’”‘; // Prüfsumme der Ausgabe berechnen// Ist der Inhalt identisch mit dem, den der Client gecached hat?

if ($_SERVER['HTTP_IF_NONE_MATCH'] == $etag) // Wenn ja, dann sende nur den Status 304
{
    header(‘HTTP/1.x 304 Not Modified’);
    header(‘Etag: ‘.$etag);
    die();
}
else // Wenn nicht, dann sende den Inhalt inkl. des neuen Etags
{
    header(‘Etag: ‘.$etag);
    echo $output;
    die();
}
?&gt;
</code></pre>


</p>

<p>
Voraussetzung ist dafür die Verwendung von <em>output buffering</em>.
</p>

<p>
Eines muss man ganz klar festhalten – für den Server fällt exakt dieselbe Arbeit an, egal ob der User den Inhalt schlussendlich zugesendet bekommt oder nur die lapidare Meldung, er möge doch auf seinen Cache zurückgreifen. Es mag nach deutlich zuviel Overhead aussehen, PHP soviel Arbeit erledigen zu lassen, nur um das Ergebnis dieser Arbeit dann wegzuschmeissen; aber der Effekt auf die Lade- und damit Seitenaufbauzeiten beim Client ist wirklich beeindruckend, wenn man diesen Mechanismus geschickt einsetzt.
</p>
