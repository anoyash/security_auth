require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
//for hashing
// const md5 = require("md5"); // for hashing
const bcryptjs = require("bcryptjs");
const saltRounds = 15;

const app = express();


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//connecting to the database
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser : true , useUnifiedTopology:true});

//creating a schema
const userSchema = new mongoose.Schema({
  email : String,
  password : String
});

//encrypting our key
// userSchema.plugin( encrypt, { secret: process.env.SECRET , encryptedFields : ["password"] } );

//creating a model
const User = mongoose.model("User", userSchema);

//handling get request
app.get("/", function(req,res){
  res.render("home");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.get("/register", function(req,res){
  res.render("register");
});

//handling all the post request
app.post("/register", function(req,res){

  bcryptjs.hash(req.body.password, saltRounds, function(err,hash){

    const newUser = new User({
      email :req.body.username,
      password : hash
    });

    newUser.save(function(err){
       if(err){
         console.log(err);
       } else {
         res.render("secrets");
       }
    });
  });
});

app.post("/login", function(req,res){

    const username = req.body.username;
    const password = req.body.password;

    User.findOne( {email : username}, function(err,foundUser){
       if(err){
         console.log(err);
       } else {
          if(foundUser) {
            bcryptjs.compare(password, foundUser.password, function(err,result){
              if(result === true)
              res.render("secrets");
      });
     }
    }
  });
});


app.listen(3000, function(){
  console.log("Server Started on port 3000");
});
