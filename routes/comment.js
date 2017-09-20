var express = require('express')
var router = express.Router()
var Comment = require('../models/comment')



router.post('/add', (req, res) => {
  let body = req.body.body
  let post_id = req.body.id
  let auther = req.session.user

  var comment = new Comment({body: body, post: post_id, auther: auther})
  comment.save(err => {
    if (err) {
      res.json(err)
    }
  })

  // res.json(comment)
  res.redirect('/posts/' + post_id)
})

module.exports = router
