---
date: 2012-10-18T16:13:00+01:00
lastmod: 2012-10-18T16:13:00+01:00
title: "Bash: Skriptausgaben mit Zeitstempel versehen"
description: "Oft ist es wünschenswert eine Vorstellung davon zu bekommen, wie viel Zeit zwischen den einzelnen Ausgaben eines Skripts vergangen ist. Bei eigenen Skripten ist es natürlich in der Regel möglich, aus dem Skript heraus vor jede ausgegebene Zeile einen Zeitstempel zu setzen. Eleganter ist es aber, dies „von außen“ zu tun, über Bordmittel der Bash. Der weitere Vorteil dieser Lösung ist, dass man auch die Ausgabe fremder Applikationen, die man nicht verändern kann, mit Zeitstempeln versehen kann."
authors: ["manuelkiessling"]
slug: 2012/10/18/bash-skriptausgaben-mit-zeitstempel-versehen
lang: de
---

Sowohl selbstgeschriebene als auch fremde Applikationen für die Linuxkonsole schreiben häufig Ausgaben nach STDOUT, zum Beispiel, um über den Fortschritt ihrer Operationen zu berichten:

```
Starte Foo...
Foo beendet.
Beginne mit Migration...
Element 1 migriert...
Element 2 migriert...
Element 3 migriert...
Migration abgeschlossen.
```

Richtet man solche Skripte als regelmäßige Batchläufe über cron ein, leitet man diese Ausgaben vielleicht in eine Datei um, so dass man über Logfiles der Batchläufe verfügt:

```
30 14 * * * root /opt/skript.sh > /var/log/someskript.log
```

Soweit so gut. Oft ist es aber wünschenswert eine Vorstellung davon zu bekommen, wie viel Zeit zwischen den einzelnen Ausgaben unseres Skripts vergangen ist. Bei eigenen Skripten ist es natürlich in der Regel möglich, aus dem Skript heraus vor jede ausgegebene Zeile einen Zeitstempel zu setzen. Eleganter ist es aber, dies „von außen“ zu tun, über Bordmittel der Bash. Der weitere Vorteil dieser Lösung ist, dass man auch die Ausgabe fremder Applikationen, die man nicht verändern kann, mit Zeitstempeln versehen kann.

Dies ist einfach möglich, indem man die Ausgabe der Applikation durch ein kurzes Stück Shellcode piped:

```
/opt/skript.sh | while IFS= read -r line;do echo "$(date) $line";done
```

Damit bekommt man dann eine Ausgabe mit Zeitstempeln:

```
Thu Oct 18 14:34:24 CEST 2012 Starte Foo...
Thu Oct 18 14:36:10 CEST 2012 Foo beendet.
Thu Oct 18 14:36:11 CEST 2012 Beginne mit Migration...
Thu Oct 18 14:44:05 CEST 2012 Element 1 migriert...
Thu Oct 18 14:49:26 CEST 2012 Element 2 migriert...
Thu Oct 18 14:52:53 CEST 2012 Element 3 migriert...
Thu Oct 18 14:52:54 CEST 2012 Migration abgeschlossen.
```
