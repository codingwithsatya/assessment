const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require("mongoose");
require('dotenv').config();

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID, 
//     clientSecret:  process.env.GOOGLE_CLIENT_SECRET, 
//     callbackURL: "http://localhost:3000/auth/google/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     done(null, profile)
//   }
// ));

const User = mongoose.model('User', { email: String, password: String });

// Google authentication setup
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Handle the Google authentication callback
    // Check if the user exists in the database, create a new user if not
    // console.log(profile._json.email, 'p')
    const user = await User.findOne({ email: profile._json.email });
    console.log(user)

    if (!user) {
      const newUser = new User({ email: profile._json.email });
      await newUser.save();
      return done(null, newUser);
    } else {
      return done(null, user);
    }
  } catch (err) {
    return done(err);
  }
}));


passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

