const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const path = require("path");
const nodemailer = require("nodemailer");
const { type } = require("os");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

//middleware

app.use(
    session({
        secret:"secret key",
        resave:false,
        saveUninitialized:false,
    })
);

//mongodb

mongoose.connect("mongodb://localhost:27017/tirthdarshanam")
.then(()=> console.log("mongodb connected"))
.catch((err) => console.error(err));

//user schema

const userSchema = new mongoose.Schema({
    username:String,
    email:{type:string,unique:true},
    password:String,
    otp:string,
    otpExpires:Date,



});


const User = mongoose.model("User",userSchema);

const mailer = nodemailer.createTransport({
    service:"gmail",
    auth: {
        user:"ouremail@gmail.com", //ourgmail
        pass:"app password",  //ourgmailpassword
    },
});

//middle check

function isloggedin(req,res,nest){
    if (!req.session.userId) return res.redirect("/home");
    next();
}

//home
app.get("/home",(req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});



//reistrating form
app.get("/registration/:role",(req,res)=>{
    const role = req.params.role;
    res.render('${role}register');
});






app.listen(3000,() => {
    console.log("server listening on port 3000");
});