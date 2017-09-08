var express = require('express')
var ejs = require('ejs')
var LRU = require('lru-cache')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
// var bodyParser = require('body-parser')


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
// app.use(cookieParser())


app.use(express.static(path.join(__dirname, 'public')))
// app.use(express.static(path.join(__dirname, 'views')))

// 创建模型
var postSchema = mongoose.Schema({
  title: String,
  body: String
})
var Post = mongoose.model('Post', postSchema)

// router start

app.get('/', (req, res) => {
  Post.find({}, (err, data) => {
    console.log(data)
    res.render('index', {posts: data, post: undefined})
  })

})

app.get('/add', (req, res) => {
  res.sendFile(path.join(__dirname , 'views/add.html'))
})

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

app.get('/:id/update', (req, res) => {
  Post.findOne({_id: req.params.id}, (err, data) => {
    err? console.log(err):  console.log('success');
    res.render('form', {post: data})
  })
})
app.post('/:id/update', (req, res) => {
  let title = req.body.title
  let body = req.body.body
  console.log(title, body);
  Post.findOneAndUpdate({_id: req.params.id}, {title: title, body: body}, (err, data) => {
    err? console.log(err): res.redirect('/')
  })
})

app.get('/:id/delete', (req, res) => {
  Post.remove({_id: req.params.id}, (err) => {
    err? console.log(err): console.log('success delete');
  })
  res.redirect('/')
})




app.set('port', process.env.PORT || 3000)
var port = app.get('port')
app.listen(app.get('port'), () => {
  console.log('server running on ' + port);
})
