const form = document.getElementById("registerform");
const sendotpbtn = document.getElementById("sendotp");
const otpsection = document.getElementById("otpsection");
const verifybtn = document.getElementById("otp_v");
const signupbtn = document.getElementById("signup");
const imageInput = document.getElementById("imageid"); // optional

// -------------------- Send OTP --------------------
sendotpbtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const fkpass = form.fkpass.value;
    const password = form.password.value;
    if (fkpass !== password) {
        alert("Passwords do not match!");
        return;
    }

    // Include named fields, including manrole
    const body = {
        username: form.username.value,
        email: form.email.value,
        password: form.password.value,
        role: "management",
        phone: form.phone.value,
        dob: form.dob.value,
        gender: form.gender.value,
        manrole: form.manrole.value
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

// -------------------- Complete Registration
signupbtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", form.username.value);
    formData.append("email", form.email.value);
    formData.append("password", form.password.value);
    formData.append("role", "management");
    formData.append("phone", form.phone.value);
    formData.append("dob", form.dob.value);
    formData.append("gender", form.gender.value);
    formData.append("manrole", form.manrole.value); 
    formData.append("otp", document.getElementById("otpinput").value);

    // optional image
    if (imageInput && imageInput.files[0]) {
        const file = imageInput.files[0];
        if (file.size > 2 * 1024 * 1024) {
            alert("File is too large! Max 2MB.");
            imageInput.value = "";
            return;
        }
        formData.append("imageid", file);
    }

    try {
        const res = await fetch("/register/complete", {
            method: "POST",
            body: formData
        });
        const msg = await res.text();
        alert(msg);
        if (msg.includes("Registered")) window.location.href = "/login/management";
    } catch (err) {
        console.error(err);
        alert("Registration failed.");
    }
});
