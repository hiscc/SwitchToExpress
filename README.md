## SwitchToExpress

本项目将基于 Express 从零开始搭建一个功能完备的博客系统

在本节我们主要实现登录权限的基本操作

1.  
1. 理解基本的登录原理


### 基本构造



本节需要用到的中间件：

1. express-session  -- session 管理
1. cookie-parse  -- cookie 解析



### session 登录一般原理

利用 ``session`` 我们可以给路由授权， 保护那些需要登录后才能请求到的视图。 ``session`` 基于浏览器端的 ``cookie`` 存储。我们在登录账号后， 通过在 ``session`` 中保存用户信息来告诉浏览器用户有没有登录， 并通过用户信息来判断该用户所拥有的权限。 在本节中我们将实现这样的验证机制： 用户在注册登录后便可以修改文章信息， 而非登录用户只能浏览文章。

首先安装

``$ npm install express-session cookie-parse  --save``

因为需要用户登录， 所以我们需要创建用户模型。 在 ``models`` 文件夹下创建 ``user.js``


```` js
// models/user.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema()
var bcrypt   = require('bcrypt-nodejs')

const userSchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  password: String
})

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};
module.exports = mongoose.model('User', userSchema)

````

只关注 ``name`` 和 ``password`` 就好， 一般来说我们不会保存明文密码所以我们引入了 ``bcrypt-nodejs`` 中间件来对密码做加密。 在 ``user`` 模型上我们定义了两个方法一个加密另一个用来比对密码， 在把用户提交的密码信息放到数据库的时候我们会先用第一个方法来对密码加密然后保存， 在用户登录时我们需要第二个方法来比对密码。

### 配置 session

````js
// app.js
var cookieParser = require('cookie-parser')
var session = require('express-session')

app.use(cookieParser('keyboard cat'))
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }}))
````

这样我们就可以把 ``session`` 放到 ``cookie`` 里使用了

### 设置用户注册登录路由

有了 ``user`` 模型我们就可以执行登录注册操作了， 在 ``routes`` 下设立 ``user.js`` ， 需要一些基本的逻辑判断

````js
// routes/user.js

var express = require('express')
var router = express.Router()
var User = require('../models/user')
/* GET users listing. */
router
  .get('/login', (req, res) => {
    res.render('login', {message: 'login'})
  })
  .post('/login', (req, res) => {
    let name = req.body.name
    let password = req.body.password
    User.findOne({name: name}, (err, user) => {
      if (err) {
        res.render('login', {message: err})
      }
      if (!user) {
        res.render('login', {message: 'user does not exist'})
      } else {
        if (user.password === password) {

            // 成功登录后我们设置 session
          req.session.user = user
          console.log(req.session);
          res.redirect('/posts')
        } else {
          res.render('login', {message: 'wrong password'})
        }
      }
    })
  })
  .get('/profile', (req, res) => {
    res.render('profile',{user: req.user})
  })
  .get('/signup', (req, res) => {
    res.render('login', {message: 'please signup'})
  })
  .post('/signup', (req, res) => {
    if (!req.body.name || !req.body.password) {
      res.render('login', {message: 'please enter name and password'})
    } else {
      User.findOne({name: req.body.name}, (err, user) => {
        if (user) {
          res.render('login', {message: 'user exist'})
        } else {
          let newUser = new User({name: req.body.name, password: req.body.password})
          newUser.save((err) => {
            if (err) {
              console.log(err);
              res.render('login', {message: 'db can not save'})
            } else {
              // 成功注册用户后我们设置 session ，这样即默认用户已登录
                req.session.user = newUser
                res.redirect('/posts')
            }
          })
        }
      })
    }
  })

// 因为我们用 session 来查询用户的登录状态，所以注销即意味着清除 session
  .get('/logout', (req, res) => {
    req.session.destroy(() => {
      res.render('login', {message: 'logout'})
    })
  })


module.exports = router;

````

OK， 路由弄好就可以设置视图了， 在 ``views`` 下设置视图 ``login.ejs``

````js
// views/ejs.js
<h2>Login</h2>

<% if(message) {  %>
  <%= message %>
<% }  %>

<form class=""  method="post">
  name: <input type="text" name="name"><br>
  password: <input type="password" name="password">
  <button type="submit" name="button">Login</button>
</form>

      <a href="/auth/github" class="btn btn-danger"><span class="fa fa-github"></span> Github</a>

````

### 用户登录过滤器

我们需要一个函数来拦截那些未登录用户不能请求到的路由操作，例如更新、删除文章。 在 ``utilis`` 中创建 ``isLoggedIn.js``

````js
// utilis/isLoggedIn.js.js

module.exports = function(req, res, next){
  if (req.session.user || req.path == '/' || req.isAuthenticated()) {
    next()
  } else {
    res.redirect('/user/login')
  }
}
````
 我们将在 ``posts`` 路由中使用这个函数来过滤请求， 通过判断用户是否登录（req.session.user）来执行后续的操作。

 在 ``app.js`` 中加载所有路由

 ````js
 //app.js
 var postCtl = require('./routes/post')
 var userCtl = require('./routes/user')
 var isLoggedIn = require('./utilis/isLoggedIn')

 app.use('/user', userCtl)
 app.use('/posts', isLoggedIn, postCtl)
 ````
这样 ``posts`` 下所有的路由都会经过 ``isLoggedIn`` 函数来进行权限的过滤。

****

另外还有成熟的用户验证包如 passport，我在此节中用 passport 和 passport-github2 集成了一个 github 的 oauth2 验证，有兴趣的同学可以参考 config／passport.js  

> 参考文章：

> [Social Authentication in Node.js With Passport](http://mherman.org/blog/2015/09/26/social-authentication-in-node-dot-js-with-passport/#.WbkwsNMjHZo)

> [ExpressJS - Authentication](https://www.tutorialspoint.com/expressjs/expressjs_authentication.htm)
