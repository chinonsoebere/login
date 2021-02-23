
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const encrypt = require("mongoose-encryption")



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

//check .env file for the SECRET variable
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

const User = mongoose.model("User", userSchema);

app.route('/')
.get((req,res)=>{
  res.render("home");
})
.post((req,res)=>{

})

app.route('/login')
.get((req,res)=>{
  res.render('login');
})
.post((req,res)=>{
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({email: username},(err,foundUser)=>{
    if(!err){
      if(foundUser.password === password){
        res.render('secrets');
        console.log('User logged in')
      }
    }else{
      console.log(err)
    }
  });
})

app.route('/register')
.get((req,res)=>{
  res.render('register');
})
.post((req,res)=>{
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save((err)=>{
    if(!err){
      res.render('secrets');
      console.log('new user created')
    }
  })
})

app.listen(3000,()=>{
  console.log("Server started on port 3000")
})