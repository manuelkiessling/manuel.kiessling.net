---
date: 2012-10-24T16:13:00+01:00
lastmod: 2012-10-24T16:13:00+01:00
title: "Using virt-install to create virtual KVM machines on the text console without using VNC"
description: "Most KVM or virt-install tutorials will make you think that while you can create new virtual guests on the text console, you still have to log into them using VNC in order to actually use their OS installation tools. But in fact there is a way to completely install new guests without leaving your SSH session – as long as the guest OS does have a text-based installer, that it. I have tested this with an Ubuntu 12.04 LTS Server guest."
authors: ["manuelkiessling"]
slug: 2012/10/24/using-virt-install-to-create-virtual-kvm-machines-on-the-text-console-without-using-vnc
---

Most KVM or `virt-install` tutorials will make you think that while you can create new virtual guests on the text console, you still have to log into them using VNC in order to actually use their OS installation tools. But in fact there is a way to completely install new guests without leaving your SSH session – as long as the guest OS does have a text-based installer, that it. I have tested this with an Ubuntu 12.04 LTS Server guest.

The `virt-install` command you need is:

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

The trick is to ensure that the guests boot with a serial console that the KVM console can connect to. This only works if booting the guest from a `--location`, and won't work when booting from ISOs.

Note that when installing an Ubuntu 12.04 guest this way, the installation „hangs“ for about 60 seconds after selecting an installation mirror – on the text console, it looks like the whole installation crashed, but it didn’t – just wait.
