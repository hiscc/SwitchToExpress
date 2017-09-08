const mongoose = require('mongoose')
const Schema = mongoose.Schema()

// 创建模型
var postSchema = mongoose.Schema({
  title: String,
  body: String
})

module.exports = mongoose.model('Post', postSchema)
