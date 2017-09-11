
var githubStrategy = require('passport-github2').Strategy
var User = require('../models/user')
var app = require('express')()
var configAuth = require('../auth')

module.exports = function (passport) {
  passport.serializeUser(function(user, done) {
       done(null, user.id);
   });

   // used to deserialize the user
   passport.deserializeUser(function(id, done) {
       User.findById(id, function(err, user) {
           done(err, user);
       });
   });


   passport.use(new githubStrategy({

       clientID        : configAuth.githubAuth.clientID,
       clientSecret    : configAuth.githubAuth.clientSecret,
       callbackURL     : configAuth.githubAuth.callbackURL,

   },
   function(token, refreshToken, profile, done) {

       // make the code asynchronous
       // User.findOne won't fire until we have all our data back from Google
       process.nextTick(function() {

           // try to find the user based on their google id
           console.log(profile);
           User.findOne({ 'github.id' : profile.id }, function(err, user) {
               if (err)
                   return done(err);

               if (user) {

                 // set all of the relevant information
                   return done(null, user);
               } else {
                   // if the user isnt in our database, create a new user
                   var newUser          = new User();

                   // set all of the relevant information
                   newUser.github.id    = profile.id;
                   newUser.github.profile = profile.profileUrl;
                   newUser.github.name  = profile.userName;
                   newUser.github.email = profile.emails[0].value;

                   newUser.save(function(err) {
                       if (err)
                           throw err;
                       return done(null, newUser);
                   });
               }
           });
       });

   }));

}
