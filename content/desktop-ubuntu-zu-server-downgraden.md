---
date: 2012-10-24T16:13:00+01:00
lastmod: 2012-10-24T16:13:00+01:00
title: "Desktop Ubuntu zu Server downgraden"
description: "Aus Versehen Ubuntu Desktop installiert, jetzt soll's aber doch ein Server werden? So wird man die grafische Oberfläche komplett los."
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
