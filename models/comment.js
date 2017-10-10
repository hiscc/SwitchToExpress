const mongoose = require('mongoose')
const Schema = mongoose.Schema

var commentSchema = mongoose.Schema({
  body: {type: String},
  auther: {type: Schema.Types.ObjectId, ref: 'User'},
  post: {type: Schema.Types.ObjectId, ref: 'Post'},
  //pre_id 用来标记所属上层 comment 。 即评论1的pre_id 为空， 评论11的 pre_id 为1， 评论111的 pre_id 为11。 主要用来标示回复人
  pre_id: {type: Schema.Types.ObjectId, ref: 'Comment'},
  //next_id 用来标记下层 comment 。 即一条评论下又可有多条评论
  next_id: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
  updated_at: { type: Date, default: Date.now },
})


// commentSchema.pre('save', (next) => {
//   if (!this.created) {
//     this.created = new Date
//     next()
//   }
// })

module.exports = mongoose.model('Comment', commentSchema)
