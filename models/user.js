const mongoose = require('mongoose')
const Schema = mongoose.Schema()

const userSchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  password: String
})

module.exports = mongoose.model('User', userSchema)
