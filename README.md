## SwitchToExpress

本项目将基于 Express 从零开始搭建一个功能完备的博客系统

在本节我们主要利用 WebSockets 协议来实现一个基本的聊天室

1. 理解 WebSockets
1. 利用 Socket.IO 来建立连接并创建一个实时聊天室

### 基本构造
1. 理解 WebSockets
1. 建立 WebSockets 连接
1. 实现聊天室的信息流

#### 理解 WebSocket

> WebSockets 是一个可以创建和服务器间进行双向会话的高级技术。 通过这个 API 你可以向服务器发送消息并接受基于事件驱动的响应，这样就不用向服务器轮询获取数据了。 我们可以以此来建立一个持久化的实时连接达到类似数据流一样的效果。

WebSockets 是基于 WS 协议上的一种技术， 而 WS 是基于 TCP 协议之上类似于 HTTP 协议的数据传输协议。 不同的是 HTTP 为单向传输即浏览器只能向服务器请求资源， 服务器才能将数据传送给浏览器， 而服务器不能主动向浏览器传递数据。 就是服务器不能掌握主动性， 而 WS 就是使服务器也具有了主动性。 比如在我们建立好链接后服务器会在浏览器未发生请求时主动给浏览器发送信息， 而且在短时间内服务器可以和浏览器保持持久的会话。

既然 WebSockets 是建立在基础协议之上的技术， 那么在各个平台都有其实现， 这里我们使用 Socket.IO 包来实现。


#### 建立 WebSockets 连接

由于 WebSockets 是浏览器服务器间的双向连接， 所以我们需要在浏览器服务器端分别配置。

首先需要安装 Socket.IO 包， **npm install socket.io -S** , OK， 在 app.js 内简单配置一下。

首先要确定协议的地址端口， 我们还是使用 Express 服务器的地址。 然后监听连接后便可以传递信息了。

```` javascript
//app.js
app.use('/', (req, res) => {
  res.render('websocket')
})

var server = app.listen(app.get('port'), () => {
  console.log('server running on ' + port);
})

const io = require('socket.io')(server)

io.on('connection', (socket) => {
  socket.on('hello', data => {
    console.log(data);
  })
  socket.emit('fire', {fire: 'hole'})
})

````
因为是双向连接， 在浏览器端我们也需要相应的配置。  其中的 socket.js 文件对应这 Socket.IO 包内的浏览器端实现（node_modules/socket.io-client/dist/socket.io.js）

```` html
//websocket.ejs

<script src="socket.js" charset="utf-8"></script>
<script type="text/javascript">
// connect 默认 url 参数 为 window.location http://localhost:3000
  const socket = io.connect()
  socket.on('fire', (data) => {
    console.log(data);
  })
  socket.emit('hello', {message: 'socket.io'})

````

打开本地连接， 我们在控制台看到打印的 **{fire: 'hole'}** 而在 node 终端我们看到 **{ message: 'socket.io' }**, 说明双向连接成功建立。


> 参考文章：

> [WebSockets](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSockets_API)

>[Node.js + Web Socket 打造即时聊天程序嗨聊
](http://www.cnblogs.com/Wayou/p/hichat_built_with_nodejs_socket.html)

>[Mongodb和mongoose模糊查询](https://yuedun.duapp.com/blogdetail/581d736c43c18f1b7ae3e3ff)
