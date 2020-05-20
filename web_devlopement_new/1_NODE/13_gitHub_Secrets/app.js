require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5"); // for hashing
// const bcryptjs = require("bcryptjs");
// const saltRounds = 15;

const app = express();


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(session({
  secret : "Our little secret",
  resave : false,
  saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());


//connecting to the database
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser : true, useUnifiedTopology:true});
//for removing deprication error
mongoose.set("useCreateIndex", true);

//creating a schema
const userSchema = new mongoose.Schema({
  email : String,
  password : String
});


userSchema.plugin(passportLocalMongoose);

//encrypting our key
// userSchema.plugin( encrypt, { secret: process.env.SECRET , encryptedFields : ["password"] } );

//creating a model
const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

//after the model creation
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

app.get("/secrets", function(req,res){
    if(req.isAuthenticated()){
      res.render("secrets");
    } else {
       res.redirect("/login");
    }
});

app.get("/logout", function(req,res){
   //deauthneticating our userDB
   req.logout();
   res.redirect("/");
});

//handling all the post request
app.post("/register", function(req,res){

    User.register( {username : req.body.username}, req.body.password, function(err,user){
      if(err){
        console.log(err);
        res.render("/register");
      } else {
        passport.authenticate("local")(req, res, function(){
           res.redirect("/secrets");
        });
      }
    });
});

app.post("/login", function(req,res){

    const user = new User({
      username : req.body.username,
      password : req.body.password
    });

    req.login(user, function(err){
      if(err){
        console.log(err);
      } else {
         passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets");
         });
      }
    });
});


app.listen(3000, function(){
  console.log("Server Started on port 3000");
});
