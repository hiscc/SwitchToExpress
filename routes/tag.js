const Tag = require('../models/tag')
const express = require('express')
const router = express.Router()


router
  .get('/', (req, res) => {

    Tag.find().populate('posts').exec((err, tags) => {
      // res.json(tags)
      res.render('tags', {tags: tags})
    })
  })
  .post('/add', (req, res) => {
    let {name} = req.body
    Tag.create({name: name}, (err) => {
      if (err) {
        res.json(err)
      }
      res.redirect('/tags')
    })
  })
  .get('/:tag_name', (req, res) => {
    let {tag_name} = req.params
    Tag.findOne({name: tag_name}).populate('posts').exec((err, tag) => {
      // res.json(tag)
      res.render('index', {tag: tag,posts: tag.posts, post: undefined, tags: undefined})
    })
  })
  .get('/:tag_name/delete', (req, res) => {
    let {tag_name} = req.params
    Tag.remove({name: tag_name}, err => {
      if (err) {
        res.json(err)
        return
      }
      res.redirect('/tags')
    })
  })
// User.find(match, function (err, users) {
//   var opts = [{ path: 'company', match: { x: 1 }, select: 'name' }]
//
//   var promise = User.populate(users, opts);
//   promise.then(console.log).end();
// })
module.exports = router
