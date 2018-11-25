---
date: 2018-11-25T13:21:00+01:00
lastmod: 2018-11-25T13:21:00+01:00
title: "Die Metapher der Stadt für das Bauen und Betreiben von Softwareprodukten"
description: ""
authors: ["manuelkiessling"]
slug: 2018/11/25/metapher-stadt-fuer-bauen-und-betreiben-von-software-produkten
lang: de
---

In der Branche des Softwarebauens wird gerne mit Metaphern gearbeitet, um die eigene Tätigkeit anschaulich und greifbar zu machen.

Dazu gehört auch, den handelnden Personen verschiedene Rollen zuzuweisen. Klassische Beispiele sind die Software-ArchitektInnen, die ähnlich den ArchitektInnen von Bauwerken das große Ganze im Blick haben sollen und dafür zuständig sind, grobe bis detaillierte Pläne und Rahmenbedingungen aufzustellen, in deren Grenzen solide Softwareprodukte einerseits möglichst effizient gebaut werden können, durch die aber andererseits einfache Erweiterungsfähigkeit, eine langfristige Stabilität im Betrieb, gute Wartbarkeit und hohe Sicherheit dieser Softwareprodukte gewährleistet sein soll.

Dann gibt es die Rolle der Software-Engineers, die innerhalb dieser Rahmenbedingungen dann neue Softwareprodukte oder neue Produktfunktionen Wirklichkeit werden lassen. Je nach organisatorischer Aufstellung und Teamressourcen werden diese Rollen in Personalunion gelebt oder beliebig strikt voneinander getrennt auf verschiedene Schultern verteilt.

Wenn man von diesen beiden Rollen als zentrale Bausteine des personenbezogenen Teils der klassischen Metapher ausgeht, dann folgt aus dem Bild von ArchitektInnen und (Bau-)IngenieurInnen für den dinglichen Teil der Metapher oft das Bild des Gebäudes, das errichtet und, in der Regel, auch stetig erweitert und umgebaut wird.

Im Folgenden möchte ich einige meiner Gedankengänge der jüngeren Vergangenheit niederschreiben. Diese Übung sollte ausdrücklich eher als Gedankenspiel und kreatives Experiment verstanden werden, und nicht als abschließende Erkenntnis. Dies nicht zuletzt deshalb, weil alle Metaphern zu unseren Tätigkeiten immer mit einer gewissen Unschärfe belegt sein müssen, und daher nur als Denk-Stütze und grobe Orientierung dienen können, aber nie als präzise Blaupause.

Kern meiner Überlegungen ist der Gedanke, nicht "das Gebäude" als zentralen dinglichen Baustein der Metapher zu benutzen, sondern "die Stadt". Und in direkter Folge dessen lautet mein Vorschlag, in deutlich mehr unterschiedlichen Rollen zu denken wenn es um die verschiedenen Tätigkeiten bei Design, Aufbau, Umbau und Wachstum der Stadt - also des Softwareprodukts - geht.

Es sei noch erwähnt, dass ich mich hier auf die rein "technische" Seite des Softwarebaus beschränke. Zuständigkeiten wie Anforderungsmanagement und die Rollen, die diesen Zuständigkeiten zugeordnet werden würden, bleiben in diesem Artikel daher außen vor. Oder um in der Metapher zu sprechen: Ob es eine Stadt für den Handel oder eine Stadt für die Partnersuche werden soll, interessiert an dieser Stelle nicht - ob also ein Online-Shop gebaut wird oder eine Dating-Plattform, soll als bereits entschieden gelten.

Welche sinnvollen Rollen könnten wir aus der Metapher ableiten? Nun, lebenswerte und gut funktionierende Städte müsssen geplant werden, bevor der erste Spatenstich gesetzt wird. Man könnte die Rolle der Software-ArchitektInnen also als die der Städte-PlanerInnen sehen: der Bau eines einzelnen Gebäudes steht nicht so sehr im Fokus - eher gilt es zu überlegen, welche Art von verschiedenen Gebäuden eine Stadt beherbergen sollte; die Stadt ist also eher eine Software- und Systemplattform, die wiederum in einzelne Module wie zum Beispiel Self-Contained Systems, welche die Gebäude repräsentieren, unterteilt wird.

Folgt man diesem Gedanken kann es sinnvoll erscheinen, eine dedizierte Rolle "System-ArchitektIn" vorzusehen; die Verantwortung dieser Rolle ist die Konzeption eines oder mehrerer Self-Contained Systems, während die Städteplaner - wir könnten sie Plattform-ArchitektInnen nennen - sich beispielsweise eher damit befassen müssen, wie das Verkehrsnetz der Stadt gestaltet werden sollte. Gibt es einen zentralen Message-Bus? Oder sprechen verschiedene Systeme eher bilateral miteinander, z.B. indem sie synchron über Service-Calls Daten austauschen, oder asynchron über Feeds? Oder ist sogar eine Mischung verschiedener Ansätze angeraten? Und egal wie das Verkehrsnetz aussieht - wie lauten dessen Verkehrsregeln?

Die Plattform-ArchitektInnen könnten auch dafür zuständig sein zu entscheiden, welche Freiheiten System-ArchitektInnen bekommen: Muss jedes Gebäude/System eher nach Schema-F entworfen werden, soll also für jedes Software-System stets der gleiche Stack und das gleich Framework Verwendung finden? Mit Vorgaben bis hin zur Auswahl der erlaubten externen Bibliotheken und der anzuwendenden Pattern? Oder soll statt einer standardisierten Gebäudelandschaft im Bauhaus-Stil eher eine bunte Community entstehen, in der jedes Gebäude in Form und Farbe eigenständig ist, sprich über eingesetzte Sprachen, Frameworks, Entwurfsmuster usw. wird für jede Software-Komponente individuell entschieden, mit teils drastischen Unterschieden? Zwischen diesen Extremen verläuft natürlich ein Spektrum, welches von den StädteplanerInnen aktiv gemanaged werden kann und sollte. Die Analogie unterstreicht jedenfalls, [wie Stefan Tilkov herausstellt](https://twitter.com/stilkov/status/1066741611286155265), dass die wenigstens Städteplaner sich in die Gestaltung der Möbel einmischen.

Weitere Übertragungen aus der Metapher kommen in den Sinn. Vielleicht sollte sich das Betriebsteam als eine Mischung aus Polizei, Feuerwehr, THW und Verkehrsraumüberwachung verstehen: Wieso ist die Hauptstraße regelmäßig verstopft - braucht des Kafka-Cluster mehr Kapazität? Nachts um vier fällt immer das Licht im Einwohnermeldeamt aus - darüber sollte man mit den EntwicklerInnen des Teams Benutzeranmeldung dringend sprechen. Und woher kommen plötzlich die ganzen HTTP Requests mit überlangen Headern - steckt ein Angriff dahinter, oder hält sich jemand einfach nicht an die Verkehrsregeln? Wir haben schon lange nicht mehr geprüft was in der Rush-Hour am Black Friday in der Einkaufsstraße ablaufen wird - Zeit für einen Lasttest!

Keine lebenswerte Stadt ohne solide Abwassersysteme - vielleicht sollten einige Teammitglieder es als ihre Rolle begreifen, den Lebenszyklus von Daten zu gestalten und zu managen, inklusive deren Entsorgung; dann kann auch ein Thema wie DSGVO Spaß machen. 

Wie weit man eine Metapher treibt und überträgt, und wann man den Bogen überspannt, das hängt wie immer von den eigenen Prioritäten, Kapazitäten, und Kompetenzen ab. Für einige Teams mag es Sinn machen, einen eigenen Katastrophenschutz zu betreiben der den ganzen Tag nichts anderes macht als darüber zu sinnieren, was passiert wenn der gesamte Strom ausfällt oder ganze Stadtteile atomar verstrahlt werden (wenn also zum Beispiel ganze Systeme über einen längeren Zeitraum verfälschte Daten erzeugt und persistiert haben); und das Ganze inklusive entsprechender Katastrophenschutzübungen in jedem Quartal.

Manche Teams können und wollen vielleicht eine dedizierte Truppe unterhalten die beständig versucht, die Mauern (Firewalls) der Stadt zu erklimmen und Beute zu machen, also Daten zu stehlen, um dann alle anderen Parteien darin zu beraten, wie man sich von der Stadtplanung bis zur Verkehrsraumüberwachung gegen Angriffe besser schützen kann.

Eine der wichtigsten Fragen, die sich Softwerker stellen sollten, ist: "Was tue ich hier eigentlich?". Das ist nicht fatalistisch gemeint - es ist die berechtigte Frage nach der eigenen Identität im Unternehmen und im Team, und nur aus einer klaren Identität können klare Rollen und Verantwortlichkeiten abgeleitet werden. Der Blick auf die eigene Stellenbezeichnung kann helfen, aber manchmal braucht es lebendige Metaphern, um nachhaltige Orientierung und Klarheit zu erlangen.

Vielleicht ist dafür die Metapher vom Entwurf, Bau, Betrieb, und der Weiterentwicklung einer Stadt für die ein oder anderen ein nützlicher Gedankenanstoß.
