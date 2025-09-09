const form = document.getElementById("registerform");
const sendotpbtn = document.getElementById("sendotp");
const otpsection = document.getElementById("otpsection");
const verifybtn = document.getElementById("otp_v");
const signupbtn = document.getElementById("signup");

let currentrole = form.dataset.role;
console.log("register.js loaded"); // checks if the JS file is being loaded

sendotpbtn.addEventListener("click", async (e) => {
    e.preventDefault();
     document.getElementById("otpinput");

    const fkpass = form.fkpass.value;
    const password = form.password.value;
    if(fkpass !== password ){
        alert("Password do not match!");
        return;
    }


    const body = Object.fromEntries(new FormData(form));
    body.role="user";

    const res = await fetch("/register/send-otp",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });
    const msg = await res.text();
    alert(msg);
    if(res.ok) otpsection.style.display = "block";


});



///otp verify

verifybtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const otp = document.getElementById("otpinput").value;
    const email = form.email.value;

    let body = {email,otp};
    
    const res = await fetch("/register/verify-otp", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });
    const msg = await res.text();
    alert(msg);

    if(msg.includes("OTP Verified")) {
        otpsection.style.display = "none";
        signupbtn.style.display = "inline-block";
        
    }

});

signupbtn.addEventListener("click", async (e) =>{
    e.preventDefault();
   
    const password = form.password.value;
    const body = {email:form.email.value, otp:document.getElementById("otpinput").value,password};
    const res = await fetch("/register/complete",{
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });
    const msg = await res.text();
    alert(msg);
    if(msg.includes("Registered"))window.location.href="/login/user";

});