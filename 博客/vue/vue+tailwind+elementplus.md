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
```js
npm create vue@latest
// 调试  
npm run serve
// 打包 
npm run build

```

如下图所示,这是构建之后的目录结构
![Pasted image 20230917170627](https://source.wjwsm.top/Pasted%20image%2020230917170627.png)

### 安装 elment-plus
```js
npm install element-plus --save
//装相关依赖
```

之后在 vue @/src/main.js 中全局注册 element-plus

```js
import Element from "element-plus"
import * as ElementPlusIconsVue from "@element-plus/icons-vue";  
import "element-plus/dist/index.css";
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {  
  app.component(key, component);  
}  
app.use(ElementPlus).use(router).use(pinia);

```
同时注册到全局 app 中,这边我同时还注册了 element-icon,方便项目能够使用.😍

### tailwindcss 安装使用
```js
npm install -D tailwindcss
npx tailwindcss init
```

在项目根目录下创建 tailwindcss.config.js 文件,写入如下配置.
```js
/** @type {import('tailwindcss').Config} */  
module.exports = {  
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],  
  theme: {  
    extend: {},  
  },  
  plugins: [],  
};
```

在 src 下创建 tailwind.css 文件写入如下
```js
@tailwind base;
@tailwind components;
@tailwind utilities;
```

之后在 main.js 再次全局导入
```js
import "./tailwind.css";
```

这样就算导入完成了.这样三个都已经安装配置完成,就可以很开心的使用.

完整的 main.js
```js
import "./tailwind.css";  
import ElementPlus from "element-plus";  
  
import { createApp } from "vue";  
import App from "./App.vue";  
import * as ElementPlusIconsVue from "@element-plus/icons-vue";  
import "element-plus/dist/index.css";  
import { createPinia } from "pinia";  
import { router } from "./router";  
  
const app = createApp(App);  
const pinia = createPinia();  
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {  
  app.component(key, component);  
}  
app.use(ElementPlus).use(router).use(pinia);  
app.mount("#app");
```

>说实话一个小项目我用的到的轮子,还挺多 route,pinia 啥的都有涉及,axios 二次封装其实我也涉及到一点,后续看情况再更新把

> 感觉这个轮子,对后端开发来说,还是很方便的,写完一个两三页面加一些接口,直接用 vue build 丢在服务器上很爽.后续会更新一些 vue 后端新手开发的坑,感觉现在网上还是 vue 2 用的比较多,大家好像都对 vue 3 选项式 api 开发很少,我自己反而写前端很爱选项式 api 的风格,但是网上大家还都是停留在组合式 api