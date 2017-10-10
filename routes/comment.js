var express = require('express')
var router = express.Router()
var Comment = require('../models/comment')


router.get('/', (req, res) => {
  Comment.find({},null, {updated_at: 1, body: -1}, (err,comments) => {
    if (err) {
      res.json(err)
    } else {
      res.render('list', {comments: comments})
    }
  })
})
router.post('/:post_id/add', (req, res) => {
  let body = req.body.body
  let auther = req.session.user
  let post_id = req.params.post_id
  var comment = new Comment({body: body, post: post_id, auther: auther})
  comment.save(err => {
    if (err) {
      res.json(err)
    }
  })

  // res.json(post_id)
  res.redirect('/posts/' + post_id)
})
router.post('/:post_id/:comment_id/add', (req, res) => {
  let body = req.body.sub
  let auther = req.session.user
  let post_id = req.params.post_id
  let comment_id = req.params.comment_id
  let comment = new Comment({body: body, auther: auther, pre_id: comment_id})

  comment.save((err,doc) => {
    if (err) {
      res.json(err)
      return
    }
    Comment.findById(comment_id, (err, comm) => {
      comm.next_id.push(doc)
      comm.save()
    })
  })
  res.redirect('/posts/' + post_id)
})

router.get('/:comment_id/delete', (req, res) => {
  var comment_id = req.params.comment_id
  var comm = Comment.findById(comment_id).populate('next_id').exec()
  comm.then(com => {
    com.remove().then(doc => {
      // 删除二级评论
      doc.next_id.forEach(id => {
        id.remove()
      })
      res.end('successful')
      // res.json(doc)
    })
  })

})

module.exports = router
