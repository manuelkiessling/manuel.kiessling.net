---
date: 2012-10-31T16:13:00+01:00
lastmod: 2012-10-31T16:13:00+01:00
title: "Direktes mounten eines KVM RAW Images"
description: "Ich habe ein mir weitgehend unbekanntes RAW Image eines KVM-Gastes, und möchte auf die darin vorhandenen Partitionen direkt zugreifen, d.h. ich will sie auf dem KVM Host einmounten."
authors: ["manuelkiessling"]
slug: 2012/10/31/direktes-mounten-eines-kvm-raw-images
lang: de
---

Ich habe ein mir weitgehend unbekanntes RAW Image eines KVM-Gastes, und möchte auf die darin vorhandenen Partitionen direkt zugreifen, d.h. ich will sie auf dem KVM Host einmounten.

Dies geht mit folgendem Kommando:

```
mount -t ext4 -o loop,offset=OFFSET /var/lib/libvirt/images/foo.raw /mnt
```

Das Problem ist der Offset – es ist eine Byte-Angabe die dem Mount-Befehl sagt, an welcher Stelle in der RAW Datei die Partition beginnt. Diese Zahl muss man zuerst ermitteln. Hierbei hilft das Tool `kpartx`, welches unter Ubuntu im gleichnamigen Paket verfügbar ist.

Der Aufruf von

```
kpartx -l /var/lib/libvirt/images/foo.raw
```

liefert eine Auflistung der Partionen:

```
loop0p1 : 0 15955968 /dev/loop0 2048
loop0p2 : 0 815106 /dev/loop0 15960062
loop0p5 : 0 815104 /dev/dm-1 2
```

Die Zahl in der letzten Spalte, also bei `loop0p1` die `2048`, ist die Blocknummer, an der diese Partition beginnt. Die Blocksize ist üblicherweise 512 Byte, daher müssen wir Mount mitteilen, dass die Partition bei Byte

```
2048 x 512 = 1048576
```

startet:

```
mount -t ext4 -o loop,offset=1048576 /var/lib/libvirt/images/foo.raw /mnt
```
