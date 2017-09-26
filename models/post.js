const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 创建模型
var postSchema = mongoose.Schema({
  // _id: Schema.Types.ObjectId,
  title: String,
  body: String,
  auther: {type: Schema.Types.ObjectId, ref: 'User'},
  tags: [{type: Schema.Types.ObjectId, ref: 'Tag'}],
  create_time: {type: Date, default: new Date()}
})

module.exports = mongoose.model('Post', postSchema)
