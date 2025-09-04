const form = document.getElementById("loginform");
const loginbtn = document.getElementById("loginbtn");
const otpsection = document.getElementById("otpsection");
const verifybtn = document.getElementById("verifyotp");


let currentUsername = "";

loginbtn.addEventListener("click", async(e) => {
    e.preventDefault();
    
    const formdata = new FormData(form);
    const body = Object.fromEntries(formdata);

    const res = await fetch("/login/advanced", {
        method: "POST",
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });

    const msg = await res.text;
    alert(msg);

    if(res.ok){
        currentUsername = body.username;
        otpsection.style.display = "block";
    }
});



verifybtn.addEventListener("click", async(e) => {
    e.preventDefault();

    const otp = document.getElementById("otpinput").value;

    const res = await fetch("/login/advanced/verify-otp", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username: currentUsername,otp})
    });

    const msg = await res.text();
    alert(msg);

    if(msg.includes("successful")){
        window.location.href = "/";
    }

});