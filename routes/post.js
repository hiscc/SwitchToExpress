var express = require('express')
var router = express.Router()
var Post = require('../models/post')
// router start

router.get('/', (req, res) => {
  Post.find({}, (err, data) => {
    res.render('index', {posts: data, post: undefined})
  })

})

router.get('/add', (req, res) => {
  res.sendFile(path.join(__dirname , 'views/add.html'))
})

router.post('/add', (req, res) => {
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

router.get('/:id/update', (req, res) => {
  Post.findOne({_id: req.params.id}, (err, data) => {
    err? console.log(err):  console.log('success');
    res.render('form', {post: data})
  })
})
router.post('/:id/update', (req, res) => {
  let title = req.body.title
  let body = req.body.body
  console.log(title, body);
  Post.findOneAndUpdate({_id: req.params.id}, {title: title, body: body}, (err, data) => {
    err? console.log(err): res.redirect('/')
  })
})

router.get('/:id/delete', (req, res) => {
  Post.remove({_id: req.params.id}, (err) => {
    err? console.log(err): console.log('success delete');
  })
  res.redirect('/')
})

module.exports = router
