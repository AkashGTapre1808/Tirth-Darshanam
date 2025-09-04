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

        function handleInput() {         //when click on virtual & enter button msg send it is common
          user(prompt.value);  
          console.log(prompt.value);
        }

      function crtchatbox(html,classes){            //acces chatbox 
        let div = document.createElement("div");
        div.innerHTML = html
        div.classList.add(classes)
        return div
      }

      function user(msg){                      //user msg display 
      let html =`${msg}`
        prompt.value="";
        let userchat = crtchatbox(html,"user-chat");
        chatcnt.appendChild(userchat);
        chatcnt.scrollTo({top:chatcnt.scrollHeight,behavior:"smooth"});


        setTimeout(()=>{                        //bot timing dealy and display
          let html=``
          let botreplay = crtchatbox(html,"chatbot");
          chatcnt.appendChild(botreplay);
          chatcnt.scrollTo({top:chatcnt.scrollHeight,behavior:"smooth"});
        },2000);
      }


      prompt.addEventListener("keydown",(e)=>{   //when click on physical button
        if(e.key=="Enter"){
          user(prompt.value);
          console.log(prompt.value);
        }
      });


sendBtn.addEventListener("click", handleInput); //when click on virtual button msg send