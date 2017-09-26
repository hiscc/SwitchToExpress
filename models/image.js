const mongoose = require('mongoose')
const Schema = mongoose.Schema

let imageSchema = new Schema({
  name: String,
  url: String,
  auther: {type: Schema.Types.ObjectId, ref: 'User'},
  create_time: {type: Date, default: new Date()}
})

module.exports = mongoose.model('Image', imageSchema)
