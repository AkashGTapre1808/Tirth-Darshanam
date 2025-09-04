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

    let body,options;

    if (currentrole !== "user"){
        body = new FormData(form);
        body.append("role",currentrole);
        if (currentrole === "legal_officer"){
            const subrole = form.subrole.value;
            body.append("subRole",subrole);
        
        }
        if(currentrole === "management"){
            const manrole= form.manrole.value;
            body.append("manrole",manrole);
        }
        options = {method: "POST", body};
    } else {
        const formdata = new FormData(form);
        body = Object.fromEntries(formdata);
        body.role = currentrole;
        options = {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(body)
        };
    }
    const res = await fetch("/register/send-otp",options);
    const msg = await res.text();
    alert(msg);
    if (res.ok) otpsection.style.display = "block";

});



///otp verify

verifybtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const otp = document.getElementById("otpinput").value;
    const email = form.email.value;
    if(currentrole !== "user"){
        body = new FormData(form);
        body.append("otp",otp);
        options = {method: "POST" , body};
    }else{
        body = {email,otp};
        options = {
            method: "POST",
            headers:{"Content-Type": "application/json"},
            body: JSON.stringify(body)
        };
    }

    const res = await fetch("/register/verify-otp", options);
    const msg = await res.text();
    alert(msg);

    if(msg.includes("OTP Verified")) {
        otpsection.style.display = "none";
        signupbtn.style.display = "inline-block";
        
    }

});

signupbtn.addEventListener("click", async (e) =>{
    e.preventDefault();
    const email = form.email.value;
    const otp = document.getElementById("otpinput").value;

    let body,options;

    if(currentrole !== "user"){
        body = new FormData(form);
        body.append("otp",otp);
        options = {method: "POST" , body};
    }else{
        body = {email,otp};
        options = {
            method: "POST",
            headers:{"Content-Type": "application/json"},
            body: JSON.stringify(body)
        };
    }
     const res = await fetch("/register/complete",options);
     const msg = await res.text();

     if(msg.includes("Registered")){
        if (currentrole === "user"){window.location.href = "/login/user";}
        if (currentrole === "serviceprovider"){window.location.href = "/login/serviceprovider";}
        if (currentrole === "legal_officer"){window.location.href = "/login/legal_officer";}
        if (currentrole === "management"){window.location.href = "/login/management";}
     }
});
if(currentrole !== "user"){
const image = document.getElementById("imageid");
image.addEventListener("change", () => {
    const file = image.files[0];
    if(file && file.size > 2 * 1024 * 1024){
        alert("File is too large! Maximum 2MB is allowed.");
        image.value = ""; ///destroy file

    }
});
}