<%*
let tags = await tp.system.prompt("tags","python")
let titleName = await tp.system.prompt("title：Your file name",tp.date.now("YYYY-MM-DD"))
let categories = await tp.system.prompt("categories")
let createTime = tp.file.creation_date()
let modificationDate = tp.file.last_modified_date("dddd Do MMMM YYYY HH:mm:ss")
-%>

title: <% tp.file.title %>  
categories: <% categories %>
tags: <% tags %>
mathjax: true  
date: <% tp.file.creation_date() %>   
updated: <% tp.file.last_modified_date() %>   
weather: <% tp.user.get_weather() %>

---

<% tp.web.random_picture("", "landscape") %>

<% tp.user.get_pomes() %>





<%*
let destDir = "/博客/" + tags 
await tp.file.move(destDir + "/" + titleName)
tp.file.cursor()
-%>