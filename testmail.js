const nodemailer = require("nodemailer");

async function test() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "yogeshsuryagm@gmail.com",
      pass: "kbhw artx aqea hxaq"
    }
  });

  try {
    const info = await transporter.sendMail({
      from: "yogeshsuryagm@gmail.com",
      to: "yogeshsurya982@gmail.com",  // send to yourself first
      subject: "hi",
      text: "Hello from Node.js!"
    });
    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
