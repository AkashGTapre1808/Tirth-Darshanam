const chatbot_btn = document.getElementById("chatbot-btn");
const message = document.getElementById("message");

chatbot_btn.addEventListener("click", () => {
  chatbot_btn.classList.toggle("sld");
  message.classList.toggle("show");
});
