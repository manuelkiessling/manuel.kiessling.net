---
date: 2012-10-31T16:13:00+01:00
lastmod: 2012-10-31T16:13:00+01:00
title: "KVM Gäste über WLAN ins Netz bringen"
description: "Folgende Situation: Ihr habt einen KVM-Host, auf dem mehrere virtuelle Maschinen laufen. Diese sind alle mit einer Bridge verbunden, die auf dem Host eingerichtet wurde. Soweit, so gewöhnlich. Was aber, wenn der Zugang zum Internet auf dem Host nicht über eth0 erfolgt, sondern über eine WLAN-Verbindung? In diesem Fall kommen die KVM-Gäste über die Bridge zwar an alle Hosts, die entweder Teil der Bridge sind oder an eth0 hängen, sie gelangen aber nicht ins Internet."
authors: ["manuelkiessling"]
slug: 2012/10/31/kvm-gaeste-ueber-wlan-ins-netz-bringen
lang: de
---

Folgende Situation: Ihr habt einen KVM-Host, auf dem mehrere virtuelle Maschinen laufen. Diese sind alle mit einer Bridge verbunden, die auf dem Host eingerichtet wurde, wobei `eth0` ein Teil dieser Bridge ist:

```
~# brctl show
bridge name	bridge id		STP enabled	interfaces
lan0		8000.dc0ea1540a0e	no		eth0
							vnet0
							vnet1
```

Soweit, so gewöhnlich. Was aber, wenn der Zugang zum Internet auf dem Host nicht über `eth0` erfolgt, sondern über eine WLAN-Verbindung? In diesem Fall kommen die KVM-Gäste über die Bridge zwar an alle Hosts, die entweder Teil der Bridge sind oder an `eth0` hängen, sie gelangen aber nicht ins Internet.

Dazu müssen nämlich Pakete, die aus der Bridge kommen, und für ein Netz bestimmt sind, das nicht auf der Bridge liegt, weitergeleitet werden. Und genau dieses Forwarding kann man mit normalen Linux Bordmitteln einrichten.

In unserem Beispiel haben wir folgende Konstellation:

- Der KVM Host ist über wlan0 mit dem WLAN verbunden und hat auf diesem Interface die `10.10.10.11`
- Das default Gateway des KVM Host ist die `10.10.10.1`, worüber dieser bereits ins Internet gelangt
- Er hat eine Bridge `lan0`, zu der auch `eth0` gehört. Die Bridge hat die IP `192.168.1.22`
- Es gibt einen KVM Gast, dessen `eth0` an `vnet0` hängt und die IP `192.168.1.33` hat

Zuerst einmal müssen wir grundsätzlich IP Forwarding auf dem KVM Host aktivieren:

```
sysctl -w net.ipv4.ip_forward=1
```

Dann sorgen wir dafür, dass sämtliche Pakete aus dem Interface `lan0`, die nicht für das Netzwerk `192.168.1.0/24` bestimmt sind, an das Interface `wlan0` weitergeleitet werden:

```
iptables -A FORWARD -o wlan0 \
         -i lan0 \
         -s 192.168.1.0/24 \
       ! -d 192.168.1.0/24 \
         -m conntrack --ctstate NEW -j ACCEPT
```

Alle bereits etablierten Verbindungen werden dann weitergeleitet:

```
iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
```

Und zu guter Letzt wird auf der ausgehenden Schnittstelle NAT aktiviert und somit Anfragen aus dem 192.168.1.0er Netz maskiert, da sonst die Pakete aus diesem Netz mit einer 192.168.1.0er Quell-IP-Adresse ins Internet gelangen würden und nicht beantwortet werden können:

```
iptables -t nat -A POSTROUTING -o wlan0 -j MASQUERADE
```

Nun muss man auf den KVM-Gästen lediglich noch den KVM-Host als default Gateway eintragen (was vermutlich eh schon der Fall war), und schon gelingt von diesen die Verbindung ins Internet über die WLAN Verbindung des Hosts:

```
route add default gw 192.168.1.22
```
