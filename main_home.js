//animation for chatbox page or box

const chatbot_btn = document.getElementById("chatbot-btn");
const message = document.getElementById("message");

chatbot_btn.addEventListener("click", () => {
  chatbot_btn.classList.toggle("sld");
  message.classList.toggle("show");
});



// chatbot javascript

let prompt = document.querySelector("#search");
    let chatcnt = document.querySelector(".msg-box");
    const sendBtn = document.getElementById("enter");

    function handleInput() {
      user(prompt.value);
    }

    function crtchatbox(html, classes) {
      let div = document.createElement("div");
      div.innerHTML = html;
      div.classList.add(classes);
      return div;
    }

    function user(msg) {
      if (msg.trim() === "") return;

      let userchat = crtchatbox(msg, "user-chat");
      chatcnt.appendChild(userchat);
      chatcnt.scrollTo({ top: chatcnt.scrollHeight, behavior: "smooth" });
      prompt.value = "";

      // Bot reply after delay
      setTimeout(() => {
        botReply(msg);
      }, 1000);
    }

    function botReply(msg) {
      let botreplay = crtchatbox("Here are some options you can choose:", "chatbot");
      chatcnt.appendChild(botreplay);

      let optionsDiv = document.createElement("div");
      optionsDiv.classList.add("options");
      optionsDiv.innerHTML = `
        <button class="chatbot" onclick="choose('How to register?')">How to register?</button>
        <button class="chatbot" onclick="choose('How to login?')">How to login?</button>
        <button class="chatbot" onclick="choose('Forgot password?')">Forgot password?</button>
        <button class="chatbot" onclick="choose('Contact support')">Contact support</button>
        <button class="chatbot" onclick="choose('Exit chat')">Exit chat</button>
      `;
      chatcnt.appendChild(optionsDiv);
      chatcnt.scrollTo({ top: chatcnt.scrollHeight, behavior: "smooth" });
    }

    function choose(option) {
      let userchat = crtchatbox(option, "user-chat");
      chatcnt.appendChild(userchat);

      let botMsg = "";
      switch (option) {
        case "How to register?":
          botMsg = "👉 Go to the Register page, fill in your details, and click Submit.";
          break;
        case "How to login?":
          botMsg = "👉 Enter your email and password on the Login page.";
          break;
        case "Forgot password?":
          botMsg = "👉 Click on 'Forgot Password' and follow the steps.";
          break;
        case "Contact support":
          botMsg = "👉 You can email us at support@example.com 📧";
          break;
        case "Exit chat":
          botMsg = "👋 Thank you! Have a great day!";
          break;
      }

      let botreplay = crtchatbox(botMsg, "chatbot");
      chatcnt.appendChild(botreplay);
      chatcnt.scrollTo({ top: chatcnt.scrollHeight, behavior: "smooth" });
    }

    // Send on Enter key
    prompt.addEventListener("keydown", (e) => {
      if (e.key == "Enter") {
        handleInput();
      }
    });

    sendBtn.addEventListener("click", handleInput);