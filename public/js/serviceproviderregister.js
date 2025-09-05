const form = document.getElementById("registerform");
const sendotpbtn = document.getElementById("sendotp");
const otpsection = document.getElementById("otpsection");
const verifybtn = document.getElementById("otp_v");
const signupbtn = document.getElementById("signup");


sendotpbtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const fkpass = form.fkpass.value;
    const password = form.password.value;
    if (fkpass !== password) {
        alert("Passwords do not match!");
        return;
    }

    const body = {
        username: form.username.value,
        email: form.email.value,
        password: form.password.value,
        role: "serviceprovider",
        phone: form.phone.value,
        dob: form.dob.value,
        gender: form.gender.value,
        aadhar: form.aadhar.value,
        vehnum: form.vehnum.value,
        vehregnum: form.vehregnum.value,
        
    };

    try {
        const res = await fetch("/register/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const msg = await res.text();
        alert(msg);
        if (res.ok) otpsection.style.display = "block";
    } catch (err) {
        console.error(err);
        alert("Failed to send OTP.");
    }
});

// -------------------- Verify OTP --------------------
verifybtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const otp = document.getElementById("otpinput").value;
    const email = form.email.value;

    try {
        const res = await fetch("/register/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp })
        });
        const msg = await res.text();
        alert(msg);
        if (msg.includes("OTP Verified")) {
            otpsection.style.display = "none";
            signupbtn.style.display = "inline-block";
        }
    } catch (err) {
        console.error(err);
        alert("Failed to verify OTP.");
    }
});

// -------------------- Complete Registration --------------------
signupbtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const body = {
    username: form.username.value,
    email : form.email.value,
    password :form.password.value,
    role: "serviceprovider",
    phone: form.phone.value,
    dob: form.dob.value,
    gender: form.gender.value,
    aadhar: form.aadhar.value,
    vehnum : form.vehnum.value,
    vehregnum: form.vehregnum.value,
    otp : document.getElementById("otpinput").value
    };

    try {
        const res = await fetch("/register/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const msg = await res.text();
        alert(msg);
        if (msg.includes("Registered")) window.location.href = "/login/serviceprovider";
    } catch (err) {
        console.error(err);
        alert("Registration failed.");
    }
});
