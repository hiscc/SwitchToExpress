var express = require('express')
var router = express.Router()
var User = require('../models/user')
var passport = require('passport')
/* GET users listing. */
router
  .get('/login', (req, res) => {
    res.render('login', {message: 'login'})
  })
  .post('/login', (req, res) => {
    let name = req.body.name
    let password = req.body.password
    User.findOne({name: name}, (err, user) => {
      if (err) {
        res.render('login', {message: err})
      }
      if (!user) {
        res.render('login', {message: 'user does not exist'})
      } else {
        if (user.password === password) {
          req.session.user = user
          console.log(req.session);
          res.redirect('/posts')
        } else {
          res.render('login', {message: 'wrong password'})
        }
      }
    })
  })
  .get('/profile', (req, res) => {
    res.render('profile',{user: req.user})
  })
  .get('/signup', (req, res) => {
    res.render('login', {message: 'please signup'})
  })
  .post('/signup', (req, res) => {
    if (!req.body.name || !req.body.password) {
      res.render('login', {message: 'please enter name and password'})
    } else {
      User.findOne({name: req.body.name}, (err, user) => {
        if (user) {
          res.render('login', {message: 'user exist'})
        } else {
          let newUser = new User({name: req.body.name, password: req.body.password})
          newUser.save((err) => {
            if (err) {
              console.log(err);
              res.render('login', {message: 'db can not save'})
            } else {
                req.session.user = newUser
                res.redirect('/posts')
            }
          })
        }
      })
    }
  })

  .get('/logout', (req, res) => {
    req.logout()
    req.session.destroy(() => {
      res.render('login', {message: 'logout'})
    })
  })




module.exports = router;
