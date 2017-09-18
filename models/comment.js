const mongoose = require('mongoose')
const Schema = mongoose.Schema

var commentSchema = mongoose.Schema({
  body: String,
  auther: [{type: Schema.Types.ObjectId, ref: 'User'}],
  post: [{type: Schema.Types.ObjectId, ref: 'Post'}],
  created: Date
})


commentSchema.pre('save', (next) => {
  if (!this.created) {
    this.created = new Date
    next()
  }
})
module.exports = mongoose.model('Comment', commentSchema)
