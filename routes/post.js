var express = require('express')
var router = express.Router()
var Post = require('../models/post')
var Comments = require('../models/comment')
var path = require('path')
// router start

router.get('/', (req, res) => {
  // Post.find({}, (err, data) => {
  //   res.json(data)
  //   res.render('index', {posts: data, post: undefined})
  // })
  Post.find().populate('auther').exec((err, posts) => {
    res.render('index', {posts: posts, post: undefined})
    // res.json(posts[0])
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
  var post = Post.findOne({_id: req.params.id}).populate('auther comments', {_id: 1} ).exec()
  post.then(post => {
    var comms = Comments.find({post: post._id}, (err,comments) => {
     res.render('post', {post: post, comments: comments})
    })

    // res.json(post)
  })
})


router.post('/:id/comment', (req, res) => {
  let text = req.body.comment
  let auther = req.session.user
   Post.findById(req.params.id, (err, post) => {
    let comment = new Comments({body: text, post: post._id})
    comment.save((err, comment) => {
      if (err) {
        res.json(err)
        return
      }
      res.redirect('/posts/' + req.params.id)
    })
  })
  // post.then(post => {
  //   let comment = new Comments({body: text, post: post._id})
  //   comment.save((err, comment) => {
  //     if (err) {
  //     res.json(err)
  //     return
  //     }
  //     res.redirect('/posts/' + req.params.id)
  //   })
  // }, (fail) => {
  //   res.json('fail')
  // })
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
