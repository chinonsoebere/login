require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
//password encryption strategy
const bcrypt = require("bcrypt");
const saltRound = 10;



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});


const User = mongoose.model("User", userSchema);

app.route('/')
  .get((req, res) => {
    res.render("home");
  })
  .post((req, res) => {

  })

app.route('/login')
  .get((req, res) => {
    res.render('login');
  })
  .post((req, res) => {
    const username = req.body.username;
    const password = req.body.password
    User.findOne({
      email: username
    }, (err, foundUser) => {
      if (!err) {
        if (foundUser) {
          bcrypt.compare(password, foundUser.password, (err, result) => {
            if (result === true) {
              res.render('secrets');
              console.log('User logged in')
            } else {
              console.log(err)
            }

          });
        }
      } else {
        console.log(err)
      }
    });
  })

app.route('/register')
  .get((req, res) => {
    res.render('register');
  })
  .post((req, res) => {
    bcrypt.hash(req.body.password, saltRound, (err, hash) => {

      if (!err) {
        const newUser = new User({
          email: req.body.username,
          password: hash
        });
        newUser.save((err) => {
          if (!err) {
            res.render('secrets');
            console.log('new user created')
          }
        });
      } else {
        console.log(err);
      };

    });

  });

app.listen(3000, () => {
  console.log("Server started on port 3000")
})
