---
cover:
categories: go日志
created: 2023-10-30 11:52
title: zap 介绍与使用
updated: 2023-10-30 11:53
tags: [Go]
aliases: [zap 介绍与使用]
linter-yaml-title-alias: zap 介绍与使用
---
# zap 介绍与使用

zap 是 go 中非常快,结构化的,分日志级别的日志库

# 1.1.1 为什么选择 zap
+ - 它同时提供了结构化日志记录和 printf 风格的日志记录
+ - 它非常的快

记录一条消息和10个字段:

![Pasted image 20231030230507](https://source.wjwsm.top/Pasted%20image%2020231030230507.png)

记录一个静态字符串，没有任何上下文或 printf 风格的模板：

![Pasted image 20231030230525](https://source.wjwsm.top/Pasted%20image%2020231030230525.png)


# 1.1.2 安装
运行 go 命令来安装 zap
```shell
go get -u go.uber.org/zap
```

# 1.1.3 配置 zap Logger

Zap 提供了两种类型的日志记录器—Sugared Logger 和 Logger。

在性能很好但不是很关键的上下文中，使用SugaredLogger。它比其他结构化日志记录包快4-10倍，并且支持结构化和printf风格的日志记录。

在每一微秒和每一次内存分配都很重要的上下文中，使用 Logger。它甚至比 SugaredLogger 更快，内存分配次数也更少，但它只支持强类型的结构化日志记录。

## 1.1.3.1 Logger
- 通过调用 zap.NewProduction()/zap.NewDevelopment()或者 zap.Example()创建一个 Logger。
- 上面的每一个函数都将创建一个logger。唯一的区别在于它将记录的信息不同。例如production logger默认记录调用函数信息、日期和时间等。
- 通过Logger调用Info/Error等。
+ 默认情况下日志都会打印到应用程序的 console 界面。

```go
package main

import (
    "net/http"

    "go.uber.org/zap"
)

var logger *zap.Logger

func main() {
    InitLogger()
    defer logger.Sync()
    simpleHttpGet("www.5lmh.com")
    simpleHttpGet("http://www.google.com")
}

func InitLogger() {
    logger, _ = zap.NewProduction()
}

func simpleHttpGet(url string) {
    resp, err := http.Get(url)
    if err != nil {
        logger.Error(
            "Error fetching url..",
            zap.String("url", url),
            zap.Error(err))
    } else {
        logger.Info("Success..",
            zap.String("statusCode", resp.Status),
            zap.String("url", url))
        resp.Body.Close()
    }
}
```

在上面的代码中，我们首先创建了一个 Logger，然后使用 Info/ Error 等 Logger 方法记录消息。

日志记录器方法的语法是这样的：

```
   func (log *Logger) MethodXXX(msg string, fields ...Field)
```

> 其中 MethodXXX 是一个可变参数函数，可以是 Info / Error/ Debug / Panic 等。每个方法都接受一个消息字符串和任意数量的 zapcore.Field 场参数。

每个zapcore.Field其实就是一组键值对参数。

我们执行上面的代码会得到如下输出结果：
```json
{"level":"error","ts":1573180648.858149,"caller":"ce2/main.go:25","msg":"Error fetching url..","url":"www.5lmh.com","error":"Get www.5lmh.com: unsupported protocol scheme \"\"","stacktrace":"main.simpleHttpGet\n\te:/goproject/src/github.com/student/log/ce2/main.go:25\nmain.main\n\te:/goproject/src/github.com/student/log/ce2/main.go:14\nruntime.main\n\tE:/go/src/runtime/proc.go:200"}

{"level":"error","ts":1573180669.9273467,"caller":"ce2/main.go:25","msg":"Error fetching url..","url":"http://www.google.com","error":"Get http://www.google.com: dial tcp 31.13.72.54:80: connectex: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond.","stacktrace":"main.simpleHttpGet\n\te:/goproject/src/github.com/student/log/ce2/main.go:25\nmain.main\n\te:/goproject/src/github.com/student/log/ce2/main.go:15\nruntime.main\n\tE:/go/src/runtime/proc.go:200"}
```
## 1.1.3.2 Sugared Logger
现在让我们使用 Sugared Logger 来实现相同的功能。

- 大部分的实现基本都相同。
- 惟一的区别是，我们通过调用主logger的. Sugar()方法来获取一个SugaredLogger。
- 然后使用SugaredLogger以printf格式记录语句

下面是修改过后使用 SugaredLogger 代替 Logger 的代码：

```go
package main

import (
    "net/http"

    "go.uber.org/zap"
)

var sugarLogger *zap.SugaredLogger

func main() {
    InitLogger()
    defer sugarLogger.Sync()
    simpleHttpGet("www.5lmh.com")
    simpleHttpGet("http://www.google.com")
}

func InitLogger() {
    logger, _ := zap.NewProduction()
    sugarLogger = logger.Sugar()
}

func simpleHttpGet(url string) {
    sugarLogger.Debugf("Trying to hit GET request for %s", url)
    resp, err := http.Get(url)
    if err != nil {
        sugarLogger.Errorf("Error fetching URL %s : Error = %s", url, err)
    } else {
        sugarLogger.Infof("Success! statusCode = %s for URL %s", resp.Status, url)
        resp.Body.Close()
    }
}
```
```
```

```json
{"level":"error","ts":1573180998.3522997,"caller":"ce3/main.go:27","msg":"Error fetching URL www.5lmh.com : Error = Get www.5lmh.com: unsupported protocol scheme \"\"","stacktrace":"main.simpleHttpGet\n\te:/goproject/src/github.com/student/log/ce3/main.go:27\nmain.main\n\te:/goproject/src/github.com/student/log/ce3/main.go:14\nruntime.main\n\tE:/go/src/runtime/proc.go:200"}

{"level":"error","ts":1573181019.3677258,"caller":"ce3/main.go:27","msg":"Error fetching URL http://www.google.com : Error = Get http://www.google.com: dial tcp 67.228.37.26:80: connectex: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond.","stacktrace":"main.simpleHttpGet\n\te:/goproject/src/github.com/student/log/ce3/main.go:27\nmain.main\n\te:/goproject/src/github.com/student/log/ce3/main.go:15\nruntime.main\n\tE:/go/src/runtime/proc.go:200"}
```

你应该注意到的了，到目前为止这两个 logger 都打印输出 JSON 结构格式。

在本博客的后面部分，我们将更详细地讨论 SugaredLogger，并了解如何进一步配置它。

# 1.1.4 定制 logger
#### 将日志写入文件而不是终端

- 我们要做的第一个更改是把日志写入文件，而不是打印到应用程序控制台。

```
 func New(core zapcore.Core, options ...Option) *Logger
```

zapcore.Core 需要三个配置——Encoder，WriteSyncer，LogLevel。

1. Encoder:编码器(如何写入日志)。我们将使用开箱即用的 NewJSONEncoder()，并使用预先设置的 ProductionEncoderConfig()。

```
 zapcore.NewJSONEncoder(zap.NewProductionEncoderConfig())
```

2. WriterSyncer ：指定日志将写到哪里去。我们使用 zapcore.AddSync()函数并且将打开的文件句柄传进去。
```
   file, _ := os.Create("./test.log")
   writeSyncer := zapcore.AddSync(file)
```

3. Log Level：哪种级别的日志将被写入。
   
   我们将修改上述部分中的Logger代码，并重写InitLogger()方法。其余方法—main() /SimpleHttpGet()保持不变。

```go
package main

import (
    "net/http"
    "os"

    "go.uber.org/zap"
    "go.uber.org/zap/zapcore"
)

var sugarLogger *zap.SugaredLogger

func main() {
    InitLogger()
    defer sugarLogger.Sync()
    simpleHttpGet("www.5lmh.com")
    simpleHttpGet("http://www.google.com")
}

func InitLogger() {
    writeSyncer := getLogWriter()
    encoder := getEncoder()
    core := zapcore.NewCore(encoder, writeSyncer, zapcore.DebugLevel)

    logger := zap.New(core)
    sugarLogger = logger.Sugar()
}

func getEncoder() zapcore.Encoder {
    return zapcore.NewJSONEncoder(zap.NewProductionEncoderConfig())
}

func getLogWriter() zapcore.WriteSyncer {
    //如果想要追加写入可以查看我的博客文件操作那一章
    file, _ := os.Create("./test.log")
    return zapcore.AddSync(file)
}

func simpleHttpGet(url string) {
    sugarLogger.Debugf("Trying to hit GET request for %s", url)
    resp, err := http.Get(url)
    if err != nil {
        sugarLogger.Errorf("Error fetching URL %s : Error = %s", url, err)
    } else {
        sugarLogger.Infof("Success! statusCode = %s for URL %s", resp.Status, url)
        resp.Body.Close()
    }
}
```

当使用这些修改过的 logger 配置调用上述部分的 main()函数时，以下输出将打印在文件——test.log 中。

```json
{"level":"debug","ts":1573181732.5292294,"msg":"Trying to hit GET request for www.5lmh.com"}
{"level":"error","ts":1573181732.5292294,"msg":"Error fetching URL www.5lmh.com : Error = Get www.5lmh.com: unsupported protocol scheme \"\""}
{"level":"debug","ts":1573181732.5292294,"msg":"Trying to hit GET request for http://www.google.com"}
{"level":"error","ts":1573181753.564804,"msg":"Error fetching URL http://www.google.com : Error = Get http://www.google.com: dial tcp 66.220.149.32:80: connectex: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond."}
```

#### 将 JSON Encoder 更改为普通的 Log Encoder
现在，我们希望将编码器从 JSON Encoder 更改为普通 Encoder。为此，我们需要将 NewJSONEncoder()更改为 NewConsoleEncoder()。

```
return zapcore.NewConsoleEncoder(zap.NewProductionEncoderConfig())
```

当使用这些修改过的 logger 配置调用上述部分的 main()函数时，以下输出将打印在文件——test.log 中。

```
1.573181811861697e+09    debug    Trying to hit GET request for www.5lmh.com
1.5731818118626883e+09    error    Error fetching URL www.5lmh.com : Error = Get www.5lmh.com: unsupported protocol scheme ""
1.5731818118626883e+09    debug    Trying to hit GET request for http://www.google.com
1.5731818329012108e+09    error    Error fetching URL http://www.google.com : Error = Get http://www.google.com: dial tcp 216.58.200.228:80: connectex: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond.
```

#### 更改时间编码并添加调用者详细信息
鉴于我们对配置所做的更改，有下面两个问题：

- 时间是以非人类可读的方式展示，例如1.572161051846623e+09
- 调用方函数的详细信息没有显示在日志中 我们要做的第一件事是覆盖默认的ProductionConfig()，并进行以下更改:

修改时间编码器

- 在日志文件中使用大写字母记录日志级别

```go
func getEncoder() zapcore.Encoder {
    encoderConfig := zap.NewProductionEncoderConfig()
    encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
    encoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder
    return zapcore.NewConsoleEncoder(encoderConfig)
}
```

接下来，我们将修改 zap logger 代码，添加将调用函数信息记录到日志中的功能。为此，我们将在 zap.New(..)函数中添加一个 Option。

```
    logger := zap.New(core, zap.AddCaller())
```



# 生产环境一个实例

```go
package core

import (
	"fmt"
	"os"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"main.go/global"
	"main.go/utils"
)

func Zap() (logger *zap.Logger) {
	if ok, _ := utils.PathExists(global.GVA_CONFIG.Zap.Director); !ok { // 判断是否有Director文件夹
		fmt.Printf("create %v directory\n", global.GVA_CONFIG.Zap.Director)
		_ = os.Mkdir(global.GVA_CONFIG.Zap.Director, os.ModePerm)
	}
	// 调试级别
	debugPriority := zap.LevelEnablerFunc(func(lev zapcore.Level) bool {
		return lev == zap.DebugLevel
	})
	// 日志级别
	infoPriority := zap.LevelEnablerFunc(func(lev zapcore.Level) bool {
		return lev == zap.InfoLevel
	})
	// 警告级别
	warnPriority := zap.LevelEnablerFunc(func(lev zapcore.Level) bool {
		return lev == zap.WarnLevel
	})
	// 错误级别
	errorPriority := zap.LevelEnablerFunc(func(lev zapcore.Level) bool {
		return lev >= zap.ErrorLevel
	})

	cores := [...]zapcore.Core{
		getEncoderCore(fmt.Sprintf("./%s/server_debug.log", global.GVA_CONFIG.Zap.Director), debugPriority),
		getEncoderCore(fmt.Sprintf("./%s/server_info.log", global.GVA_CONFIG.Zap.Director), infoPriority),
		getEncoderCore(fmt.Sprintf("./%s/server_warn.log", global.GVA_CONFIG.Zap.Director), warnPriority),
		getEncoderCore(fmt.Sprintf("./%s/server_error.log", global.GVA_CONFIG.Zap.Director), errorPriority),
	}
	logger = zap.New(zapcore.NewTee(cores[:]...), zap.AddCaller())

	if global.GVA_CONFIG.Zap.ShowLine {
		logger = logger.WithOptions(zap.AddCaller())
	}
	return logger
}

// getEncoderConfig 获取zapcore.EncoderConfig
func getEncoderConfig() (config zapcore.EncoderConfig) {
	config = zapcore.EncoderConfig{
		MessageKey:     "message",
		LevelKey:       "level",
		TimeKey:        "time",
		NameKey:        "logger",
		CallerKey:      "caller",
		StacktraceKey:  global.GVA_CONFIG.Zap.StacktraceKey,
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.LowercaseLevelEncoder,
		EncodeTime:     CustomTimeEncoder,
		EncodeDuration: zapcore.SecondsDurationEncoder,
		EncodeCaller:   zapcore.FullCallerEncoder,
	}
	switch {
	case global.GVA_CONFIG.Zap.EncodeLevel == "LowercaseLevelEncoder": // 小写编码器(默认)
		config.EncodeLevel = zapcore.LowercaseLevelEncoder
	case global.GVA_CONFIG.Zap.EncodeLevel == "LowercaseColorLevelEncoder": // 小写编码器带颜色
		config.EncodeLevel = zapcore.LowercaseColorLevelEncoder
	case global.GVA_CONFIG.Zap.EncodeLevel == "CapitalLevelEncoder": // 大写编码器
		config.EncodeLevel = zapcore.CapitalLevelEncoder
	case global.GVA_CONFIG.Zap.EncodeLevel == "CapitalColorLevelEncoder": // 大写编码器带颜色
		config.EncodeLevel = zapcore.CapitalColorLevelEncoder
	default:
		config.EncodeLevel = zapcore.LowercaseLevelEncoder
	}
	return config
}

// getEncoder 获取zapcore.Encoder
func getEncoder() zapcore.Encoder {
	if global.GVA_CONFIG.Zap.Format == "json" {
		return zapcore.NewJSONEncoder(getEncoderConfig())
	}
	return zapcore.NewConsoleEncoder(getEncoderConfig())
}

// getEncoderCore 获取Encoder的zapcore.Core
func getEncoderCore(fileName string, level zapcore.LevelEnabler) (core zapcore.Core) {
	writer := utils.GetWriteSyncer(fileName) // 使用file-rotatelogs进行日志分割
	return zapcore.NewCore(getEncoder(), writer, level)
}

// 自定义日志输出时间格式
func CustomTimeEncoder(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
	enc.AppendString(t.Format(global.GVA_CONFIG.Zap.Prefix + "2006/01/02 - 15:04:05.000"))
}
```

```go
		global.GVA_LOG.Error("查询失败!", zap.Error(err))

```

```
[newbee_mall]2023/10/22 - 13:40:55.141	[31merror[0m	F:/my_newbee_mall_go/api/v1/mall/mall_index.go:18	轮播图获取失败Error 1064: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'des LIMIT 5' at line 1	{"error": "Error 1064: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'des LIMIT 5' at line 1"}

```

参考资料: [https://www.topgoer.com/%E9%A1%B9%E7%9B%AE/log/ZapLogger.html](https://www.topgoer.com/%E9%A1%B9%E7%9B%AE/log/ZapLogger.html)



