const mongoose = require('mongoose')
const Schema = mongoose.Schema

var tagSchema = new Schema({
  name: {type: String, default: '标签名称'},//标签名称 eg: css html
  catalogue_name: {type: String, default: '分类名称'},//分类名称 eg: FrontEnd
  used_num: {type: Number, default: 0},//文章引用数
  create_time: {type: Date, default: (new Date())},//创建时间 时间戳
  posts: [{type: Schema.Types.ObjectId, ref: 'Post'}]
})

module.exports = mongoose.model('Tag', tagSchema)
