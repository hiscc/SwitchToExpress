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
var paginate = require('express-paginate')


var postCtl = require('./routes/post')
var userCtl = require('./routes/user')
var commentCtl = require('./routes/comment')
var tagCtl = require('./routes/tag')
var isLoggedIn = require('./utilis/isLoggedIn')
var imageCtl = require('./routes/image')

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
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({
  secret: 'keyboard ct',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }}))

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));
// app.use(express.static(path.join(__dirname + 'public')))
app.use(express.static(path.join(__dirname, 'uploads')))
app.use(paginate.middleware(10, 50))

app.use('/socket.js', express.static('node_modules/socket.io-client/dist/socket.io.js'))
app.use('/', (req, res) => {
  res.render('websocket')
})
app.use('/users', userCtl)
app.use('/posts',  postCtl)
app.use('/comments', commentCtl)
app.use('/tags', tagCtl)
app.use('/images', imageCtl)

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
var server = app.listen(app.get('port'), () => {
  console.log('server running on ' + port);
})


const io = require('socket.io')(server)
const users = []

io.on('connection', (socket) => {
  socket.on('login', data => {
    if (users.indexOf(data.name) > -1) {
      socket.emit('userexisted')
    } else {
      users.push(data.name)
      // socket.nickname 为当前 socket 确定当前用户， 便于记录 user
      socket.nickname = data.name
      socket.index = users.length
      socket.emit('loginsuccessful')
      io.sockets.emit('system', data.name, users.length, 'login');
    }
  })
  socket.on('postMsg', function(msg) {
      socket.broadcast.emit('newMsg', socket.nickname, msg);
   });
   socket.on('postImg', function(img) {
       socket.broadcast.emit('newImg', socket.nickname, img);
    });
  socket.on('disconnect', () => {
    users.splice(socket.index-1, 1)
    io.sockets.emit('system', socket.nickname, users.length, 'logout');
  })
})
