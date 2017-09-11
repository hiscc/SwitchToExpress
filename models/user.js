const mongoose = require('mongoose')
const Schema = mongoose.Schema()
var bcrypt   = require('bcrypt-nodejs')

const userSchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  password: String,
  github           : {
      id           : String,
      profile        : String,
      email        : String,
      username         : String
  }
})

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};
module.exports = mongoose.model('User', userSchema)
