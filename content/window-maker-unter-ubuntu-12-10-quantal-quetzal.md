---
date: 2012-10-22T16:13:00+01:00
lastmod: 2012-10-22T16:13:00+01:00
title: "Bash: Skriptausgaben mit Zeitstempel versehen"
description: " Privat benutze ich ein sehr einfaches aber praktisches Acer Aspire One 722, dies ist ein günstiges 11,6 Zoll Netbook mit einer 1GHz AMD CPU. Das System ist nicht gerade ein Rennpferd, aber das muss es für meine Ansprüche auch nicht sein – im Wesentlichen beschränken sich 95% meiner Nutzung auf Browser und Konsole, letztere in Form des wunderbaren Guake. Als Betriebssystem verwende ich aktuell Ubuntu 12.10 Quantal Quetzal, und hier liegt das Problem: Unity ist einfach zu schwergewichtig, um auf diesem schmalbrüstigen Rechner Spaß zu machen, und die leichtgewichtigen Alternativen wie Xubuntu oder Lubuntu habe ich als wenig stabil erlebt. Meine Wahl fiel daher auf das etwas angestaubte, aber schön einfache Window Maker, welches sich an der GUI des NextSTEP Betriebssystems orientiert."
authors: ["manuelkiessling"]
slug: 2012/10/22/window-maker-unter-ubuntu-12-10-quantal-quetzal
lang: de
---

Privat benutze ich ein sehr einfaches aber praktisches Acer Aspire One 722, dies ist ein günstiges 11,6 Zoll Netbook mit einer 1GHz AMD CPU. Das System ist nicht gerade ein Rennpferd, aber das muss es für meine Ansprüche auch nicht sein – im Wesentlichen beschränken sich 95% meiner Nutzung auf Browser und Konsole, letztere in Form des wunderbaren Guake.

Als Betriebssystem verwende ich aktuell Ubuntu 12.10 Quantal Quetzal, und hier liegt das Problem: Unity ist einfach zu schwergewichtig, um auf diesem schmalbrüstigen Rechner Spaß zu machen, und die leichtgewichtigen Alternativen wie Xubuntu oder Lubuntu habe ich als wenig stabil erlebt.

Meine Wahl fiel daher auf das etwas angestaubte, aber schön einfache Window Maker, welches sich an der GUI des NextSTEP Betriebssystems orientiert.

![](/images/ubuntu_windowmaker.png)

Die Installation ist mit `sudo apt-get install wmaker` denkbar einfach, danach kann man sich über ein sehr schnelles System freuen, das im Leerlauf gerade einmal 1% CPU Last erzeugt und unter 100 MB Arbeitsspeicher belegt.

Vier kleinere Anpassungen sind aber notwendig, um den Bedienkomfort zu heben. Beim Schließen des Netbook-Deckels soll der Rechner in den Ruhezustand versetzt werden, Guake soll nicht die gesamte Bildschirmbreite belegen, sondern das Dock freilassen, praktische Anwendungen wie z.B. das Uhrapplet, Dropbox und der Netzwerkmanager sollen automatisch starten, und die Miniicons von nicht-WindowMaker Applets wie Dropbox und Netzwerkmanager sollen sauber im Dock angezeigt werden. Für all dies gibt es einfache Lösungen.

Anwendungen wie der Netzwerkmanager und Dropbox blenden unter Unity ein Icon in die Taskleiste ein, über das wichtige Einstellungen und Aktionen gesteuert werden können. Man kann diese Anwendungen zwar auch unter Window Maker problemlos starten, sieht dann aber diese Miniicons nicht. Die Lösung heisst `Docker`, es stellt ein WindowMaker-DockIcon bereit, das nicht wie üblich eine Applikation symbolisiert, sondern automatisch die Miniicons andere Applikationen aufnimmt und dadurch erreichbar macht – auf obenstehendem Screenshot ist es dies der 6. Kasten von oben.

Docker wird installiert via `sudo apt-get install docker`.

Als nächstes muss sichergestellt sein, dass Docker und andere Hintergrundapplikationen beim Start von Window Maker auch gestartet werden; dies ist zum Glück sehr einfach zu konfigurieren über die Datei `~/GNUstep/Library/WindowMaker/autostart`, diese sieht bei mir so aus:

```
#!/bin/bash
wmclockmon &
docker -wmaker &
nm-applet &
wmbattery &
~/guake &
~/.dropbox-dist/dropbox &
xscreensaver &
```

Zusätzlich muss sichergestellt sein, dass die Datei für den eigenen User ausführbar ist.

Guake, ein einfacher Terminal-Wrapper, über den man im Quake-Stil eine Konsole über einen Tastendruck einblenden kann, nimmt standardmäßig die gesamte Breite des Bildschirms ein, dies verdeckt aber das Window Maker Dock. Leider kann man die Breite in Guake nicht konfigurieren, es hilft nur, das Guake-Skript von `/usr/bin/guake` in's Homeverzeichnis zu kopieren und wie folgt zu ändern:

Zeilen 821 und 822:

```
width = 100
halignment = self.client.get_int(KEY('/general/window_halignment'))
```

werden zu

```
width = 95.4
halignment = ALIGN_RIGHT
```

Bleibt noch, das Power-Management anzupassen, so dass beim Schließen des Deckels der Rechner in den Ruhezustand versetzt wird; bei Unity scheint dies über Unity selbst gesteuert zu werden, unter Window Maker funktioniert es nicht out-of-the-box. Meine Lösung ist, es via `acpid` zu steuern, dies ist das Standardwerkzeug unter Linux zur Steuerung von ACPI Events. Die Installation erfolgt mittels `sudo apt-get install acpid`, dann muss noch die Datei `/etc/acpi/events/lidbtn` so angepasst werden, dass ihr Inhalt wie folgt lautet:

```
# /etc/acpi/events/lidbtn
# Called when the user closes or opens the lid

event=button[ /]lid
action=/etc/acpi/sleep.sh
```

Nun hat man ein sehr leichtgewichtiges und dennoch angenehm zu bedienendes Linuxsystem.
