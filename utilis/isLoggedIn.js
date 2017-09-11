module.exports = function(req, res, next){
  if (req.session.user || req.path == '/' || req.isAuthenticated()) {
    next()
  } else {
    res.redirect('/user/login')
  }
}
