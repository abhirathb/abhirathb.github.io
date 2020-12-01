---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults
title: Abhirath Batra's Home
layout: default
permalink: /posts/
---
# Blog Posts

<table>
{% for post in site.posts %}

<tr><td><a href="{{post.url}}" style="font-size:large;"> {{post.title}} </a>  </td>
<td style="text-align:right;"> {{post.date}} </td>
</tr>


{% endfor %}

</table>

