---
date: 2013-03-19T13:13:00+01:00
lastmod: 2013-03-19T13:13:00+01:00
title: "Converting a running physical machine into a KVM virtual machine"
description: "Let’s assume you have a physical machine running a Linux system, and you would like to convert this system into a virtual KVM/QEMU machine, keeping everything as close to the original as possible. What follows is my approach."
authors: ["manuelkiessling"]
slug: 2013/03/19/converting-a-running-physical-machine-to-a-kvm-virtual-machine
---

<p>
Let’s assume you have a physical machine running a Linux system, and you would like to convert this system into a virtual KVM/QEMU machine, keeping everything as close to the original as possible. What follows is my approach.
</p>

<p>
The first thing we need is a raw image file which mirrors the exact layout of the physical hard drive in our physical server.
</p>

<p>
In our example scenario, the physical box has one hard drive at <em>/dev/sda</em> with a <em>/boot</em> Partition on <em>/dev/sda2</em> and a physical LVM volume on <em>/dev/sda3</em>. This LVM volume houses a volume group with two logical volumes, one of them housing the root partition <em>/</em>, and the other one being unused. Also, <em>/dev/sda1</em> is unused. Grub is installed into the Master Boot Record.
</p>

<p>
(While this setup may sound like it doesn’t make too much sense, trust me that I encountered this very setup the other day. The good news is that it’s an excellent example case because it is quite complicated, which gives me the chance to explain a lot of different concepts and solutions in detail.)
</p>

<p>
We need to recreate this hard drive in the virtual world. If we could stop the server, this would actually be quite simple: shutdown the machine, boot from a linux rescue cd, and <em>dd</em> every single byte from <dev>/dev/sda into a raw image file. This might even work when done from a running system where the disk is mounted, at least to a certain degree. But if you want to learn about all the little details that make up hard drive partitions and their file system, then continue reading.
</dev></p>

<p>
Let’s look at the layout of the physical disk with <em>fdisk -ul /dev/sda</em>:
</p>

<pre><code>Disk /dev/sda: 299.4 GB, 299439751168 bytes
255 heads, 63 sectors/track, 36404 cylinders, total 584843264 sectors
Units = sectors of 1 * 512 = 512 bytes

   Device Boot      Start         End      Blocks   Id  System
/dev/sda1   *          63     1012094      506016    b  W95 FAT32
/dev/sda2         1012095     1220939      104422+  83  Linux
/dev/sda3         1220940   584830259   291804660   8e  Linux LVM</code></pre>

<p>
Next, we need to switch to our KVM host server and create a raw image file that is exactly the same size as the physical hard drive (which, according to the first line of fdisk’s output, is 299.4 GB, or 299439751168 bytes):
</p>

<pre><code># qemu-img create image.raw 299439751168</code></pre>

<p>
We could now re-create the partitioning scheme of the physical disk on the image by hand, but there is a simple shortcut: we only need to write the first 512 bytes of the physical disk into the first 512 bytes of the image. That’s the Master Boot Record (MBR) where all partitioning information resides.
</p>

<p>
<em>dd</em> is the tool of choice for reading and writing raw bytes. We use the following to read the MBR from our physical disk:
</p>

<pre><code># dd if=/dev/sda of=./mbr.bin bs=512 count=1</code></pre>

<p>
It will write exactly one 512 byte block into a file called mbr.bin. Transfer this file to your KVM host, then write its content into the image file:
</p>

<pre><code># dd if=./mbr.bin of=./image.raw bs=512 count=1 conv=notrunc</code></pre>

<p>
This writes exactly one block of 512 bytes into the image, and does not truncate the rest of the image.
</p>

<p>
Now run
</p>

<pre><code># fdisk -l image.raw</code></pre>

<p>
to verify that the image file now has a partition layout which mirrors that of the physical disk:
</p>

<pre><code>    Device Boot      Start         End      Blocks   Id  System
image.raw1   *          63     1012094      506016    b  W95 FAT32
image.raw2         1012095     1220939      104422+  83  Linux
image.raw3         1220940   584830259   291804660   8e  Linux LVM</code></pre>

<p>
Now we can start to create filesystems on our imagefile’s partitions. But to create file systems, we need to address these partitions as devices. <em>losetup</em> comes to the rescue, because it allows us to present parts of a raw image file to the host system as loopback devices.
</p>

<p>
We need to create two loopback devices, one for the <em>sda2</em> partition (<em>/boot</em> on our physical system), and one for the <em>sda3</em> partition, which is a physical LVM volume. Afterwards, we will be able to use the <em>sda2</em> loopback device directly – because of LVM, <em>sda3</em> needs some extra care, as we will see.
</p>

<p>
Here is how we create a loopback device <em>/dev/loop0</em> which points at the section of <em>image.raw</em> that makes up the <em>sda2</em> partition:
</p>

<pre><code># losetup /dev/loop0 image.raw -o 518192640 --sizelimit 106928128</code></pre>

<p>
You probably wonder where those insane numbers come from. It’s actually quite simple: The image file is, of course, just one continuous stream of bytes. A certain range of bytes within this stream represents the <em>sda2</em> partition we just created on the image file. We don’t want the loopback device to point at the whole image file, but rather on the <em>sda2</em> section only. And this section starts at byte 518192640 (the offset) and ends 106928128 bytes later (the sizelimit). How do we know? This is the calculation:
</p>

<pre><code>offset = partition start block * 512
sizelimit = (partition end block - partition start block) * 512</code></pre>

<p>
See the output of <em>fdisk -l image.raw</em> above for the partition start and end block numbers.
</p>

<p>
We now have a loopback device <em>/dev/loop0</em> that looks and feels just like a real physical device – in this case, a hard disk partition. As this, it can be formatted:
</p>

<pre><code># mkfs.ext3 /dev/loop0</code></pre>

<p>
Great, so now we have the <em>/boot</em> partition of our virtual server available, with the same layout as on our physical server. Let’s tackle the LVM volume on <em>/dev/sda3</em> next.
</p>

<p>
What we need is the LVM header from our physical server’s disk. Again, <em>dd</em> is the tool of choice:
</p>

<pre><code># dd if=/dev/sda3 of=lvmheader.bin bs=512 count=24</code></pre>

<p>
This writes the first 24 blocks of 512 bytes into the file <em>lvmheader.bin</em>. It’s the part if partition <em>sda3</em> where the layout of the LVM setup is described. Just like the MBR, this needs to be transferred to our KVM host and must be written to the right place within our raw image file.
</p>

<p>
To do so, we will create another loopback device, <em>/dev/loop1</em>, which points at the byte section for the <em>sda3</em> partition within our image file:
</p>

<pre><code># losetup /dev/loop0 image.raw -o 625121280 --sizelimit 298807971328</code></pre>

<p>
The numbers were calculated accordingly, of course.
</p>

<p>
Now we can write the LVM header:
</p>

<pre><code># dd if=lvmheader.bin of=/dev/loop1 bs=512 count=24 conv=notrunc</code></pre>

<p>
Afterwards, you can run
</p>

<pre><code># pvs</code></pre>

which should display the newly found LVM volume group:

<pre><code>  PV         VG         Fmt  Attr PSize   PFree
  /dev/loop0 VolGroup00 lvm2 a-   278.28g    0</code></pre>

<p>
Run
</p>

<pre><code># lvm vgchange -ay</code></pre>

<p>
to activate it. Now, when running
</p>

<pre><code># lvm lvs</code></pre>

<p>
its volumes should be listed like this:
</p>

<pre><code>  LV       VG         Attr   LSize   Origin Snap%  Move Log Copy%  Convert
  LogVol00 VolGroup00 -wi-a- 268.53g
  LogVol01 VolGroup00 -wi-a-   9.75g</code></pre>

<p>
At this point, the logical volume that will house the root partition can be accessed, and therefore we can format it:
</p>

<pre><code># mkfs.ext3 /dev/mapper/VolGroup00-LogVol00</code></pre>

<p>
With this, we reached the point where we can mount the root and the <em>/boot</em> partition from the image on our KVM host:
</p>

<pre><code># mount /dev/mapper/VolGroup00-LogVol00 /mnt
# mkdir /mnt/boot
# mount /dev/loop0 /mnt/boot</code></pre>

<p>
Next, we can copy over all the files from our physical server to the mounted image partitions on the KVM host. This could be done using rsync, for example:
</p>

<pre><code># rsync -aAXvP / your.kvm.host:/mnt/ \
--delete \
--exclude={/dev/*,/proc/*,/sys/*,/tmp/*,/run/*,/mnt/*,/media/*,/lost+found,/home/*/.gvfs}</code></pre>

<p>
The nice here is that you can transfer the files on-the-fly from the running system. Of course, at one point you need to make a “last sync” just before the virtual machine replaces the physical machine. However, you can transfer most of the data beforehand, and when the moment comes, you can shut down all services like databases, crond etc. and do the last sync in a relatively short time window.
</p>

<p>
Once this is done, we have a working, bootable KVM raw image. We could now unmount the partitions and import the image as a new virtual machine, like so:
</p>

<pre><code># virt-install \
 -n mymachine \
 -r 512 \
 --os-variant rhel5.4 \
 --disk /var/lib/libvirt/images/image.raw,device=disk,bus=virtio,cache=none \
 --nonetworks \
 --graphics vnc,listen=0.0.0.0,port=5910 \
 --import \
 --prompt
</code></pre>

<p>
In case the VM does <em>not</em> boot, one reason could be that its <em>initrd</em> does not have the <em>virtio</em> drivers and thus cannot access the virtual drive. In this case, you must build a new <em>initrd</em> as follows:
</p>

<p>If you still have the partitions mounted, bind the raw image file itself into the mounted filesystem, like so:</p>

<pre><code># mkdir /mnt/images
# mount --bind /var/lib/libvirt/images/image.raw /mnt/images</code></pre>

<p>
Now, chroot into your VM’s root partition:
</p>

<pre><code># chroot /mnt</code></pre>

<p>In there you must mount the <em>/proc</em> pseudo-filesystem, remove your current <em>initrd</em> image, and build a new one with the <em>virtio</em> drivers included:

<pre><code># mount -t proc none /proc
# rm /boot/initrd.img
# mkinitrd --with virtio_pci --with virtio_blk /boot/initrd.img the.kernel.version
# umount /proc
# exit</code></pre>

</p><p>
Don’t forget to unmount everything afterwards:
</p>

<pre><code># umount /mnt/boot
# umount /mnt/images
# umount /mnt</code></pre>