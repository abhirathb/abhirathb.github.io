---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults
title: Abhirath Batra's Home
layout: default
permalink: /posts/
---
# Blog Posts

{% for post in site.posts %}
## <a href="{{post.url}}" style="text-size:medium"> {{post.title}} </a> 


{% endfor %}



