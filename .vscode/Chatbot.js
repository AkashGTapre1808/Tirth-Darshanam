function sendMessage() {
  const input=document.getElementById("user-input");
  const message=input.value.trim();

  if(message==="") return;
  addMessage(message, "user");
  input.value="";

  setTimeout(()=> {
    const reply= getBotresponse(message);
    addMessage(reply,"bot");
  }, 1000); //1sec delay
}
function getBotResponse(input) {
  input=input.toLowerCase();
  if(input.includes("hello") || input.includes("hi")){
    return "Hello, How can I help you?";
  }
    elseif (input.includes("how are you")){
      return "i'm doing great ,What about You?";
    }
    elseif (input.includes("bye"){
      return "bye! Have a goog day";
    }
    else{
      return "Sorry, I don't Understand That. you Can ask any other question"
    }
}
