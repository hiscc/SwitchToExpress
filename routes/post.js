var express = require('express')
var router = express.Router()
var Post = require('../models/post')
var Tag = require('../models/tag')
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
      // res.json(posts)
  })

})

router.get('/add', (req, res) => {
  res.render('form', {post: undefined})
})

router.post('/add', (req, res) => {
  let {body, title, tag} = req.body
  let auther = req.session.user
  var post = new Post({title: title, body: body, auther: auther})
  post.save((err) => {
    if (err) {
      res.json(err)
    }

    Tag.findOne({name: tag}, (err, doc) => {
      if (err) {
        res.json(err)
      }
      if (!!doc) {
        doc.posts.push(post)
        doc.save()
        res.json(doc)
      } else {
        let tags = Tag.create({name: tag, posts: post})
        tags.then(tag => {
          res.json(tag)
        })
      }
    })

  })
  // res.redirect('/posts')
})

router.get('/:id', (req, res) => {
  var post = Post.findOne({_id: req.params.id}).populate('comments auther', {_id: 1} ).exec()
  post.then(post => {
    var comms = Comment.find({post: post._id}).populate('auther').exec()
    comms.then(comms => {
      // res.json(comms)
      res.render('post', {post: post, comments: comms})
    })
      // res.render('post', {post: post, comments: post.comments})

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
  let {post_id} = req.params.id
  Comment.remove({post: post_id}, err => {
    if (err) {
      res.json(err)
      return
    }
  })
  Tag.findOne({posts: post_id}, (err, tag) => {
    // res.json(tag)
    // return
    // let post_arr = tag.posts
    // let post_index = post_arr.index(post_id)
    // post_arr.splice(post_index, 1)
    // tag.save()
  })
  Post.remove({_id: req.params.id}, (err) => {
    err? console.log(err): console.log('success delete')
  })
  res.redirect('/posts')
})

module.exports = router
