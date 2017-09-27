const Image = require('../models/image')
const express = require('express')
const router = express.Router()
const multer  = require('multer')
const fs = require('fs')


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
    Image.find().populate('auther').exec((err, images) => {
      if(err) res.json(err)
      // res.json(images)
      let user = req.session.user
      let imagesArray = []
      if (!!user) {
        images.forEach(image => {
          if (user._id == image.auther._id) {
            imagesArray.push(image)
          }else {
            console.log(image.auther, user);
          }
        })
      }

      res.render('image', {images: imagesArray})
    })

  })
  .post('/add', upload.single('image'), (req, res) => {
    let { originalname, filename } = req.file
    let user = req.session.user
    // res.json(user)
    Image.create({name: originalname, url: filename, auther: user}, (err, image) => {
      if(err) res.json(err)
      res.json(image)
    })
  })
  .get('/:id/delete', (req, res) => {
    let {id} = req.params

    Image.findOneAndRemove({_id: id}, (err, image) => {
      if(err) res.json(err)
      // 获取文件名
      let url = image.url
      // unlink 用于删除文件
      fs.unlink(`./uploads/${url}`,function(err){
      if(err) return console.log(err);
      console.log('file deleted successfully');
      })
    })
      // 删除路由必须加后续处理（当然这个一般都有）， 否则程序会一直请求 image.url 直至进程挂掉
    res.redirect('/images')
  })


module.exports = router
