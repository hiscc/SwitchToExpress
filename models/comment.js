const mongoose = require('mongoose')
const Schema = mongoose.Schema

var commentSchema = mongoose.Schema({
  body: {type: String},
  auther: {type: Schema.Types.ObjectId, ref: 'User'},
  post: {type: Schema.Types.ObjectId, ref: 'Post'},
  updated_at: { type: Date, default: Date.now },
})


// commentSchema.pre('save', (next) => {
//   if (!this.created) {
//     this.created = new Date
//     next()
//   }
// })

module.exports = mongoose.model('Comment', commentSchema)
