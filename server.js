const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const path = require("path");
const nodemailer = require("nodemailer");
const { type } = require("os");
const { send } = require("process");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

const http = require("http");
const {Server} = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);


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

const annoncementschema = new mongoose.Schema({
    message:{type:String,required:true},
    createdAt:{type:Date,default:Date.now},
    author:{type:String,default:"legal_officer"}
});

const Announcement = mongoose.models.Announcement || mongoose.model("Announcement",annoncementschema);

const userSchema = new mongoose.Schema({
    username:{type:String},
    
    email:{type:String, unique:true, required:true},

    dob : {type:String},

    gender : {type:String},

    address : {type:String},

    aadhar : {type:String},
    
    password:{type:String,required:true},
    
    role:{type:String,required:true},

    subRole:{type:String},

    manrole : {type:String},
    
    phone:{type:String, required: true},

    vehnum : {type:String},

    vehregnum : {type:String},

    age: {type:String},
    
    otp:{type:String,required:false},
    
    otpExpires:Date,



});


const User = mongoose.model("User",userSchema);

const mailer = nodemailer.createTransport({
    service:"gmail",
    auth: {
        user:"yogeshsuryagm@gmail.com", //ourgmail
        pass:"asiq csdb gjhs ocre",  //ourgmailpassword
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
app.post("/login/basic", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        console.log("Login attempt email:", email);

        if (!user) {
            console.log("User not found");
            return res.send("User Not Found.");
        }

        console.log("Password entered:", password);
        console.log("Password in DB:", user.password);

        if (user.role !== "user" && user.role !== "serviceprovider") {
            return res.send("Unauthorized login page!");
        }

        if (password !== user.password) {
            return res.send("Invalid Password!!");
        }

        req.session.userId = user._id;
        res.redirect("/");
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("Server error during login.");
    }
});

////lohin advanced
let otpstore = {};
//login adv, send-otp
app.post("/login/advanced" , async (req,res) => {
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if (!user) return res.send("User Not Found.");

    if (user.role !== "legal_officer" && user.role !== "management")
        return res.send("Unauthorized login page!!");

    if ( password !== user.password)
        return res.send("Invalid Password!");

    const otp = Math.floor(100000 + Math.random()*900000).toString();

    otpstore[email] = {
        otp,
        otpExpires: Date.now() + 3 *60 *1000 //2min
        };

    await mailer.sendMail({
        from:"Tirth Darshanam",
        to:user.email,
        subject: "Tirth-Darshanam Login OTP Code",
        text:`Hello ${user.username},\n\nYour Login OTP is:${otp}\nValid for 2 Minutes.`,

    });

    res.send("OTP has been sent to  your email!");
    console.log("OTP generated for:", email, "->", otp);

    
});

/////login advanced verify otp

app.post("/login/advanced/verify-otp" , async (req,res) => {
    const {email,otp} = req.body;

    const user = await User.findOne({ email });

    const record = otpstore[email];
    if(!record) return res.status(400).send("OTP expired, Try Again..");

    if(Date.now() > record.otpExpires){
        delete otpstore[email];
        return res.status(400).send("OTP expired, Try Again..");
    }

    if(record.otp !== otp ) return res.status(400).send("Invalid OTP!");

    if(!user) return res.status(400).send("User Not Found!");

    req.session.userId = user._id;
    delete otpstore[email];

    console.log("Verifying OTP for:", email, "record:", record);

    res.send("Login successful !");
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

app.get("/register/legal_officer", (req, res) => {
    res.render(`legal_officerregister`);
});

app.get("/register/management", (req, res) => {
    res.render(`managementregister`);
});




// ----------------- Registration Routes -----------------
const otpStore = {}; // temporary OTP storage

// Send OTP
app.post("/register/send-otp", async (req, res) => {
    try {
        const { username, email, password, role, phone, dob, gender, manrole,subRole } = req.body;
        if (!email || !password || !role) return res.status(400).send("Required fields missing!");

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).send("User already exists!");

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP with data
        otpStore[email] = {
            otp,
            data: { username, email, password, role, phone, dob, gender, manrole,subRole },
            otpExpires: Date.now() + 2 * 60 * 1000, // 2 minutes
            verified: false
        };

        // Send OTP via email
        await mailer.sendMail({
            from: "Tirth Darshanam",
            to: email,
            subject: "OTP Verification Code",
            text: `Hello ${username},\nYour OTP is: ${otp}\nValid for 2 minutes.`
        });

        console.log("OTP sent for", email, ":", otp);
        res.send("OTP sent on your email!");
    } catch (err) {
        console.error("Send OTP error:", err);
        res.status(500).send("Failed to send OTP");
    }
});

// Verify OTP
app.post("/register/verify-otp",(req, res) => {
    try {
        const { email, otp } = req.body;
        const record = otpStore[email];

        if (!record) return res.status(400).send("OTP expired or not found");
        if (Date.now() > record.otpExpires) {
            delete otpStore[email];
            return res.status(400).send("OTP expired. Try again.");
        }
        if (record.otp !== otp) return res.status(400).send("Invalid OTP!");

        // Mark verified
        record.verified = true;
        res.send("OTP Verified! Now complete registration.");
    } catch (err) {
        console.error("Verify OTP error:", err);
        res.status(500).send("OTP verification failed");
    }
});

// Complete Registration
app.post("/register/complete", async (req, res) => {
    
    try {
        console.log("bodyreceived:",req.body);
        const { email } = req.body;
        if (!email) return res.status(400).send("Email is required!");

        const record = otpStore[email];
        if (!record || !record.verified) return res.status(400).send("OTP verification required!");

        const data = record.data;

        // Build user object
        const newUserData = {
            username: data.username,
            email: data.email,
            password: data.password,
            role: data.role,
            phone: data.phone,
            dob: data.dob,
            gender: data.gender,
        };

        // Role fields
        if (data.role === "management") newUserData.manrole = data.manrole;
        if (data.role === "serviceprovider") {
            newUserData.vehnum = data.vehnum;
            newUserData.vehregnum = data.vehregnum;
            newUserData.aadhar = data.aadhar;
        }
        if(data.role === "legal_officer") newUserData.subRole = data.subRole;

        // Save user
        const newUser = new User(newUserData);
        await newUser.save();

        // Remove OTP record
        delete otpStore[email];

        res.send("Registered Successfully!");
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).send("Registration failed: " + err.message);
    }
});





app.get("/",isloggedin,async(req,res) =>{
     
    const user = await User.findById(req.session.userId);
    
    if (!user){
        req.session.destroy();
        return res.redirect("/home");
    }
    
    
    switch(user.role){
        case "user":
            return res.render("user_interface",{user});
        case "serviceprovider":
            return res.render("Service_interface",{user});
        case "legal_officer":
            return res.render("planing_interface",{user});
        case "management":
            return res.render("planing_interface",{user});
        default:
            return res.redirect("/home");
    }
});

let forgotpassStore = {};
///forgot pass 
app.get("/forgotpass", (req,res) => {
    res.render("forgotpass");
});

app.post("/forgotpass/send-otp", async (req,res) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) return res.status(400).send("Username not found!");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    forgotpassStore[email] = {
        otp,
        otpExpires: Date.now() + 2 * 60 *1000,  //2min
        email:user.email
    };

    await mailer.sendMail({
        from:"Tirth Darshanam",
        to:user.email,
        subject: "Password Reset OTP",
        text: `Hello \n\nYour OTP is:${otp}\nValid for 2 minutes.`
    });
    res.send("OTP Sent to your registered email!");
});

app.post("/forgotpass/verify-otp", async (req,res) => {
    const {email,otp,password} = req.body;
    const record = forgotpassStore[email];

    if(!record) return res.status(400).send("OTP expired, Try Again.");
    if(record.otp !== otp) return res.status(400).send("Invalid OTP");
    if(Date.now() > record.otpExpires){
        delete forgotpassStore[email];
        return res.status(400).send("OTP Expired, Try Again.");
    }
    res.send("OTP Verified!");

});

app.post("/forgotpass/reset-pass", async(req,res) => {
    const {email,password} = req.body;
    const record = forgotpassStore[email];

    if(!record) return res.status(400).send("OTP verification required!");
    
    await User.findOneAndUpdate({email},{password : password});
    delete forgotpassStore[email];

    res.send("Password Reset successfully!");

    
});

io.on("connection", (socket) => {
    console.log("A user connected:",socket.id);

    ///alerts listeniing
    socket.on("newAlert" , async (message) => {
        if(!message) return;

        const announcement = await Announcement.create({ message });

        io.emit("alertReceived", announcement);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
    });
    
});

app.get("/logout" , (req,res) => {
    req.session.destroy(() => res.redirect("/home"));
});

server.listen(3000,() => {
    console.log("server listening on port 3000");
});

