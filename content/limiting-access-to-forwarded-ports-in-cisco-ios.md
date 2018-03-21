---
date: 2014-06-20T16:13:00+01:00
lastmod: 2014-06-20T16:13:00+01:00
title: "Limiting access to forwarded ports in Cisco iOS"
description: "This is a short tutorial which explains how to forward outside access to ports on a Cisco router on to ports on internal systems while limiting this access to selected outside IPs."
authors: ["manuelkiessling"]
slug: 2014/06/20/limiting-access-to-forwarded-ports-in-cisco-ios
---

<p>
The following should probably be obvious, but I had a surprisingly hard time figuring out the official Cisco documentation.
</p>

<p>
The scenario is as follows: a gateway Cisco router provides internet access via NAT for, say, your office. It therefore has an external interface (called <em>Dialer0</em>, for example) which is connected to the uplink (this could e.g. be a DSL line), and an internal ethernet interface connected to the internal office network:
</p>

<p>
</p><pre>                                                
                                                
               ^                                
               |                                
               | Dialer0: 87.224.25.11          
               |                                
       +-------+-------+                        
       |               |                        
       |     Cisco     |                        
       |               |                        
       +-------+-------+                        
               |                                
               | GigabitEthernet0/0: 192.168.1.1
               |                                
               v                                
                                                
                                                
</pre>

<p>
If you would like to make machines that are part of the internal 192.168.1 network accessible from the outside, then this can be easily achieved by forwarding ports on the Cisco:
</p>

<p>
</p><pre><code>cisco# <strong>conf t</strong>
cisco(config)# <strong>ip nat inside source static tcp 192.168.1.55 80 interface Dialer0 8080</strong></code></pre>
<p></p>

<p>
Now, accessing your uplink DSL IP 87.224.25.11 at port 8080 will connect you with your internal server 192.168.1.55 at port 80. However, this access is not restricted – the forwarded port ist accessible from anywhere. If this is not what you want, then here is how to restrict access to a certain IP (in our example, that’s 59.234.56.111).
</p>

<p>
First, reconfigure your Dialer0 interface to respect the rules of the yet-to-create access list <em>outside-in</em>:
</p>

<p>
</p><pre><code>cisco# <strong>conf t</strong>
cisco(config)# <strong>interface Dialer0</strong>
cisco(config-if)# <strong>ip access-group outside-in in</strong></code></pre>
<p></p>

<p>
Then, create this access list as follows:
</p>

<p>
</p><pre><code>cisco# <strong>conf t</strong>
cisco(config)# <strong>ip access-list extended outside-in</strong>
cisco(config-ext-nacl)# <strong>permit tcp host 59.234.56.111 any eq 8080</strong>
cisco(config-ext-nacl)# <strong>deny tcp any any eq 2201</strong>
cisco(config-ext-nacl)# <strong>permit ip any any</strong></code></pre>
<p></p>

<p>
And that’s it. Now the following access is possible:
</p>

<p>
</p><pre>                                                           
                                                           
       +---------------+                                   
       |               |                                   
       | Server        |  "Access 87.224.25.11 Port 8080"  
       | 59.234.56.111 |                                   
       |               |                                   
       +-------+-------+                                   
               |                                           
               | Dialer0: 87.224.25.11                     
               |                                           
       +-------v-------+                                   
       |               |                                   
       |     Cisco     |  "Forward to 192.168.1.55 Port 80"
       |               |                                   
       +-------+-------+                                   
               |                                           
               | GigabitEthernet0/0: 192.168.1.1           
               |                                           
               |                                           
       +-------v-------+                                   
       |               |                                   
       | Server        |                                   
       | 192.168.1.55  |                                   
       |               |                                   
       +---------------+                                   
                                                           
                                                           
</pre>
<p></p>

<p>
If the same access is initiated by a different external IP, then this access will be denied.
</p>
