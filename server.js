const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const path = require("path");
const nodemailer = require("nodemailer");
const { type } = require("os");
const { send } = require("process");
const multer = require("multer");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));


//img
const storage = multer.memoryStorage();
const upload = multer({
    storage, 
    limits: {fileSize: 2*1024*1024},//max 2mb
    fileFilter : (req,file,cb) => {
        const allowed=["image/jpeg","image/png"];
        if(!allowed.includes(file.mimetype)){
            cb(new Error("Only JPEG and PNG images are allowed!"));
        } else {
            cb(null,true);
        }
    }
});

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
    
    email:{type:String, unique:true, required:true},
    
    password:{type:String,required:true},
    
    role:{type:String,required:true},
    
    phone:{type:String, required: function(){return this.role !== "user" }},
    
    imageid :{data:{type: Buffer,contentType: String }, required: function() {return this.role !== "user"; }},
    
    otp:{type:String,required:true},
    
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

function isloggedin(req,res,next){
    if (!req.session.userId) return res.redirect("/home");
    next();
}


function removeNull(obj){
    return Object.fromEntries(
        Object.entries(obj).filter(([__,v]) => v != null)
    );
}
//home
app.get("/home",(req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

//login form
app.get("/login/:role" , (req,res) => {
    const role = req.params.role;
    res.render(`${role}login`);
});

//logging in
app.post("/login/basic" , async (req,res) => {
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(!user) return res.send("User Not Found.");

    if(user.role !== "user" && user.role !== "serviceprovider")
        return res.send("Unauthorized login page!");

    if (!(await bcrypt.compare(password, user.password)))
        return res.send("Invalid Password!!");

    req.session.userId = user._id;
    res.redirect("/");
});

app.post("/login/advanced" , async (req,res) => {
    const {email,password,} = req.body;
    const user = await User.findOne({email});
    if (!user) return res.send("User Not Found.");

    if (user.role !== "legal_officer" && user.role !== "gov_official")
        return res.send("Unauthorized login page!!");

    if (!(await bcrypt.compare(password,user.password)))
        return res.send("Invalid Password!");

    req.session.userId = user._id;
    res.redirect("/");
});


//reistrating form
app.get("/register/:role",(req,res)=>{
    const role = req.params.role;
    res.render(`${role}register`);
});

let otpstore = {};


////otp send
app.post("/register/send-otp", async (req,res) => {
    const {username,email,password,role,phone,  } = req.body;


    //double registration prevention
    const existingUser = await User.findOne({email});
    if (existingUser) return res.status(400).send("User already exists!!");

    
    const otp = Math.floor(100000 + Math.random()*900000).toString();

    //temp save
   

    otpstore[email]=
    {
        otp,
        data:{ username,email,password,role,phone,      },
        otpExpires:Date.now() + 2*60*1000  //2min
    };

    
    
    
    //now send otp
    await mailer.sendMail({
        from:"ourmail@gmail.com",
        to:email,
        subject: "Tirth-Darshanam OTP Verification Code",
        text:`Hello ${username},\n\nYour OTP is:${otp}\nValid for 2 Minutes.`,

    });

    res.send("OTP sent on your email..!");
});

//verify OTP
app.post("/register/verify-otp",upload.single("imageid"), async(req,res) => {
    const {email,otp} = req.body;
    const record = otpstore[email];

    if(!record) return res.status(400).send("OTP expired. Try again");
    if(record.otp !== otp) return res.status(400).send("Invalid OTP!");
    if (Date.now() > record.otpExpires){
        delete otpstore[email];
        return res.status(400).send("OTP expired, Try again.");
    }
    const hashedpassword = await bcrypt.hash(record.data.password,10);

    let newUserdata ={
        username : record.data.username,
        email : record.data.email,
        password : hashedpassword,
        role : record.data.role,
        phone : record.data.phone || null,

    };

    if (record.data.role !== "user" ) {
        if(req.file){
            newUserdata.imageid = {
            data: req.file.buffer,
            contentType: req.file.mimetype,
        };} else{return res.status(400).send("Image is required!!");}
    }

    newUserdata = removeNull(newUserdata);

    const newUser = new User (newUserdata);

    await newUser.save();

    delete otpstore[email];


    res.send("Registered Successfully!");

});

app.get("/",isloggedin,async(req,res) =>{
     
    const user = await User.findById(req.session.userId);
    
    if (!user){
        req.session.destroy();
        return res.redirect("/home");
    }
    
    
    switch(user.role){
        case "user":
            return res.render("userDashboard",{user});
        case "serviceprovider":
            return res.render("serviceDashboard",{user});
        case "legal_officer":
            return res.render("legalDashboard",{user});
        case "gov_official":
            return res.render("govDashboard",{user});
        default:
            return res.redirect("/home");
    }
});

app.get("/logout" , (req,res) => {
    req.session.destroy(() => res.redirect("/home"));
});

app.listen(3000,() => {
    console.log("server listening on port 3000");
});