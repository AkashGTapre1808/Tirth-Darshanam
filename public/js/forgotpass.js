const form = document.getElementById("forgotpassform");
const sendotpbtn = document.getElementById("sendotp");

const otpsection = document.getElementById("otpsection");
const verifybtn = document.getElementById("verifyotp");

const resetpassbtn = document.getElementById("resetpassword");
const newpasssection = document.getElementById("newpass-section");

let forgotstore = {};

sendotpbtn.addEventListener("click", async(e) => {
    e.preventDefault();
    const email = form.email.value;
    body = {email};
    const res = await fetch("/forgotpass/send-otp", {
        method: "POST",
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });

    const msg = await res.text();
    alert(msg);

    if(res.ok) otpsection.style.display = "block";
});


verifybtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = form.email.value;
    const otp = document.getElementById("otp").value;
    
    const body = {email,otp};
    if(!otp) return alert("Enter OTP");
    
    const res = await fetch("/forgotpass/verify-otp", {
        method: "POST",
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });
    const msg = await res.text();
    alert(msg);
    if(res.ok && msg.includes("OTP Verified")){
        newpasssection.style.display="block";
    } 

});

resetpassbtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const password = document.getElementById("newpassword").value;
    const confirmPassword = document.getElementById("confirmpass").value;

    if(!password || !confirmPassword) return alert("Ennter new password.");
    if (password !== confirmPassword) return alert("password do not match!");

    const res = await fetch("/forgotpass/reset-pass" , {
        method: "POST",
         headers:{"Content-Type": "application/json"},
        body: JSON.stringify({email,password})
    });

    const msg = await res.text();
    alert(msg);

    if (res.ok) window.location.href = "/";
});