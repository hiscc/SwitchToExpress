var express = require('express')
var ejs = require('ejs')
var LRU = require('lru-cache')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var session = require('express-session')

var postCtl = require('./routes/post')
var userCtl = require('./routes/user')
var isLoggedIn = require('./utilis/isLoggedIn')

var mongoose = require('mongoose')
var db = mongoose.connection
var uri = 'mongodb://localhost:27017/SwitchingToExpress'
mongoose.connect(uri)
db.once('open', () => {
  console.log('mongodb connected');
})
var app = express()

// 设定模版引擎
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
ejs.cache = LRU(100);

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
// 解析 req.body
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true }}))


app.use(express.static(path.join(__dirname, 'public')))
// app.use(express.static(path.join(__dirname, 'views')))

app.use('/user', userCtl)
app.use('/posts', isLoggedIn, postCtl)





app.set('port', process.env.PORT || 3000)
var port = app.get('port')
app.listen(app.get('port'), () => {
  console.log('server running on ' + port);
})
