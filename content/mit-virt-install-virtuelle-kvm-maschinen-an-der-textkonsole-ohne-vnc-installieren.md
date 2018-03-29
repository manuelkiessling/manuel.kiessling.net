---
date: 2012-10-24T16:13:00+01:00
lastmod: 2012-10-24T16:13:00+01:00
title: "Mit virt-install virtuelle KVM Maschinen an der Textkonsole ohne VNC installieren"
description: "Die meisten KVM bzw. virt-install Tutorials erwecken den Eindruck, dass man virtuelle Maschinen zwar an der Konsole neu erstellen kann, sich dann aber via VNC in diese verbinden muss, um die Installation durchzuführen. Es geht aber auch komplett textbasiert, d.h. man muss die laufende SSH Session mit dem KVM Host nicht einmal unterbrechen. Einzige Voraussetzung ist natürlich, dass der zu installierende KVM Gast überhaupt eine textbasierte Installation erlaubt. Getestet habe ich es mit einem Ubuntu 12.04 LTS Server Gast."
authors: ["manuelkiessling"]
slug: 2012/10/24/mit-virt-install-virtuelle-kvm-maschinen-an-der-textkonsole-ohne-vnc-installieren
lang: de
---

Die meisten KVM bzw. `virt-install` Tutorials erwecken den Eindruck, dass man virtuelle Maschinen zwar an der Konsole neu erstellen kann, sich dann aber via VNC in diese verbinden muss, um die Installation durchzuführen. Es geht aber auch komplett textbasiert, d.h. man muss die laufende SSH Session mit dem KVM Host nicht einmal unterbrechen. Einzige Voraussetzung ist natürlich, dass der zu installierende KVM Gast überhaupt eine textbasierte Installation erlaubt. Getestet habe ich es mit einem Ubuntu 12.04 LTS Server Gast.

Der dazu notwendige `virt-install` Befehl lautet:

```
virt-install \
    --connect qemu:///system \
    --name my-vm \
    --ram 512 \
    --vcpus=1 \
    --disk vol=default/my-vm.qcow2 \
    --network network=default \
    --os-variant ubuntuprecise \
    --location http://mirror.netcologne.de/ubuntu/dists/precise/main/installer-amd64/ \
    --graphics none \
    --extra-args='console=tty0 console=ttyS0,115200n8 serial' \
    --noreboot
```

Der Trick ist über die `extra-args` dafür zu sorgen, dass eine serielle Konsole beim Booten der virtuellen Maschine gestartet wird, auf welche die KVM Konsole dann zugreifen kann. Dies funktioniert übrigens nicht, wenn man die VM von einem ISO Image booten möchte, sondern nur, wenn man über eine `--location` startet.

Im konkreten Beispiel, also bei einem Ubuntu 12.04 Gast, „hängt“ die Installation übrigens gute 60 Sekunden, nachdem man einen Installationsmirror ausgewählt hat – gerade an der spartanischen Textkonsole wirkt dies, als ob die gesamte Maschine abgestürzt wäre, dies ist aber nicht der Fall – einfach warten.
