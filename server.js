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
const fs = require("fs");

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
const imageSchema = new mongoose.Schema({
  data: { type: Buffer, required: true },
  contentType: { type: String, required: true }
});


const userSchema = new mongoose.Schema({
    username:{type:String},
    
    email:{type:String, unique:true, required:true},

    dob : {type:String},

    gender : {type:String},

    address : {type:String},

    aadhar : {type:String, required : function() {return this.role !== "user";}},
    
    password:{type:String,required:true},
    
    role:{type:String,required:true},

    subRole:{type:String,required: function(){return this.role === "legal_officer";}},

    manrole : {type:String,required: function(){return this.role === "management";}},
    
    phone:{type:String, required: true},
    
    imageid :{type:imageSchema, required: function() {return this.role !== "user"; }},

    vehnum : {type:String,required:function(){return this.role === "serviceprovider"}},

    vehregnum : {type:String,required:function(){return this.role === "serviceprovider"}},

    age: {type:String},
    
    otp:{type:String,required:true},
    
    otpExpires:Date,



});


const User = mongoose.model("User",userSchema);

const mailer = nodemailer.createTransport({
    service:"gmail",
    auth: {
        user:"yogeshsuryagm@gmail.com", //ourgmail
        pass:"kbhw artx aqea hxaq",  //ourgmailpassword
    }
    
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
    res.sendFile(path.join(__dirname, 'public', 'main_home.html'));
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
////lohin advanced
//login adv, send-otp
app.post("/login/advanced" , async (req,res) => {
    const {username,password} = req.body;
    const user = await User.findOne({username});
    if (!user) return res.send("User Not Found.");

    if (user.role !== "legal_officer" && user.role !== "management")
        return res.send("Unauthorized login page!!");

    if (!(await bcrypt.compare(password,user.password)))
        return res.send("Invalid Password!");

    const otp = Math.floor(100000 + Math.random()*900000).toString();

    otpstore[username] = {
        otp,
        otpExpires: Date.now() + 2 *60 *1000 //2min
        };

    await mailer.sendMail({
        from:"yogeshsuryagm@gmail.com",
        to:user.email,
        subject: "Tirth-Darshanam Login OTP Code",
        text:`Hello ${username},\n\nYour Login OTP is:${otp}\nValid for 2 Minutes.`,

    });

    res.send("OTP has been sent to  your email!");
    
});

/////login advanced verify otp

app.post("/login/advanced/verify-otp" , async (req,res) => {
    const {username,otp} = req.body;

    const user = await User.findOne({ username });

    const record = otpstore[username];
    if(!record) return res.status(400).send("OTP expired, Try Again..");

    if(Date.now() > record.otpExpires){
        delete otpstore[username];
        return res.status(400).send("OTP expired, Try Again..");
    }

    if(record.otp !== otp ) return res.status(400).send("Invalid OTP!");

    if(!user) return res.status(400).send("User Not Found!");

    req.session.userId = user._id;
    delete otpstore[username];

    res.send("Login successful !");
    res.redirect("/");
});




//reistrating form
//app.get("/register/:role", (req,res)=>{
    //const role = req.params.role;
  // res.render(`${role}register`);
//});


app.get("/register/user", (req, res) => {
    res.render(`userregister`);
});

app.get("/register/serviceprovider", (req, res) => {
    res.render(`serviceproviderregister`);
});



let otpstore = {};
let forgotpassStore = {};


////otp send
app.post("/register/send-otp", async (req,res) => {
    const {username,email,password,role,phone,subRole,manrole,aadhar,dob,gender,address,vehnum,vehregnum,age          } = req.body;


    //double registration prevention
    const existingUser = await User.findOne({email});
    if (existingUser) return res.status(400).send("User already exists!!");

    
    const otp = Math.floor(100000 + Math.random()*900000).toString();

    //temp save
   

    otpstore[email]=
    {
        otp,
        data:{ username,email,password,role,phone,subRole,manrole,aadhar,dob,gender,address,vehnum,vehregnum,age          },
        otpExpires:Date.now() + 2*60*1000  //2min
    };

    
    
    
    //now send otp
    try{
        await mailer.sendMail({
            from:"yogeshsuryagm@gmail.com",
            to:email,
            subject: "Tirth-Darshanam OTP Verification Code",
            text:`Hello ${username},\n\nYour OTP is:${otp}\nValid for 2 Minutes.`,

        });
        console.log("otp sent");
    }catch(err){
        console.error("error is",err);
        return res.status(500).send("Failed to send OTP email",err);
    }


    res.send("OTP sent on your email..!");
    });

//verify OTP
app.post("/register/verify-otp", async(req,res) => {
    const {email,otp} = req.body;
    const record = otpstore[email];

    if(!record) return res.status(400).send("OTP expired. Try again");
    if(record.otp !== otp) return res.status(400).send("Invalid OTP!");
    if (Date.now() > record.otpExpires){
       delete otpstore[email];
        return res.status(400).send("OTP expired, Try again.");
    }

    res.send("OTP Verified! Fill the required fields and press sign-up!");
});

app.post("/register/complete", upload.single("imageid"), async(req,res) => {
    
    const {email} = req.body;
    const record = otpstore[email];
    
    if (!record) return res.status(400).send("OTP Verification required!");
    
    const hashedpassword = await bcrypt.hash(record.data.password,10);

    let newUserdata ={
        username : record.data.username,
        email : record.data.email,
        password : hashedpassword,
        role : record.data.role,
        dob : record.data.dob,
        gender : record.data.gender,
        phone : record.data.phone,
        aadhar : record.data.aadhar || null,
        address : record.data.address || null,
        subRole : record.data.subRole || null,
        manrole : record.data.manrole || null,
        vehnum : record.data.vehnum || null,
        vehregnum : record.data.vehregnum || null,
        age : record.data.age || null


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
        case "management":
            return res.render("managementDashboard",{user});
        default:
            return res.redirect("/home");
    }
});


///forgot pass 
app.get("/forgotpass", (req,res) => {
    res.render("forgotpass");
});

app.post("/forgotpass/send-otp", async (req,res) => {
    const {username} = req.body;
    const user = await User.findOne({username});
    if(!user) return res.status(400).send("Username not found!");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    forgotpassStore[username] = {
        otp,
        otpExpires: Date.now() + 2 * 60 *1000,  //2min
        email:user.email
    };

    await mailer.sendMail({
        from:"our@gmai.com",
        to:user.email,
        subject: "Password Reset OTP",
        text: `Hello ${username},\n\nYour OTP is:${otp}\nValid for 2 minutes.`
    });
    res.send("OTP Sent to your registered email!");
});

app.post("/forgotpass/verify-otp", async (req,res) => {
    const {username,otp,password} = req.body;
    const record = forgotpassStore[username];

    if(!record) return res.status(400).send("OTP expired, Try Again.");
    if(record.otp !== otp) return res.status(400).send("Invalid OTP");
    if(Date.now() > record.otpExpires){
        delete forgotpassStore[username];
        return res.status(400).send("OTP Expired, Try Again.");
    }

    const hashedpassword = await bcrypt.hash(password,10);
    await User.findOneAndUpdate({username},{password : hashedpassword});
    delete forgotpassStore[username];

    res.send("Password reset successfully!");

});

app.get("/logout" , (req,res) => {
    req.session.destroy(() => res.redirect("/home"));
});

app.listen(3000,() => {
    console.log("server listening on port 3000");
});

