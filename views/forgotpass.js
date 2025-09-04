const form = document.getElementById("forgotpassform");
const sendotpbtn = document.getElementById("submit");
const otpsection = document.getElementById("otpsection");
const verifybtn = document.getElementById("verifyotp");

let forgotstore = {};

sendotpbtn.addEventListener("click", async(e) => {
    e.preventDefault();
    const username = form.username.value;
    body = {username};
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
    const username = form.username.value;
    const otp = document.getElementById("otpinput").value;
    const password = document.getElementById("newpassword").value;
    const body = {username,otp,password};
    
    
    const res = await fetch("/forgotpass/verify-otp", {
        method: "POST",
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });
    const msg = await res.text();
    alert(msg);
    if(res.ok) window.location.href = "/home";

});