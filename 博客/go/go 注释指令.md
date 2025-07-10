---
categories: [go]
cover: https://source.wjwsm.top/epic_samurai_art-wallpaper-4320x1800.jpg
title: go 注释指令
date: 2024-11-16
updated: 2024-11-16
---
# go 注释指令
# 了解 go 注释指令
最近一直在看一个开源项目的源代码,看到类似 go build 和 go embed 注释指令,在一些场景下的使用,做个记录. 
##  注释指令
Go 编译器或工具链会解析某些特定格式的注释，这些注释以 `//go:` 开头，称为 **指令注释**，用于控制编译器行为或工具生成。

下面就让我们举两个例子来了解一下

#  go embed
`embed` 是 Go 语言自 1.16 版本引入的功能，用于将静态文件（如 HTML、CSS、图片、JSON 文件等）直接嵌入到 Go 程序的二进制文件中。它可以让程序无需依赖外部文件，方便分发和部署。

这个指令可以让我们的后端项目直接内嵌前端 dist 目录,一切丢给服务器进行部署,非常的方便!!!

## **1. 嵌入单个文件**

将文件嵌入到字符串或字节切片中：

```go

package main

import (
    _ "embed"
    "fmt"
)

//go:embed hello.txt
var content string

func main() {
    fmt.Println(content)
}


```


- **注释指令 `//go:embed`**：指定要嵌入的文件路径。
- **变量声明**：支持 `string` 或 `[]byte` 类型。
- 示例中，`hello.txt` 文件的内容会嵌入到 `content` 变量中。

---

## **2. 嵌入多个文件**

将多个文件嵌入到 `fs.FS` 类型中，便于按路径访问。

```go
package main

import (
    "embed"
    "fmt"
    "io/fs"
)

//go:embed static/*
var staticFiles embed.FS

func main() {
    // 读取嵌入文件内容
    data, _ := staticFiles.ReadFile("static/example.txt")
    fmt.Println(string(data))
}

```

- **多文件模式**：使用 `*` 或 `**` 匹配多个文件。
- **`embed.FS` 类型**：提供文件系统类似的接口，用于读取嵌入文件的内容。

---

#### **3. 嵌入目录**

嵌入一个完整的目录（包括子目录），常用于嵌入 web 应用的静态资源。

```go
package main

import (
    "embed"
    "fmt"
    "io/fs"
    "github.com/gin-gonic/gin"
)

//go:embed static/*
var staticFiles embed.FS



func NewFileSystem() http.FileSystem {  
var files embed.FS  
subfs, _ := fs.Sub(files, "dist")  
return http.FS(subfs)


func RegisterWebStatick(e *gin.Engine) {  
    routeWebStatic(e, "/", "/index.html", "/favicon.ico", "/logo.png", "/sw.js", "/manifest.json", "/assets/*filepath")  
}  
  
func routeWebStatic(e *gin.Engine, paths ...string) {  
    staticHandler := http.FileServer(NewFileSystem())  
    handler := func(c *gin.Context) {  
       staticHandler.ServeHTTP(c.Writer, c.Request)  
    }  
    for _, path := range paths {  
       e.GET(path, handler)  
       e.HEAD(path, handler)  
    }  
}

```

- **文件服务**：将嵌入的文件直接作为 HTTP 文件服务提供。这里我直接将打包好的前端代码直接内嵌到打包好的可执行文件里

---

## **限制和注意事项**

1. **文件大小限制**：
    
    - 嵌入的文件会直接存储在二进制文件中，大量嵌入文件会显著增大程序的体积。
2. **路径相对性**：
    
    - 文件路径是相对于当前包的，因此需要注意目录结构。
3. **编译时决定**：
    
    - 嵌入的文件内容在编译时被固定，无法在运行时动态更新。
4. **不支持符号链接**：
    
    - 如果嵌入的文件是符号链接，Go 不会解析它，而是报错。

---

## **适用场景**

1. **嵌入前端资源**：
    - 在构建 web 应用时，嵌入 HTML、CSS、JavaScript 文件。
2. **嵌入配置文件**：
    - CLI 工具或微服务嵌入默认配置。
3. **嵌入模板**：
    - 嵌入用于渲染的模板文件（如 text/template、html/template）。
4. **嵌入证书或密钥**：
    - 嵌入 CA 证书、私钥等文件，简化安全配置。

#  **go build 构建约束**
Go1.17 的一个新特性：构建约束 — Build Constraints。

##  基本格式
```go
// +build [条件]

```

或者从 Go 1.17 开始的推荐格式：

```go
//go:build [条件]

```

两个格式可以共存，但 **`//go:build`** 会更优先被解析。注意 `//` 和 go 之间不能有空格。

## 位置
- 必须在文件的第一行或 `package` 声明之前。
- 可以有多行注释指令，但它们之间不能有空行

```go
// +build linux darwin

package main

import "fmt"

func main() {
    fmt.Println("This code is for Linux and macOS.")
}

```

## 针对特定平台编译

仅在 Linux 下编译：

```go
//go:build linux
// +build linux

package main

func main() {
    println("This code is for Linux only.")
}

```

### 组合条件

**适用于 Linux 和 macOS：**

```go
//go:build linux || darwin
// +build linux darwin

package main

func main() {
    println("This code is for Linux or macOS.")
}

```

### 排除条件

**排除 Windows：**

```go
//go:build !windows
// +build !windows

package main

func main() {
    println("This code is for non-Windows systems.")
}
```

### 条件语法

1. **逻辑运算符**
    
    - `||`（逻辑或）：至少一个条件为真。
    - `&&`（逻辑与）：所有条件为真。
    - `!`（逻辑非）：条件为假。
2. **平台和架构条件**
    
    - 可以指定操作系统、处理器架构。
    - 常用的操作系统：`linux`, `darwin`, `windows`, `freebsd`, 等。
    - 常用的架构：`amd64`, `arm64`, `386`, `arm`, 等。

## -tag build 
- 通过 `go build -tags <tag>`，可以手动指定一个或多个标签来满足 Build Constraints。
- 只有文件头部的 `+build` 或 `//go:build` 标签匹配时，文件才会被编译并包含在最终的二进制文件中。
例如： 文件 `example.go` 中：
```go
//go:build custom
// +build custom

package main

func main() {
    println("Custom build triggered!")
}
```

在命令行中运行：
```bash
go build -tags custom

```

这会编译并包含 `example.go` 文件的代码；如果不指定 `-tags custom`，这个文件会被忽略。

## . **文件是否被打包的规则**

文件是否被打包完全取决于是否符合以下条件：

- **标签匹配**：标签需要满足指定的 Build Constraints。
- **平台/架构匹配**：如果是特定平台/架构的文件（如 `*_linux.go`），它只会在相应环境下或通过交叉编译时打包。
- **显式触发**：通过 `-tags` 明确指定标签后，文件会被包含。
### 总结

- **默认条件不满足**：文件不会被编译，也不会被打包。
- **手动触发 (`-tags`)**：可以强制编译并打包这些文件。
- **场景控制**：标签与平台、架构组合使用，可以实现灵活的代码构建控制。

