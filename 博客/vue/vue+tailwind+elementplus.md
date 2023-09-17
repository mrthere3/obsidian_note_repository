title: tailwind+elementplus 
categories: vue
tags: 
+ tailwindcss 
+ element-plus
mathjax: true  
date: 2023-09-14 22:35   
updated: 2023-09-14 22:35   
weather: 天气：☁️   阴 气温：+22°C 风力：↙11km/h

---
每日诗词
> 无情明月，  
> 有情归梦，  
> 同到幽闺。  
> 
> —— 刘基  
> 《眼儿媚·秋思》

#todo
- [x] 书写前端项目搭建
- [x] 集成 tailwindcss 和 elmentplus 开发项目

![5_Journey_8k 1](https://source.wjwsm.top/5_Journey_8k%201.jpg)

# 为什么要使用 tailwindcss 和 elment-plus

作为一名后端程序员,有的时候需要写一些页面,但是又苦于自己没有前端的那些技能,让自己的页面很简陋,这个时候,一些前端框架的使用,就能帮助我们解决这个问题😄
## 为什么要使用vue+tailwindcss+elment-plus

### vue
vue 是当下最热门的前端框架之一,响应式和虚拟 dom,作为他最重要的特色,便利了无数开发者,而且其组件化开发,也能让开发者在社区的支持下,使用组件自由构建属于自己的页面.
下面是 vue 的官网,如果你有了解过他的语法,那对于你的开发也是锦上添花.vue 现在的版本是 vue2 和 vue3

<div class="rich-link-card-container"><a class="rich-link-card" href="https://cn.vuejs.org/guide/introduction.html" target="_blank">
	<div class="rich-link-image-container">
		<div class="rich-link-image" style="background-image: url('https://vuejs.org/images/logo.png')">
	</div>
	</div>
	<div class="rich-link-card-text">
		<h1 class="rich-link-card-title">简介 | Vue.js</h1>
		<p class="rich-link-card-description">
		Vue.js - 渐进式的 JavaScript 框架
		</p>
		<p class="rich-link-href">
		https://cn.vuejs.org/guide/introduction.html
		</p>
	</div>
</a></div>

### elment-plus
vue 只是一个空白的框架,组件是填充框架,让我们页面更加丰富,更多功能的基础.elmeng_plus 就是一个 vue3 的组件组,里面包含了大量页面所需要的各种的元素,方便开发者更加方便的挑选,组合和使用.

<div class="rich-link-card-container"><a class="rich-link-card" href="https://element-plus.org/zh-CN/component/button.html" target="_blank">
	<div class="rich-link-image-container">
		<div class="rich-link-image" style="background-image: url('https://element-plus.org/apple-touch-icon.png')">
	</div>
	</div>
	<div class="rich-link-card-text">
		<h1 class="rich-link-card-title">Button 按钮 | Element Plus</h1>
		<p class="rich-link-card-description">
		a Vue 3 based component library for designers and developers
		</p>
		<p class="rich-link-href">
		https://element-plus.org/zh-CN/component/button.html
		</p>
	</div>
</a></div>

### tailwindcss
这是一个 css 框架,有的时候后端真的很难记得住,前端那么多 api ,布局也是,css 本身就是一门越学越深入的语言,而我们的需求,也不需要我们过多深入这门语言,我们如果只是想要速成,去能够写出一些好看的样式,那 tailwindcss 这个框架绝对值得你去学习.


<div class="rich-link-card-container"><a class="rich-link-card" href="https://tailwind.nodejs.cn/docs/installation" target="_blank">
	<div class="rich-link-image-container">
		<div class="rich-link-image" style="background-image: url('https://tailwind.nodejs.cn/favicons/apple-touch-icon.png?v=3')">
	</div>
	</div>
	<div class="rich-link-card-text">
		<h1 class="rich-link-card-title">安装 - Tailwind CSS 中文网</h1>
		<p class="rich-link-card-description">
		从头开始启动和运行 Tailwind CSS 的最简单、最快速的方法是使用 Tailwind CLI 工具。
		</p>
		<p class="rich-link-href">
		https://tailwind.nodejs.cn/docs/installation
		</p>
	</div>
</a></div>


## 如何去安装使用?
### 构建 vue 项目
```shell
npm create vue@latest
%% 调试 %%
npm run serve
%% 打包 %%
npm run build

```

如下图所示,这是构建之后的目录结构
![[Pasted image 20230917170627.png]]

### 安装 elment-plus