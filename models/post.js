const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 创建模型
var postSchema = mongoose.Schema({
  // _id: Schema.Types.ObjectId,
  title: String,
  body: String,
  auther: {type: Schema.Types.ObjectId, ref: 'User'},
  comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
})

module.exports = mongoose.model('Post', postSchema)
