---
date: 2012-11-13T16:13:00+01:00
lastmod: 2012-11-13T16:13:00+01:00
title: "Software-RAIDs unter Linux mittels md"
description: "Über das md Modul („Multiple Device driver“) verfügt der Linux-Kernel bereits seit geraumer Zeit über einen äußerst soliden Treiber, um rein softwaregesteuerte Festplatten-RAIDs zu konstruieren."
authors: ["manuelkiessling"]
slug: 2012/11/13/software-raids-unter-linux-mittels-md
lang: de
---

Über das md Modul („Multiple Device driver“) verfügt der Linux-Kernel bereits seit geraumer Zeit über einen äußerst soliden Treiber, um rein softwaregesteuerte Festplatten-RAIDs zu konstruieren.

Diese Software-RAIDs bringen zwar nicht die Performance eines dedizierten hochwertigen Hardware-RAID-Controllers mit, sind aber definitiv mehr als eine Notlösung. Die Benchmarks am Ende des Artikels zeigen, dass sich zumindest für ein strukturell einfaches RAID1-Setup keine praktisch relevanten Performanceeinbußen messen lassen.

Im folgenden wird beschrieben, wie man ein Software-RAID1 unter Ubuntu 12.04 LTS Precise Pangolin aufbauen und betreiben kann.

Als Beispiel gehen wir davon aus, dass das Betriebssystem unter `/dev/sda1` liegt, mit einer swap Partition unter `/dev/sda2`. Das System verfügt über zwei weitere, bisher unbenutzte Festplatten, die als `/dev/sdb` und `/dev/sdc` verfügbar sind. Über beide Platten soll ein RAID1 gebildet werden. Die Schritte sind nun wie folgt:

- Anlegen von je einer Linux RAID Partition auf beiden ungenutzten Platten
- Aufbau einer virtuellen Partition `/dev/md0` als RAID1 über die neuen Partitionen
- Formatierung der virtuellen RAID Partition mit einem Dateisystem
- Mounten der virtuellen Partition
- Erzeugen einer permanenten Konfiguration für das erzeugte RAID Setup

Virtuelle Software-RAIDs werden über zwei oder mehr Partitionen physikalischer Platten angelegt. Diese Partitionen müssen von einem bestimmten Typ sein („Linux raid autodetect“). Angelegt werden können sie beispielsweise mit cfdisk. In unserem Szenario reicht es völlig, nur eine primäre Partition `/dev/sdb1` anzulegen, welche die gesamte Festplatte beansprucht, und ihr den Typ `Linux raid autodetect` (Typcode: `fd`) zuzuweisen.

Das Ergebnis sähe dann wie folgt aus:

```
cfdisk (util-linux 2.20.1)

Disk Drive: /dev/sdb
Size: 320072933376 bytes, 320.0 GB
Heads: 255 Sectors per Track: 63 Cylinders: 38913

Name Flags Part Type FS Type [Label] Size (MB)
------------------------------------------------------------------
sdb1 Primary Linux raid autodetect 316067.03
```

`/dev/sdc` muss nun genau identisch strukturiert werden, ein Schritt, der sich sehr elegant abkürzen lässt:

```
sfdisk -d /dev/sdb | sfdisk /dev/sdc
```

Nun haben wir zwei Partitionen auf zwei unterschiedlichen physikalischen Festplatten, und können somit das Software-RAID aufbauen. Dies geschieht mittels `mdadm`:

```
mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb1 /dev/sdc1
```

Danach steht dem System eine neue (virtuelle) Festplatte `/dev/md0` zur Verfügung. Diese bildet unser RAID1 ab.

Den RAID-Status kann man mittels `cat /proc/mdstat` einsehen – zu Beginn muss `md` die RAID1-Spiegelung noch synchronisieren, das sieht dann in etwa so aus:

```
Personalities : [linear] [multipath] [raid0] [raid1] [raid6] [raid5] [raid4] [raid10]
md0 : active raid1 sdb1[2] sdc1[0]
8384448 blocks super 1.2 [2/1] [U_]
[>....................] recovery = 3.1% (260608/8384448) finish=2.0min speed=65152K/sec
```

Sobald dieser Vorgang abgeschlossen ist, das RAID1 also im „Normalbetrieb“ ist, wird der Status wie folgt ausgegeben:

```
Personalities : [linear] [multipath] [raid0] [raid1] [raid6] [raid5] [raid4] [raid10]
md0 : active raid1 sdb1[1] sdc1[0]
8384448 blocks super 1.2 [2/2] [UU]
```

Einsatzbereit ist das virtuelle Volume aber sofort, das bedeutet, wir können unmittelbar nach dessen Erzeugung ein Dateisystem darauf anlegen...

```
mkfs.ext4 /dev/md0
```

...und es dann auch umgehend mounten und nutzen:

```
mount /dev/md0 /mnt
```

Einige wenige Handgriffe sind noch notwendig, damit das RAID Volume auch nach einem Neustart wieder eingebunden wird: man muss einerseits die `/etc/fstab` erweitern:

```
# <file system> <mount point> <type> <options> <dump> <pass>
/dev/md0       /mnt            ext4    errors=remount-ro  0       1
```

...und damit das System auch dann hochfährt, wenn eine der am RAID beteiligten Platten ausgefallen ist (irgendwie ja der Witz eines RAIDs), muss auf Ubuntu-Systemen die Datei `/etc/initramfs-tools/conf.d/mdadm` um den Eintrag `BOOT_DEGRADED=true` erweitert und dann mit `sudo update-initramfs -u` die initrd neu gebaut werden. Bei nicht-Ubuntu Systemen kann man denselben Effekt erreichen, indem man die `grub` Konfiguration um den Kernelparameter `bootdegraded=true` erweitert.

Und wie schnell ist das Ganze nun? Folgender (aus dem hervorragenden KVM Buch von Ralf Spenneberg und Michael Kofler geklaute) Benchmark:

```
#!/bin/bash
mkdir test1
tar xjf kernel.tar.bz2 -C test1
for i in $(seq 2 10); do
cp -a test1 test$i
find test$i -type f | xargs md5sum > /dev/null
done
diff test1 test2
rm -rf test*
sync
```

bei dem `kernel.tar.bz2` der aktuelle Linuxkernel ist, bringt folgendes Ergebnis auf einer normalen nicht-RAID Partition:

```
real 1m31.016s
user 0m20.293s
sys 0m18.081s
```

und auf einer RAID1-Partition, bei der die darunterliegenden Platten gleicher Bauart sind:

```
real 1m6.894s
user 0m20.261s
sys 0m18.069s
```

Das kann sich meiner Meinung nach sehen lassen.
