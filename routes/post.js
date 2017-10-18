var express = require('express')
var router = express.Router()
var Post = require('../models/post')
var Tag = require('../models/tag')
var Comment = require('../models/comment')
var path = require('path')
// router start
var paginate = require('express-paginate')

router.get('/', (req, res) => {
  // Post.find({}, (err, data) => {
  //   res.json(data)
  //   res.render('index', {posts: data, post: undefined})
  // })
  let page = req.query.page || 1
  var pageSize = 3
  Post.find().skip(pageSize*(page - 1)).limit(pageSize).populate('auther').exec((err, posts) => {
    Post.count({}, (err, count) => {
      let pages = []
      let pageNum = Math.ceil(count/pageSize)

      for (var i = 0; i < pageNum; i++) {
        pages.push(i)
      }
      Tag.find({}).exec((err, tags) => {
        if (err) {
          res.json(err)
        } else {

          res.render('index', {posts: posts, post: undefined, tags: tags, pages: pages, curpage: page})
        }
      })
    })

    // res.render('index', {posts: posts, post: undefined})
    // res.json(posts)
  })

})
router.get('/search', (req, res) => {
  // let q = req.query.q || ''
  let {q=""} = req.query
  // 前端表单使用 get 方法指定 name = q 便得到 query.q
  Post.find(
    // query
    {
      $or:[
        {title: {$regex: q, $options: 'ix'}},
        {body: {$regex: q, $options: 'ix'}}
      ]
    },
    // filter1 0 - filter, 1 - left
    {title: 1, body: 1},
    // filter2
    {sort: {create_time: -1}, limit: 10}
  ).exec((err, posts) => {
    if (err) {
      res.json(err)
      return
    }
    // res.json(posts)
    res.render('index', {posts: posts, post: undefined, tags: undefined, pages: undefined})
  })
})

router.get('/sort', (req, res) => {
  let {name = 1, create = -1} = req.query

  Post.find({},null,{sort: {name: name, create_time: create} }).exec((err, posts) => {
    if (err) {
      res.json(err)
      return
    }
    // res.json(posts)
    res.render('index', {posts: posts, post: undefined, tags: undefined})
  })
})

router.get('/add', (req, res) => {
  Tag.find({}).exec((err, tags) => {
    if (err) {
      res.json(err)
    } else {
      res.render('form', {post: undefined, tags: tags})
    }
  })
})

router.post('/add', (req, res) => {
  let {body, title, tag} = req.body
  let auther = req.session.user
  let tags = []
  var post = new Post({title: title, body, auther: auther, tags: tag})

// 矫正 tag 为数组
  if (typeof tag !== 'string') {
    tags = tag
  } else {
    tags[0] = tag
  }

  post.save((err, post) => {
    if (err) {
      res.json(err)
      return
    }
    Tag.find({_id: {$in: tags}}).exec((err,tags) => {
      tags.forEach(tag => {
        tag.posts.push(post)
        tag.save()
      })
    })
  })

  res.redirect('/posts')
})

router.get('/:id', (req, res) => {
  var post = Post.findOne({_id: req.params.id}).populate('tags').exec()
  post.then(post => {
    var comms = Comment.find({post: post._id}).populate('auther next_id').exec()
    comms.then(comms => {
      // res.json(comms)
      res.render('post', {post: post, comments: comms, tags: post.tags})
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

router.get('/:post_id/delete', (req, res) => {
  let {post_id} = req.params
  let comm = Comment.findOne({post: post_id}).populate('next_id').exec()
  comm.then(com => {
    com.remove().then(doc => {
      // 删除二级评论
      doc.next_id.forEach(id => {
        id.remove()
      })
      // res.end('successful')
      res.json(doc)
      return
    })
  })

  Tag.find({}, (err, tags) => {
    if (err) {
      res.json(err)
      return
    }
      tags.forEach(tag => {
        if(tag.posts.indexOf(post_id) !== -1){
          tag.posts.pull(post_id)
          tag.save()
          console.log('yes'+ tag.posts.length);
        }
      })
    // res.json(tags)
  })
  Post.remove({_id: post_id}, (err) => {
    err? console.log(err): console.log('success delete')
  })
  res.redirect('/posts')
})

module.exports = router
