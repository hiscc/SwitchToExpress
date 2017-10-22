## SwitchToExpress

本项目将基于 Express 从零开始搭建一个功能完备的博客系统
1. [开始， Express 基础及模型基础操作](https://github.com/hiscc/SwitchToExpress/tree/authentication) ``git checkout master``
1. [注册登录， 用户注册及第三方登录](https://github.com/hiscc/SwitchToExpress/tree/authentication) ``git checkout authentication``
1. [mongoose 更进一步， 为文章添加标签和评论](https://github.com/hiscc/SwitchToExpress/tree/models)  ``git checkout models``
1. [文章系统， 文章分页、 排序、 搜索、 多级评论](https://github.com/hiscc/SwitchToExpress/tree/ui)  ``git checkout ui``
1. [文件上传， 为用户添加图库](https://github.com/hiscc/SwitchToExpress/tree/images)  ``git checkout images``
1. [初探 WebSockets， 实时聊天室 ](https://github.com/hiscc/SwitchToExpress/tree/websocket)  ``git checkout websocket``

``npm install nodemon -g && npm install && npm run s``
  
或者

``npm install && node app``  
****
在本节我们主要实现 Express 基本的操作

1. 搭建基本的后端服务器  
1. 理解基本的 nodejs 中间件
1. 文章模型的 CRUD
1. 熟练后端模版引擎 ejs 的操作

### 基本构造

此次我们将直接使用 [express 生成器](http://www.expressjs.com.cn/starter/generator.html) 来启动项目, 然后对起进行改造。

本节需要用到的中间件：

1. express  -- 后端框架
1. body-parser  -- 解析表单数据
1. mongoose  -- 简化数据库操作
1. path  -- 路径修正工具
1. ejs  -- 后端模版解析
1. lru-cache  -- 模版缓存

### 构建服务器

我们使用 express 生成器直接生成项目

先安装

``$ npm install express-generator -g``

再生成

``$ express SwitchToExpress``

修改 ``package.json`` 文件， 添加列表中的中间件

``$ cd SwitchToExpress && npm install --save``

基本完成， 这时我们打开 ``app.js`` 来搭建服务器

```` js
// app.js
var express = require('express')
var ejs = require('ejs')
var LRU = require('lru-cache')
var path = require('path')
var cookieParser = require('cookie-parser')

var app = express()
// ~~

app.set('port', process.env.PORT || 3000)
var port = app.get('port')
app.listen(app.get('port'), () => {
  console.log('server running on ' + port);
})
````

然后启动 ``node app`` , 打开 ``loaclhost：3000``， 发现什么都没有！ 因为我们还未设置 ``路由（routes）`` 。 路由简单来讲就是网址和视图的对应关系。 因为 ``loaclhost：3000`` 对应我们的根路径 ``'/'`` ，而我们并没有设置当 express 服务器请求到跟路径时服务器需要对应的视图， 所以什么也不会显示。

### 设置基本中间件

````js
// app.js

// 设定模版引擎
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
ejs.cache = LRU(100);

// 解析 req.body
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
````

### 设置文章模型

我们需要连接数据库， 记得在你本地打开 ``mongodb`` 数据库, 然后我们在 ``app.js`` 中设置数据库的连接。

````js
// app.js
var mongoose = require('mongoose')
var db = mongoose.connection
var uri = 'mongodb://localhost:27017/SwitchingToExpress'
mongoose.connect(uri)
db.once('open', () => {
  console.log('mongodb connected');
})

````

OK， 数据库接好之后我们就可以创建相应的 Post 数据模型了， 我们基于 mongoose 创建类似对象的模型

````js
// app.js
var postSchema = mongoose.Schema({
  title: String,
  body: String
})
var Post = mongoose.model('Post', postSchema)
````

超级简单， Post 模型结构有两个字段， title 和 body 类型是字符串。 postSchema 为模型结构， 真正的模型是 Post。

### 设置基本路由

我们开始设置我们第一个 ``路由（routes）``

````js
// app.js

//在'/'路径下，我们将返回 index.ejs 模版， 因为在前面我们已经设置 ‘views’ 为视图路径所以这里不需要写成 render('views/index') 了， 后面的 posts 就是模版需要解析的数据， 具体内容可以查看 index.ejs

app.get('/', (req, res) => {
  Post.find({}, (err, data) => {
    console.log(data)
    res.render('index', {posts: data, post: undefined})
  })
})

// 添加文章的路由， 对应 add.ejs 模版
app.get('/add', (req, res) => {
  res.sendFile(path.join(__dirname , 'views/add.html'))
})

// CRUD 的 C
// 在表单内输入数据后发送到服务器的路由动作。 借助 body-parser， 我们可以轻松拿到表单里的数据 ，通过 req.body 便能取得提交的数据， 然后我们创建一个新的对象实例写入到数据库内

app.post('/add', (req, res) => {
  let title = req.body.title
  let body = req.body.body
  var post = new Post({title: title, body: body})
  post.save((err) => {
    if (err) {
      res.json(err)
    }
  })
  res.redirect('/')
})


// CRUD 的 U
//我们需要更改数据的视图， req.params.id 获取到文章 id 然后进行数据查询， 返回单个文章数据
app.get('/:id/update', (req, res) => {
  Post.findOne({_id: req.params.id}, (err, data) => {
    err? console.log(err):  console.log('success');
    res.render('form', {post: data})
  })
})

//在单个文章内，我们需要提交修改后的数据， 还是用 post 方法， 找到需要修改的数据然后传入新数据
app.post('/:id/update', (req, res) => {
  let title = req.body.title
  let body = req.body.body
  console.log(title, body);
  Post.findOneAndUpdate({_id: req.params.id}, {title: title, body: body}, (err, data) => {
    err? console.log(err): res.redirect('/')
  })
})

// CRUD 的 D
// 删除操作， 主要是通过 id 来查找到数据并执行删除
app.get('/:id/delete', (req, res) => {
  Post.remove({_id: req.params.id}, (err) => {
    err? console.log(err): console.log('success delete');
  })
  res.redirect('/')
})
````
