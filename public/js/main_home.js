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
        <button class="chatbot" onclick="choose('How to book a ticket?')">How to book a ticket?</button>
        <button class="chatbot" onclick="choose('How to navigat route?')">How to navigate route?</button>
        <button class="chatbot" onclick="choose('How to get Alerts and Notifications?')">How to get Alerts and Notifications?</button>
        <button class="chatbot" onclick="choose('How to get my Parking spot?')">How to get my Parking spot?</button>
        <button class="chatbot" onclick="choose('When Should I request for Parking spot?')">When Should I request for Parking spot?</button>
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
        case "How to book a ticket?":
          botMsg = "👉 Login using your email id and password, fill your journey details, choose appropriate vehicles and click on Book!";
          break;
        case "How to navigate route?":
          botMsg = "👉 Login using your email-id and password, fill your journey details and you will see route on navigation map aside.";
          break;
        case "How to get Alerts and Notifications?":
          botMsg = "👉 To get Alerts and Notifications, open the announcement page and refresh it.";
          break;
        case "How to get my Parking spot?":
          botMsg = "👉 Go to park your vehicle section, select the nearest parking location to you and then click on `get parking spot.`";
        break;
        case "Contact support":
          botMsg = "👉 You can email us at tirth-darshanam@gmail.com 📧";
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