---
categories: []
cover: 
title: aiohttp使用
date: 2024-06-25
updated: 2024-06-25
number headings: auto, first-level 1, max 6, 1.1
---
# 1 aiohttp使用


# 2 介绍：

 `asyncio`可以实现单线程并发IO操作。如果仅用在客户端，发挥的威力不大。如果把`asyncio`用在服务器端，例如Web服务器，由于HTTP连接就是IO操作，因此可以用单线程+`coroutine`实现多用户的高并发支持。`asyncio`实现了TCP、UDP、SSL等协议，`aiohttp`则是基于`asyncio`实现的HTTP框架

[学习网址](https://www.cntofu.com/book/127/aiohttp%E6%96%87%E6%A1%A3/Introduce.md)

aiohttp是一个为Python提供异步HTTP 客户端/服务端编程，基于[asyncio(Python用于支持异步编程的标准库)](https://aiohttp.readthedocs.io/en/stable/glossary.html#term-asyncio) 的异步库。

# 3 核心功能:

- 同时支持[客户端使用](https://aiohttp.readthedocs.io/en/stable/client.html#aiohttp-client) 和[服务端使用](https://aiohttp.readthedocs.io/en/stable/web.html#aiohttp-web) 。
- 同时支持[服务端WebSockets组件](https://aiohttp.readthedocs.io/en/stable/web.html#aiohttp-web-websockets) 和[客户端WebSockets组件](https://aiohttp.readthedocs.io/en/stable/client.html#aiohttp-client-websockets) ，开箱即用呦。
- web服务器具有[中间件](https://aiohttp.readthedocs.io/en/stable/web.html#aiohttp-web-middlewares) ，[信号组件](https://aiohttp.readthedocs.io/en/stable/web.html#aiohttp-web-signals) 和可插拔路由的功能。

我们先安装`aiohttp`：

```
pip install aiohttp
```

然后编写一个HTTP服务器，分别处理以下URL：

- `/` - 首页返回`b'<h1>Index</h1>'`；
  
- `/hello/{name}` - 根据URL参数返回文本`hello, %s!`
  
- 代码如下
  
    ```
    import asyncio
    
    from aiohttp import web
    
    async def index(request):
        await asyncio.sleep(0.5)
        return web.Response(body=b'<h1>Index</h1>')
    
    async def hello(request):
        await asyncio.sleep(0.5)
        text = '<h1>hello, %s!</h1>' % request.match_info['name']
        return web.Response(body=text.encode('utf-8'))
    
    async def init(loop):
        #创建一个服务端应用
        app = web.Application(loop=loop)
        #绑定视图函数
        app.router.add_route('GET', '/', index)
        app.router.add_route('GET', '/hello/{name}', hello)
        #创建服务
        srv = await loop.create_server(app.make_handler(), '127.0.0.1', 8000)
        print('Server started at http://127.0.0.1:8000...')
        return srv
    
    loop = asyncio.get_event_loop()
    #其实init本身就是一个协程，注册到事件循环中
    loop.run_until_complete(init(loop))
    loop.run_forever()
    ```
    
    注意`aiohttp`的初始化函数`init()`也是一个`coroutine`，`loop.create_server()`则利用`asyncio`创建TCP服务。
    

# 4 快速开始:

- 客户端例子:
  
    ```
    import asyncio
    import async_timeout
    
    async def fetch(session, url):
        with async_timeout.timeout(10):
            async with session.get(url) as response:
                #返回 访问到的页面
                return await response.text()
    
    async def main():
        #使用ClientSession创建一个连接对象session
        async with aiohttp.ClientSession() as session:
            #将连接对象和网址传入
            # html = await fetch(session, 'http://python.org')  #访问python官网
            html = await fetch(session, 'http://127.0.0.1:8080/')  #访问python官网
            # 答应拿到的html页面
            print(html)
    
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
    loop.run_until_complete(main())
    ```
    
- 服务端例子:
  
    ```
    from aiohttp import web
    
    async def handle(request):
        # 这里的name，就是路径中传入的name，没有就使用Anonymous
        name = request.match_info.get('name', "Anonymous")
        text = "Hello, " + name
        return web.Response(text=text)
    
    app = web.Application()
    app.router.add_get('/', handle)
    # 绑定路径和处理的视图函数
    app.router.add_get('/{name}', handle)
    
    web.run_app(app)
    ```
    
- 注意：不同版本Python的支持
  
    ```
    这篇文档的所有例子都是利用 async/await 语法来完成的，此语法介绍请看PEP 492，此语法仅Python 3.5+有效。 如果你使用的是Python 3.4, 请将await替换成yield from，将async 替换成带有 @corotine装饰器的def. 比如:
    
    async def coro(...):
        ret = await f()
    应替换为:
    
    @asyncio.coroutine
    def coro(...):
       ret = yield from f()
    ```
    

# 5 aiohttp客户端的使用

**发起请求：**让我们从导入aiohttp模块开始:

- 代码示例：
  
    ```
    import aiohttp
    import asyncio
    import async_timeout
    
    async def fetch(session,url):
        with async_timeout.timeout(10):
            async with session.get(url) as resp:
                return await resp.text()
    
    async def main():
        async with aiohttp.ClientSession() as session:
            html = await fetch(session,'https://api.github.com/events')
            print(html)
    
    
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
    loop.run_until_complete(main())
    	#需要注意的是：我们现在用的session不是我们后端框架的session，它表示一次会话，由ClientSession对象赋值而来，还有一个变量resp，它其实是ClientResponse对象。
    	# 我们可以从这个响应对象中获取我们任何想要的信息。协程方法ClientSession.get()的主要参数接受一个HTTP URL
    ```
    
- ## 发起post请求以及其他请求：
  
    ```
    session.post('http://httpbin.org/post', data=b'data') #将代码修改为
    
    session.put('http://httpbin.org/put', data=b'data')
    session.delete('http://httpbin.org/delete')
    session.head('http://httpbin.org/get')
    session.options('http://httpbin.org/get')
    session.patch('http://httpbin.org/patch', data=b'data')
    ```
    

## 5.1 发起JSON请求

每个会话的请求方法都可接受json参数

- 代码如下：修改上面部分代码
  
    ```
    async with aiohttp.ClientSession() as session:
        async with session.post(json={'test': 'object'})
    ```
    

## 5.2 URL传参

 你可能经常想在URL中发送一系列的查询信息。如果你手动构建他们，这些信息会以键值对的形式出现在?后面，比如: `httpbin.org/get?key=val`。请求对象允许你使用**dict（字典，python中的数据类型）**发送它们，使用`params`参数即可。例如: 如果你要把 `key1=value1，key2=value2`放到`httpbin.org/get`后面，你可以用下面的方式:

```
params = {'key1': 'value1', 'key2': 'value2'}
async with session.get('http://httpbin.org/get',
                       params=params) as resp:
    assert str(resp.url) == 'http://httpbin.org/get?key2=value2&key1=value1'
```

看URL已经被正确的编码啦。 同键不同值的**并联字典（MultiDict） **也同样支持。 可使用带有两个tuples(元组，python中的数据类型)的list(列表，python中的数据类型)来构建:

```
params = [('key', 'value1'), ('key', 'value2')]
async with session.get('http://httpbin.org/get',
                       params=params) as r:
    assert str(r.url) == 'http://httpbin.org/get?key=value2&key=value1'
```

**警告:**传递_params_时不要用`encode=True`，这俩参数不能同时使用。

## 5.3 获取响应内容

我们可以读取服务器的响应内容。想想我们获取GitHub时间轴的例子:

```
import aiohttp
import asyncio
async def main():
    async with aiohttp.ClientSession() as session:
        async with session.get('https://api.github.com/events') as resp:
           print(await resp.text())


loop = asyncio.get_event_loop()
loop.run_until_complete(main())
loop.run_until_complete(main())
```

这样会打印出类似于下面的信息:

```
'[{"created_at":"2015-06-12T14:06:22Z","public":true,"actor":{...
```

`aiohttp`将会自动解码内容。你可以为**text**()方法指定编码(使用encoding参数):

```
await resp.text(encoding='windows-1251')
```

## 5.4 获取二进制响应内容

你也可以以字节形式获取响应，这样得到的就不是文本了:可以获取字节流

```
print(await resp.read())
b'[{"created_at":"2015-06-12T14:06:22Z","public":true,"actor":{...
```

`gzip`和`defalte`传输编码会自动解码。 你也可以使其支持`brotli`传输编码的解码，只需安装[brotlipy](https://github.com/python-hyper/brotlipy) 即可。

## 5.5 获取JSON响应内容

以防你需要处理JSON数据，内置了一个JSON解码器:

```
async with session.get('https://api.github.com/events') as resp:
    print(await resp.json())  #直接给你反序列化
```

如果JSON解码失败，**json**()方法将会抛出一个异常。你还可以在调用**json**()时指定编码器和解码器函数。

**注意:**这些方法会读出内存中所有响应的内容。如果你要读非常多的数据，考虑使用流式响应方法进行读取。请看之后的文档。

## 5.6 获取流式响应内容

 **read**(), **json**(), **text**()等方法使用起来很方便，但也要注意谨慎地使用。上述方法会将所有的响应内容加载到内存。举个例子，如果你要下载几个G的文件，这些方法还是会将所有内容都加载到内存，内存会表示"臣妾做不到啊~"(如果内存不够的话)。作为代替你可以用**content**属性。content其实是 **aiohttp.StreamReader**类的实例。`gzip`和`deflate`传输编码同样会自动解码。

```
async with session.get('https://api.github.com/events') as resp:
    await resp.content.read(10)
```

一般情况下你可以使用下列模式将内容保存在一个文件中:

```
with open(filename, 'wb') as fd:
    while True:
        chunk = await resp.content.read(chunk_size)
        if not chunk:
            break
        fd.write(chunk)
```

在使用**content**读了数据后，就不要在用**read**(), **json**(), **text**()了。

## 5.7 获取请求信息

_ClientResponse（客户端响应）对象含有request_info(请求信息)，主要是url_和_headers_信息。 _raise_for_status_结构体上的信息会被复制给ClientResponseError实例。

## 5.8 自定义Headers

如果你需要给某个请求添加HTTP头,可以使用headers参数，传递一个**dict**对象即可。 比如，如果你想给之前的例子指定 content-type可以这样:

```
import json
url = 'https://api.github.com/some/endpoint'
payload = {'some': 'data'}
headers = {'content-type': 'application/json'}

await session.post(url,
                   data=json.dumps(payload),
                   headers=headers)
```

## 5.9 自定义Cookies

发送你自己的cookies给服务器，你可以为**ClientSession**对象指定_cookies_参数:

```
url = 'http://httpbin.org/cookies'
cookies = {'cookies_are': 'working'}
async with ClientSession(cookies=cookies) as session:
    async with session.get(url) as resp:
        assert await resp.json() == {
           "cookies": {"cookies_are": "working"}}
```

**注意:**访问`httpbin.org/cookies` 会看到以JSON形式返回的cookies。查阅会话中的cookies请看[ClientSession.cookie_jar](https://aiohttp.readthedocs.io/en/stable/client_reference.html#aiohttp.ClientSession.cookie_jar) 。

## 5.10 发起更复杂的POST请求

一般来说，如果你想以表单形式发送一些数据 - 就像HTML表单。那么只需要简单的将一个dict通过_data_参数传递就可以。传递的dict数据会自动编码:

```
payload = {'key1': 'value1', 'key2': 'value2'}
async with session.post('http://httpbin.org/post',
                        data=payload) as resp:
    print(await resp.text())
{
  ...
  "form": {
    "key2": "value2",
    "key1": "value1"
  },
  ...
}
```

如果你想发送非表单形式的数据你可用`str(字符串)`代替`dict(字典)`。这些数据会直接发送出去。 例如，GitHub API v3 接受JSON编码POST/PATCH数据:

```
import json
url = 'https://api.github.com/some/endpoint'
payload = {'some': 'data'}

async with session.post(url, data=json.dumps(payload)) as resp:
    ...
```

## 5.11 发送多部分编码文件(Multipart-Encoded)

上传多部分编码文件:

```
url = 'http://httpbin.org/post'
files = {'file': open('report.xls', 'rb')}

await session.post(url, data=files)
```

你也可以显式地设置文件名，文件类型:

```
url = 'http://httpbin.org/post'
data = FormData()
data.add_field('file',
               open('report.xls', 'rb'),
               filename='report.xls',
               content_type='application/vnd.ms-excel')

await session.post(url, data=data)
```

如果你把一个文件对象传递给data参数，aiohttp会自动将其以流的形式上传。查看**StreamReader**以获取支持的格式信息。

**参见:**使用Multipart.](https://aiohttp.readthedocs.io/en/stable/multipart.html#aiohttp-multipart)

## 5.12 流式上传

**aiohttp** 支持多种形式的流式上传，允许你直接发送大文件而不必读到内存。

下面是个简单的例子，提供类文件对象即可:

```
with open('massive-body', 'rb') as f:
   await session.post('http://httpbin.org/post', data=f)
```

或者你也可以使用_aiohttp.streamer_对象：

```
@aiohttp.streamer
def file_sender(writer, file_name=None):
    with open(file_name, 'rb') as f:
        chunk = f.read(2**16)
        while chunk:
            yield from writer.write(chunk)
            chunk = f.read(2**16)

# 之后你可以使用’file_sender‘传递给data:

async with session.post('http://httpbin.org/post',
                        data=file_sender(file_name='huge_file')) as resp:
    print(await resp.text())
```

同样可以使用**StreamReader**对象.

我们来看下如何把来自于另一个请求的内容作为文件上传并计算其SHA1值:

```
async def feed_stream(resp, stream):
    h = hashlib.sha256()

    while True:
        chunk = await resp.content.readany()
        if not chunk:
            break
        h.update(chunk)
        stream.feed_data(chunk)

    return h.hexdigest()

resp = session.get('http://httpbin.org/post')
stream = StreamReader()
loop.create_task(session.post('http://httpbin.org/post', data=stream))

file_hash = await feed_stream(resp, stream)
```

因为响应对象的content属性是一个`StreamReader`实例，所以你可以将get和post请求连在一起用:

```
r = await session.get('http://python.org')
await session.post('http://httpbin.org/post',
                   data=r.content)
```

## 5.13 上传预压缩过的数据

上传一个已经压缩过的数据，需要为Headers中的`Content-Encoding`指定算法名(通常是deflate或者是zlib).

```
async def my_coroutine(session, headers, my_data):
    data = zlib.compress(my_data)
    headers = {'Content-Encoding': 'deflate'}
    async with session.post('http://httpbin.org/post',
                            data=data,
                            headers=headers)
        pass
```

## 5.14 持久连接(keep-alive), 连接池和cookies共享

**ClientSession**可以在多个请求之间共享cookies:

```
async with aiohttp.ClientSession() as session:
    await session.get(
        'http://httpbin.org/cookies/set?my_cookie=my_value')
    filtered = session.cookie_jar.filter_cookies('http://httpbin.org')
    assert filtered['my_cookie'].value == 'my_value'
    async with session.get('http://httpbin.org/cookies') as r:
        json_body = await r.json()
        assert json_body['cookies']['my_cookie'] == 'my_value'
```

你也可以为所有的会话请求设置headers:

```
async with aiohttp.ClientSession(
    headers={"Authorization": "Basic bG9naW46cGFzcw=="}) as session:
    async with session.get("http://httpbin.org/headers") as r:
        json_body = await r.json()
        assert json_body['headers']['Authorization'] == \
            'Basic bG9naW46cGFzcw=='
```

**ClientSession**支持持久连接和连接池，可直接使用，不需要额外操作。

## 5.15 安全cookies

**ClientSession**中的默认的**aiohttp.CookiesJar**使用的是严苛模式，[RFC 2109](https://tools.ietf.org/html/rfc2109.html) 明确禁止使用ip地址形式的URL携带cookies信息。比如: _http://127.0.0.1:80/cookie_ 这样很好，不过有些时候我们测试时需要允许携带cookies。在**aiohttp.CookiesJar**中传递_unsafe=True_来实现这一效果:

```
jar = aiohttp.CookieJar(unsafe=True)
session = aiohttp.ClientSession(cookie_jar=jar)
```

## 5.16 使用虚假Cookie Jar

有时不想处理cookie。这时可以在会话中使用**aiohttp.DummyCookieJar**来达到目的。

```
jar = aiohttp.DummyCookieJar()
session = aiohttp.ClientSession(cookie_jar=jar)
```

## 5.17 使用连接器

想要调整请求的传输层你可以为**ClientSession**及其同类组件传递自定义的连接器。例如:

```
conn = aiohttp.TCPConnector()
session = aiohttp.ClientSession(connector=conn)
```

> ### [#](#注解) 注解:

不要给多个会话对象使用同一个连接器，某一会话对象拥有其所有权。

> ### [#](#参见) 参见:

查看[连接器](https://aiohttp.readthedocs.io/en/stable/client_reference.html#aiohttp-client-reference-connectors) 部分了解更多不同的连接器类型和配置选项信息。

## 5.18 限制连接池的容量

限制同一时间打开的连接数可以传递limit参数:

```
conn = aiohttp.TCPConnector(limit=30)
```

这样就将总数限制在30.

默认情况下是100.

如果你不想有限制，传递0即可:

```
conn = aiohttp.TCPConnector(limit=0)
```

限制同一时间在同一个端点((`host`, `port`, `is_ssl`) 3者都一样的情况)打开的连接数可指定limit_per_host参数:

```
conn = aiohttp.TCPConnector(limit_per_host=30)
```

这样会限制在30. 默认情况下是0(也就是不做限制)。

## 5.19 使用自定义域名服务器

底层需要[aiodns](https://aiohttp.readthedocs.io/en/stable/glossary.html#term-aiodns) 支持:

```
from aiohttp.resolver import AsyncResolver

resolver = AsyncResolver(nameservers=["8.8.8.8", "8.8.4.4"])
conn = aiohttp.TCPConnector(resolver=resolver)
```

## 5.20 为TCP sockets添加SSL控制:

默认情况下aiohttp总会对使用了HTTPS协议(的URL请求)查验其身份。但也可将_verify_ssl_设置为`False`让其不检查:

```
r = await session.get('https://example.com', verify_ssl=False)
```

如果你需要设置自定义SSL信息(比如使用自己的证书文件)你可以创建一个**ssl.SSLContext**实例并传递到**ClientSession**中:

```
sslcontext = ssl.create_default_context(
   cafile='/path/to/ca-bundle.crt')
r = await session.get('https://example.com', ssl_context=sslcontext)
```

如果你要验证_自签名_的证书，你也可以用之前的例子做同样的事，但是用的是load_cert_chain():

```
sslcontext = ssl.create_default_context(
   cafile='/path/to/ca-bundle.crt')
sslcontext.load_cert_chain('/path/to/client/public/device.pem',
                           '/path/to/client/private/device.jey')
r = await session.get('https://example.com', ssl_context=sslcontext)
```

SSL验证失败时抛出的错误:

**aiohttp.ClientConnectorSSLError**:

```
try:
    await session.get('https://expired.badssl.com/')
except aiohttp.ClientConnectorSSLError as e:
    assert isinstance(e, ssl.SSLError)
```

**aiohttp.ClientConnectorCertificateError**:

```
try:
    await session.get('https://wrong.host.badssl.com/')
except aiohttp.ClientConnectorCertificateError as e:
    assert isinstance(e, ssl.CertificateError)
```

如果你需要忽略所有SSL的错误:

**aiohttp.ClientSSLError**:

```
try:
    await session.get('https://expired.badssl.com/')
except aiohttp.ClientSSLError as e:
    assert isinstance(e, ssl.SSLError)

try:
    await session.get('https://wrong.host.badssl.com/')
except aiohttp.ClientSSLError as e:
    assert isinstance(e, ssl.CertificateError)
```

你还可以通过_SHA256_指纹验证证书:

```
# Attempt to connect to https://www.python.org
# with a pin to a bogus certificate:
bad_fingerprint = b'0'*64
exc = None
try:
    r = await session.get('https://www.python.org',
                          fingerprint=bad_fingerprint)
except aiohttp.FingerprintMismatch as e:
    exc = e
assert exc is not None
assert exc.expected == bad_fingerprint

# www.python.org cert's actual fingerprint
assert exc.got == b'...'
```

注意这是以DER编码的证书的指纹。如果你的证书是PEM编码，你需要转换成DER格式:

```
openssl x509 -in crt.pem -inform PEM -outform DER > crt.der
```

> ### 注解:

提示: 从16进制数字转换成二进制字节码，你可以用**binascii.unhexlify**().

**TCPConnector**中设置的_verify_ssl, fingerprint和ssl_context_都会被当做默认的verify_ssl, fingerprint和ssl_context，**ClientSession**或其他同类组件中的设置会覆盖默认值。

> ### 警告:

_verify_ssl 和 ssl_context_是_互斥_的。 _MD5_和_SHA1_指纹虽不赞成使用但是是支持的 - 这俩是非常不安全的哈希函数。

## 5.21 Unix 域套接字

如果你的服务器使用UNIX域套接字你可以用**UnixConnector**:

```
conn = aiohttp.UnixConnector(path='/path/to/socket')
session = aiohttp.ClientSession(connector=conn)
```

## 5.22 代理支持

aiohttp 支持 HTTP/HTTPS形式的代理。你需要使用_proxy_参数:

```
async with aiohttp.ClientSession() as session:
    async with session.get("http://python.org",
                           proxy="http://some.proxy.com") as resp:
        print(resp.status)
```

同时支持认证代理:

```
async with aiohttp.ClientSession() as session:
    proxy_auth = aiohttp.BasicAuth('user', 'pass')
    async with session.get("http://python.org",
                           proxy="http://some.proxy.com",
                           proxy_auth=proxy_auth) as resp:
        print(resp.status)
```

也可将代理的验证信息放在url中:

```
session.get("http://python.org",
            proxy="http://user:pass@some.proxy.com")
```

与`requests(另一个广受欢迎的http包)`不同，aiohttp默认不会读取环境变量中的代理值。但你可以通过传递`trust_env=True`来让**aiohttp.ClientSession**读取_HTTP_PROXY_或_HTTPS_PROXY_环境变量中的代理信息(不区分大小写)。

```
async with aiohttp.ClientSession() as session:
    async with session.get("http://python.org", trust_env=True) as resp:
        print(resp.status)
```

## 5.23 查看响应状态码

我们可以查询响应状态码:

```
async with session.get('http://httpbin.org/get') as resp:
    assert resp.status == 200
```

## 5.24 获取响应头信息

我们可以查看服务器的响应信息, **ClientResponse.headers**使用的数据类型是**CIMultiDcitProxy**:

```
>>> resp.headers
{'ACCESS-CONTROL-ALLOW-ORIGIN': '*',
 'CONTENT-TYPE': 'application/json',
 'DATE': 'Tue, 15 Jul 2014 16:49:51 GMT',
 'SERVER': 'gunicorn/18.0',
 'CONTENT-LENGTH': '331',
 'CONNECTION': 'keep-alive'}
```

这是一个特别的字典，它只为HTTP头信息而生。根据 [RFC 7230](http://tools.ietf.org/html/rfc7230#section-3.2) ，HTTP头信息中的名字是不分区大小写的。同时也支持多个不同的值对应同一个键。

所以我们可以通过任意形式访问它:

```
>>> resp.headers['Content-Type']
'application/json'

>>> resp.headers.get('content-type')
'application/json'
```

所有的header信息都是由二进制数据转换而来，使用带有`surrogateescape`选项的UTF-8编码方式(surrogateescape是一种错误处理方式，详情看<a href="https://docs.python.org/3/library/codecs.html#error-handlers" 这里))。大部分时候都可以很好的工作，但如果服务器使用的不是标准编码就不能正常解码了。从 [RFC 7230](http://tools.ietf.org/html/rfc7230#section-3.2) 的角度来看这样的headers并不是合理的格式，你可以用**ClientReponse.resp.raw_headers**来查看原形:

```
>>> resp.raw_headers
((b'SERVER', b'nginx'),
 (b'DATE', b'Sat, 09 Jan 2016 20:28:40 GMT'),
 (b'CONTENT-TYPE', b'text/html; charset=utf-8'),
 (b'CONTENT-LENGTH', b'12150'),
 (b'CONNECTION', b'keep-alive'))
```

## 5.25 获取响应cookies:

如果某响应包含一些Cookies，你可以很容易地访问他们:

```
url = 'http://example.com/some/cookie/setting/url'
async with session.get(url) as resp:
    print(resp.cookies['example_cookie_name'])
```

> ### 注意:

响应中的cookies只包含重定向链中最后一个请求中的`Set-Cookies`头信息设置的值。如果每一次重定向请求都收集一次cookies请使用 [aiohttp.ClientSession](https://aiohttp.readthedocs.io/en/stable/client.html#aiohttp-client-session) 对象.

## 5.26 获取响应历史

如果一个请求被重定向了，你可以用**history**属性查看其之前的响应:

```
>>> resp = await session.get('http://example.com/some/redirect/')
>>> resp
<ClientResponse(http://example.com/some/other/url/) [200]>
>>> resp.history
(<ClientResponse(http://example.com/some/redirect/) [301]>,)
```

如果没有重定向或`allow_redirects`设置为`False`，history会被设置为空。

## 5.27 使用WebSockets

**aiohttp**提供开箱即用的客户端websocket。 你需要使用**aiohttp.ClientSession.ws_connect**()协程对象。它的第一个参数接受URL，返回值是**ClientWebSocketResponse**，这样你就可以用响应的方法与websocket服务器进行通信。

```
session = aiohttp.ClientSession()
async with session.ws_connect('http://example.org/websocket') as ws:

    async for msg in ws:
        if msg.type == aiohttp.WSMsgType.TEXT:
            if msg.data == 'close cmd':
                await ws.close()
                break
            else:
                await ws.send_str(msg.data + '/answer')
        elif msg.type == aiohttp.WSMsgType.CLOSED:
            break
        elif msg.type == aiohttp.WSMsgType.ERROR:
            break
```

你只能使用一种读取方式(例如`await ws.receive()` 或者 `async for msg in ws:`)和写入方法，但可以有多个写入任务，写入任务也是异步完成的(`ws.send_str('data')`)。

## 5.28 设置超时

默认情况下每个IO操作有5分钟超时时间。可以通过给**ClientSession.get**()及其同类组件传递`timeout`来覆盖原超时时间:

```
async with session.get('https://github.com', timeout=60) as r:
    ...
```

`None` 或者`0`则表示不检测超时。 还可通过调用**async_timeout.timeout**上下文管理器来为连接和解析响应内容添加一个总超时时间:

```
import async_timeout

with async_timeout.timeout(0.001):
    async with session.get('https://github.com') as r:
        await r.text()
```

> ### 注意:

超时时间是累计的，包含如发送情况，重定向，响应解析，处理响应等所有操作在内...

## 5.29 愉快地结束:

当一个包含`ClientSession`的`async with`代码块的末尾行结束时(或直接调用了`.close()`)，因为asyncio内部的一些原因底层的连接其实没有关闭。在实际使用中，底层连接需要有一个缓冲时间来关闭。然而，如果事件循环在底层连接关闭之前就结束了，那么会抛出一个 资源警告: 存在未关闭的传输(通道)(`ResourceWarning: unclosed transport`),如果警告可用的话。 为了避免这种情况，在关闭事件循环前加入一小段延迟让底层连接得到关闭的缓冲时间。 对于非SSL的`ClientSession`, 使用0即可(`await asyncio.sleep(0)`):

```
async def read_website():
    async with aiohttp.ClientSession() as session:
        async with session.get('http://example.org/') as response:
            await response.read()

loop = asyncio.get_event_loop()
loop.run_until_complete(read_website())
# Zero-sleep to allow underlying connections to close
loop.run_until_complete(asyncio.sleep(0))
loop.close()
```

对于使用了SSL的`ClientSession`, 需要设置一小段合适的时间:

```
...
# Wait 250 ms for the underlying SSL connections to close
loop.run_until_complete(asyncio.sleep(0.250))
loop.close()
```

合适的时间因应用程序而异。

当asyncio内部的运行机制改变时就可以让aiohttp去等待底层连接关闭在退出啦，上面这种额外的方法总会废弃啦。你也可以跟进问题[#1925](https://github.com/aio-libs/aiohttp/issues/1925) 来参与改进。

---

## 5.30 服务端指南

准备使用aiohttp但不知道如何开始？这里有一些小例子来快速熟悉下。接下来我们一起来试着开发一个小投票系统。如果你想改进或与之对比学习，可以查看demo source 来获取全部源码。

准备好我们的开发环境 首先检查下python版本:

```
$ python -V
Python 3.5.0
```

我们需要python 3.5.0及以上版本。

假设你已经安装好aiohttp库了。你可以用以下命令来查询当前aiohttp库的版本。

```
$ python3 -c 'import aiohttp; print(aiohttp.__version__)'
2.0.5
```

项目结构与其他以python为基础的web项目大同小异:

```
.
├── README.rst
└── polls
    ├── Makefile
    ├── README.rst
    ├── aiohttpdemo_polls
    │   ├── __init__.py
    │   ├── __main__.py
    │   ├── db.py
    │   ├── main.py
    │   ├── routes.py
    │   ├── templates
    │   ├── utils.py
    │   └── views.py
    ├── config
    │   └── polls.yaml
    ├── images
    │   └── example.png
    ├── setup.py
    ├── sql
    │   ├── create_tables.sql
    │   ├── install.sh
    │   └── sample_data.sql
    └── static
        └── style.css
```

## 5.31 开始用aiohttp构建我们的第一个应用程序

该指南借鉴了教科书Django投票系统指南。

## 5.32 创建应用程序

aiohttp的服务端程序都是 `aiohttp.web.Application`实例对象。用于创建信号，连接路由等。

使用下列代码可以创建一个应用程序:

```
from aiohttp import web

app = web.Application()
web.run_app(app, host='127.0.0.1', port=8080)
```

将其保存在`aiohttpdemo_polls/main.py`然后开启服务器: `$ python3 main.py`

你会在命令行中看到如下输出:

```
======== Running on http://127.0.0.1:8080 ========
(Press CTRL+C to quit)
```

在浏览器中打开 http://127.0.0.1:8080 或在命令行中使用`curl`: `$ curl -X GET localhost:8080`

啊咧，出现了404: Not Found. 呃...因为我们并没有创建路由和和展示页面。

## 5.33 创建视图

我们来一起创建第一个展示页面(视图)。我们先创建个文件`aiohttpdemo_polls/views.py`然后写入:

```
from aiohttp import web

async def index(request):
    return web.Response(text='Hello Aiohttp!')
```

`index`就是我们创建的展示页，然后我们创建个路由连接到这个展示页上。我们来把路由放在`aiohttpdemo_polls/routes.py`文件中（将路由表和模型分开写是很好的实践。创建实际项目时可能会有多个同类文件，这样分开放可以让自己很清楚。):

```
from views import index

def setup_routes(app):
    #index是视图函数
    app.router.add_get('/', index)
```

我们还要在`main.py`中调用`setup_routes`。

```
from aiohttp import web
from routes import setup_routes

app = web.Application()
#传入app
setup_routes(app)
web.run_app(app, host='127.0.0.1', port=8080)
```

然后我们重新开启服务器，现在我们从浏览器中访问:

```
$ curl -X GET localhost:8080
Hello Aiohttp!
```

啊哈！成功了！我们现在应该有了一个如下所示的目录结构:

```
.
├── ..
└── polls
    ├── aiohttpdemo_polls
    │   ├── main.py
    │   ├── routes.py
    │   └── views.py
```

## 5.34 使用配置文件

aiohttp不需要任何配置文件，也没有内置支持任何配置架构。 但考虑到这些事实:

1. 99%的服务器都有配置文件。
2. 其他的同类程序(除了以Python为基础的像Django和Flask的)都不会将配置文件作为源码的一部分。 比如Nginx将配置文件保存在 /etc/nginx文件夹里。 mongo则保存在 /etc/mongodb.conf里。
3. 使用配置文件是公认的好方法，在部署产品时可以预防一些小错误。

所以我们建议用以下途径(进行配置文件):

1. 将配置信息写在yaml文件中。(json或ini都可以，但yaml最好用。)
2. 在一个预先设定好的目录中加载yaml。
3. 拥有能通过命令行来设置配置文件的功能。如: ./run_app --config=/opt/config/app_cfg.yaml
4. 对要加载的字典执行严格检测，以确保其数据类型符合预期。可以使用: trafaret, colander 或 JSON schema等库。

以下代码会加载配置文件并设置到应用程序中:

```
# load config from yaml file in current dir
conf = load_config(str(pathlib.Path('.') / 'config' / 'polls.yaml'))
app['config'] = conf
```

## 5.35 构建数据库

## 5.36 准备工作

这份指南中我们使用最新版的`PostgreSQL`数据库。 你可访问以下链接下载: http://www.postgresql.org/download/

## 5.37 数据库架构

我们使用`SQLAlchemy`来写数据库架构。我们只要创建两个简单的模块——`question`和`choice`:

```
import sqlalchemy as sa 

meta = sa.MetaData()

question = sq.Table(
    'question', meta,
    sa.Column('id', sa.Integer, nullable=False),
    sa.Column('question_text', sa.String(200), nullable=False),
    sa.Column('pub_date', sa.Date, nullable=False),
    # Indexes #
    sa.PrimaryKeyConstraint('id', name='question_id_pkey')
)

choice = sa.Table(
    'choice', meta,
    sa.Column('id', sa.Integer, nullable=False),
    sa.Column('question_id', sa.Integer, nullable=False),
    sa.Column('choice_text', sa.String(200), nullable=False),
    sa.Column('votes', server_default="0", nullable=False),
    # Indexes #
    sa.PrimayKeyConstraint('id', name='choice_id_pkey'),
    sa.ForeignKeyContraint(['question_id'], [question.c.id],
                            name='choice_question_id_fkey',
                            ondelete='CASCADE'),
)
```

你会看到如下数据库结构:

第一张表 question: |question| |id| |question_text| |pub_date|

第二张表 choice: |choice| |id| |choice_text| |votes| |question_id|

## 5.38 创建连接引擎

为了从数据库中查询数据我们需要一个引擎实例对象。假设`conf`变量是一个带有连接信息的配置字典，`Postgre`s会使用异步的方式完成该操作:

```
async def init_pg(app):
    conf = app['config']
    engine = await aiopg.sa.create_engine(
        database=conf['database'],
        user=conf['user'],
        password=conf['password'],
        host=conf['host'],
        port=conf['host'],
        minsize=conf['minsize'],
        maxsize=conf['maxsize'])

    app['db'] = engine
```

最好将连接数据库的函数放在`on_startup`信号中:

```
app.on_startup.append(init_pg)
```

## 5.39 关闭数据库

程序退出时一块关闭所有的资源接口是一个很好的做法。 使用on_cleanup信号来关闭数据库接口:

```
async def close_pg(app):
    app['db'].close()
    await app['db'].wait_closed()

app.on_cleanup.append(close_pg)
```

## 5.40 使用模板

我们来添加些更有用的页面:

```
@aiohttp_jinja2.template('detail.html')
async def poll(request):
    async with request['db'].acquire() as conn:
        question_id = request.match_info['question_id']
        try:
            question, choices = await db.get_question(conn,
                                                      question_id)
        except db.RecordNotFound as e:
            raise web.HTTPNotFound(text=str(e))
        return {
            'question': question,
            'choices': choices
        }
```

编写页面时使用模板是很方便的。我们返回带有页面内容的字典，`aiohttp_jinja2.template`装饰器会用`jinja2`模板加载它。

当然我们要先安装下`aiohttp_jinja2`:

```
$ pip install aiohttp_jinja2
```

安装完成后我们使用时要适配下:

```
import aiohttp_jinja2
import jinja2

aiohttp_jinja2.setup(
    app, loader=jinja2.PackageLoader('aiohttpdemo_polls', 'templates'))
```

我们将其放在`polls/aiohttpdemo_polls/templates`文件夹中。

## 5.41 静态文件

每个web站点都有一些静态文件: 图片啦，JavaScript，CSS文件啦等等。 在生产环境中处理这些静态文件最好的方法是使用NGINX或CDN服务做反向代理。 但在开发环境中使用aiohttp服务器处理静态文件是很方便的。

只需要简单的调用一个信号即可:

```
app.router.add_static('/static/',
                      path=str(project_root / 'static'),
                      name='static')
```

project_root表示根目录。

## 5.42 使用中间件

中间件是每个web处理器必不可少的组件。它的作用是在处理器处理请求前预处理请求以及在得到响应后发送出去。

我们下面来实现一个用于显示漂亮的404和500页面的简单中间件。

```
def setup_middlewares(app):
    error_middleware = error_pages({404: handle_404,
                                    500: handle_500})
    app.middlewares.append(error_middleware)
```

中间件(middleware)本身是一个接受*应用程序（application）_和_后续处理器（next handler）*的加工厂。

中间件工厂返回一个与web处理器一样接受请求并返回响应的中间件处理器。

下面实现一个用于处理HTTP异常的中间件:

```
def error_pages(overrides):
    async def middleware(app, handler):
        async def middleware_handler(request):
            try:
                response = await handler(request)
                override = overrides.get(response.status)
                if override is None:
                    return response
                else:
                    return await override(request, response)
            except web.HTTPException as ex:
                override = overrides.get(ex.status)
                if override is None:
                    raise
                else:
                    return await override(request, ex)
        return middleware_handler
    return middleware
```

这些`overrides（handle_404和handle_500）`只是简单的用`Jinja2`模板渲染:

```
async def handle_404(request, response):
    response = aiohttp_jinja2.render_template('404.html',
                                              request,
                                              {})
    return response


async def handle_500(request, response):
    response = aiohttp_jinja2.render_template('500.html',
                                              request,
                                              {})
    return response
```

← [Selenium万能的自动化爬虫](/python/spider/Selenium记录.html) [爬虫面试案例](/python/spider/爬虫面试案例.html) →