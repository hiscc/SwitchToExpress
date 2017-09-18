var express = require('express')
var ejs = require('ejs')
var LRU = require('lru-cache')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var session = require('express-session')
var passport = require('passport')

var postCtl = require('./routes/post')
var userCtl = require('./routes/user')
var isLoggedIn = require('./utilis/isLoggedIn')


var passport = require('passport')
var GitHubStrategy = require('passport-github2').Strategy;
var config = require('./auth')


var mongoose = require('mongoose')
var db = mongoose.connection
var uri = 'mongodb://localhost:27017/SwitchingToExpress'
mongoose.connect(uri)
db.once('open', () => {
  console.log('mongodb connected')
})
mongoose.Promise = global.Promise
var app = express()

// 设定模版引擎
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
// ejs.cache = LRU(100)

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
  cookie: { secure: false }}))

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')))
// app.use(express.static(path.join(__dirname, 'views')))

app.use('/users', userCtl)
app.use('/posts',  postCtl)


require('./config/passport')(passport)


app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user' ] }),
  function(req, res){
  });
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/user/profile');
  });








app.set('port', process.env.PORT || 3000)
var port = app.get('port')
app.listen(app.get('port'), () => {
  console.log('server running on ' + port);
})
