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
    email:{type:String, unique:true},
    password:String,
    role:String,
    otp:String,
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



//login form
app.get("/login/:role",(req,res)=>{
    const role = req.params.role;
    res.render('${role}login');
});


//login
app.post("/login/basic", async (req,res) => {
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if (!user) return res.send("User Not Found");

    if (user.role !== "user" && user.role !== "serviceprovider")
        return res.send("Invalid Password");

    


    

});
app.get("/reister/:role",(req,res) => {
    const role = req.params.role;
    res.render('${role}register');
});




////otp send
app.post("/register/send-otp", async (req,res) => {
    const {username,email,password,} = req.body;


    //double registration
    const existingUser = await User.findOne({email});
    if (existingUser) return res.status(400).send("User already exists!!");

    const otp = Math.floor(100000 + Math.random()*900000).toString();

    //temp save
    let otpstore = {};

    otpstore[email]=
    {
        otp,
        data:{ username,email,password,role,  },
        otpExpires:Date.now() + 2*60*1000  //2min
    };

    
    
    
    //now send otp
    await mailer.sendMail({
        from:"ourmail@gmail.com",
        to:email,
        subject: "Tirth-Darshanam OTP Verification Code",
        text:'Hello ${username},\n\nYour OTP is:${otp}\nValid for 3 Minutes.',

    });

    res.send("OTP sent on your email..!");
});

//verify OTP
app.post("/register/verify-otp", async(req,res) => {
    const {email,otp} = req.body;
    const record = otpstore[email];

    if(!record) return res.status(400).send("OTP expired. Try again");
    if(record.otp !== otp) return res.status(400).send("Invalid OTP!");
    if(Date.now() > record.otpExpires){
        delete otpstore[email];
        return res.status(400).send("OTP expired, Try again..");
    }

    const hashedpassword = await bcrypt.hash(record.data.password,10);

    const newUser = new User({
        username: record.data.username,
        email: record.data.email,
        password: hashedpassword,
        role: record.datya.role,



    });

    await newUser.save();

    //delete temp
    delete otpstore[email];

    res.send("Registration Successful!");

});



app.listen(3000,() => {
    console.log("server listening on port 3000");
});