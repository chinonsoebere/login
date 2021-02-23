require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//initialize session
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
  //cookie: {secure: true}
}));

//initialize passport to manage the sessions
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
mongoose.set('useCreateIndex', true);


const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.route('/')
  .get((req, res) => {
    res.render("home");
  })
  .post((req, res) => {

  })

  app.route('/register')
    .get((req, res) => {
      res.render('register');
    })
    .post((req, res) => {
      User.register({
        username: req.body.username
      }, req.body.password, (err, user) => {
        if (!err) {
          passport.authenticate('local')(req, res, () => {
            res.redirect('/secrets')
          })
        } else {
          console.log(err);
          res.redirect('/register')
        }
      })
    });

app.route('/login')
  .get((req, res) => {
    res.render('login');
  })
  .post((req, res) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password
    })
    req.login(user, function(err){
      if(!err){
        passport.authenticate('local')(req, res, () => {
          res.redirect('/secrets')
        })
      }else{

      }
    })
  });

app.route('/logout')
.get((req,res)=>{
  req.logout();
  res.redirect('/');
})


app.route('/secrets')
  .get((req, res) => {
    if (req.isAuthenticated()) {
      res.render('secrets');
      console.log('new user registered');
    } else {
      res.redirect('/login');
    }
  });

app.listen(3000, () => {
  console.log("Server started on port 3000")
})
