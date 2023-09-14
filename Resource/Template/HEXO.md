title: <% tp.file.title %>  
categories:  
  - 
tags:  
  - 
mathjax: true  
date: <% tp.file.creation_date() %>   
updated: <% tp.file.last_modified_date() %>   
weather: <% tp.user.get_weather() %>

---
每日诗词
<% tp.user.get_pomes() %>
