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

WebSockets 是基于 WS 协议上的一种技术， 而 WS 是基于 TCP 协议之上类似于 HTTP 协议的数据传输协议。 不同的是 HTTP 为单向传输即只能浏览器主动向服务器请求资源， 服务器才能将数据传送给浏览器， 而服务器不能主动向浏览器传递数据。 也就是说服务器不能掌握主动性， 而 WS 就是使服务器也具有了主动性。 比如在我们建立好链接后服务器会在浏览器未发生请求时主动给浏览器发送信息， 而且在短时间内服务器可以和浏览器保持持久的会话。

既然 WebSockets 是建立在基础协议之上的技术， 那么在各个平台都有其实现， 这里我们使用 Socket.IO 包来实现 node 平台的 WebSockets。


#### 建立 WebSockets 连接

由于 WebSockets 是浏览器服务器间的双向连接， 所以我们需要在浏览器服务器端分别配置。

首先需要安装 Socket.IO 包， **npm install socket.io -S** ， OK， 在 app.js 内简单配置一下。

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

#### 实现聊天室的信息流

1. 我们需要用 emit 和 on 来产生信息流， 进而实现浏览器和服务器交互
2. 在客户端 a， 对于发送一条信息我们需要一个 pushMsg 函数来显示信息（即操作 DOM 节点）， 然后为了让其它客户端也能收到 a 客户端发送的信息， 我们需要在客户端再发送一个 postMsg 事件来通知服务器这里有一个客户端发信息了
3. 在服务器端， 我们订阅来自客户端的 postMsg 事件并且给其它客户端广播一个 newMsg 事件
4. 其它客户端再次订阅 newMsg 来显示客户端 a 发送的信息

````javascript
// app.js
// 接收来自客户端的 postMsg 事件， 并向其它客户端广播 newMsg 事件
// 在 Socket.IO 内有三种广播 1. socket.emit 广播属于单个 socket 服务器 2. socket.broadcast.emit 即向除 socket 服务外的所有其它 socket 发送广播 3. io.sockets.emit 即全局广播向所有 socket 服务发送广播

socket.on('postMsg', function(msg) {
    socket.broadcast.emit('newMsg', socket.nickname, msg);
 });

// websocket.ejs
// 其余客户端订阅 newMsg 事件， 并操作 DOM 节点
socket.on('newMsg', (user, msg) => {
 pushMsg(user, msg)
})
````

所以在本次双向的信息流内有如下三组操作
1. (browser)pushMsg（操作 DOM 节点）-> (browser)emit('postMsg') ->
1. (server)on('postMsg') -> (server)emit('newMsg') ->
1. (other browsers)on('newMsg') -> (other browsers)pushMsg（操作 DOM 节点）

这样一台客户端的信息才会被广播到所有其它客户端上。 其中操作 DOM 节点即前端操作， 同样在(server)on('postMsg') 事件上我们也可以拿到前端传来的 msg 数据然后进行相应的后端操作

> 参考文章：

> [WebSockets](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSockets_API)

>[Node.js + Web Socket 打造即时聊天程序嗨聊
](http://www.cnblogs.com/Wayou/p/hichat_built_with_nodejs_socket.html)
