var express = require('express')
var router = express.Router()
var Post = require('../models/post')
var Comment = require('../models/comment')
var path = require('path')
// router start

router.get('/', (req, res) => {
  // Post.find({}, (err, data) => {
  //   res.json(data)
  //   res.render('index', {posts: data, post: undefined})
  // })
  Post.find().populate('auther').exec((err, posts) => {
    res.render('index', {posts: posts, post: undefined})
  })

})

router.get('/add', (req, res) => {
  res.render('form', {post: undefined})
})

router.post('/add', (req, res) => {
  let title = req.body.title
  let body = req.body.body
  let auther = req.session.user
  var post = new Post({title: title, body: body, auther: auther})
  post.save((err) => {
    if (err) {
      res.json(err)
    }
  })
  res.redirect('/posts')
})

router.get('/:id', (req, res) => {
  var post = Post.findOne({_id: req.params.id}).populate('comments auther', {_id: 1} ).exec()
  post.then(post => {
    var comms = Comment.find({post: post._id}).populate('auther').exec()
    comms.then(comms => {
      res.render('post', {post: post, comments: comms})
    })
    // res.json(post)
  })
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
  console.log(title, body)
  Post.findOneAndUpdate({_id: req.params.id}, {title: title, body: body}, (err, data) => {
    err? console.log(err): res.redirect('/posts')
  })
})

router.get('/:id/delete', (req, res) => {
  Post.remove({_id: req.params.id}, (err) => {
    err? console.log(err): console.log('success delete');
  })
  res.redirect('/posts')
})

module.exports = router
