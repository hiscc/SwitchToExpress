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

router.get('/:comment_id/delete', (req, res) => {
  var comment_id = req.params.comment_id
  var comment = Comment.remove({_id: comment_id}, (err, doc) => {
    if (err) {
      res.json(err)
    }
    var back = req.Referer
    // res.render(bac)
    res.json('success delete' + doc)
  })

})

module.exports = router
