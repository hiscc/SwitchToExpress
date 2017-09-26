const Image = require('../models/image')
const express = require('express')
const router = express.Router()
const multer  = require('multer')

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/../uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.' +file.mimetype.split('/')[1])
  }
})

const upload = multer({ storage: storage })
router
  .get('/', (req, res) => {
    Image.find({}, (err, images) => {
      if(err) res.json(err)
      res.render('image', {images: images})
    })

  })
  .post('/add', upload.single('image'), (req, res) => {
    let { originalname, filename } = req.file
    Image.create({name: originalname, url: filename}, (err, image) => {
      if(err) res.json(err)
      res.json(image)
    })
  })
  .get('/:id/delete', (req, res) => {
    let {id} = req.params
    Image.findOneAndRemove({_id: id}, (err, image) => {
      if(err) res.json(err)
      // res.json('success' + image)
    })
  })


module.exports = router
