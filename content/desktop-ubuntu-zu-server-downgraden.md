---
date: 2012-10-24T16:13:00+01:00
lastmod: 2012-10-24T16:13:00+01:00
title: "Mit virt-install virtuelle KVM Maschinen an der Textkonsole ohne VNC installieren"
description: "Die meisten KVM bzw. virt-install Tutorials erwecken den Eindruck, dass man virtuelle Maschinen zwar an der Konsole neu erstellen kann, sich dann aber via VNC in diese verbinden muss, um die Installation durchzuführen. Es geht aber auch komplett textbasiert, d.h. man muss die laufende SSH Session mit dem KVM Host nicht einmal unterbrechen. Einzige Voraussetzung ist natürlich, dass der zu installierende KVM Gast überhaupt eine textbasierte Installation erlaubt. Getestet habe ich es mit einem Ubuntu 12.04 LTS Server Gast."
authors: ["manuelkiessling"]
slug: 2012/10/24/mit-virt-install-virtuelle-kvm-maschinen-an-der-textkonsole-ohne-vnc-installieren
lang: de
---

Aus Versehen Ubuntu Desktop installiert, jetzt soll's aber doch ein Server werden? So wird man die grafische Oberfläche komplett los:

```
apt-get remove \
    --purge \
        whoopsie \
        network-manager \
        lightdm \
        ubuntu-desktop \
        unity* \
        gnome* \
        xserver-xorg-core xserver-xorg compiz-kde compizconfig-backend-kconfig kdelibs5-data libattica0.3 libdlrestrictions1 libkdecore5 libkdeui5
apt-get --purge autoremove
```
