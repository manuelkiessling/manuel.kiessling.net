---
date: 2011-11-15T16:13:00+01:00
lastmod: 2011-11-15T16:13:00+01:00
title: "Cocoa: What to do if outlineView: objectValue ForTableColumn: byItem never gets called"
description: ""
authors: ["manuelkiessling"]
slug: 2011/11/15/what-to-do-if-outlineview-objectvaluefortablecolumn-byitem-is-never-called
---

<p>
If you set up an OutlineView in Interface Builder and connect your Controller as its dataSource and delegate (and provide the methods there accordingly), you will notice that
</p>
<p>
<code>- (id)outlineView:(NSOutlineView *)outlineView
  objectValueForTableColumn:(NSTableColumn *)tableColumn
  byItem:(id)item</code>
</p>
<p>
never get’s called. The reason might very simple: in Interface Builder, in the attributes inspector for your OutlineView, you can define the <em>Content Mode</em> as <em>View Based</em> or <em>Cell Based</em>.
</p>
<p>
If you simply want to display the content of NSStrings, choose <em>Cell Based</em>, and objectValueForTableColumn will be called.
</p>
<p>
Only took me 3 hours to find out...
</p>
