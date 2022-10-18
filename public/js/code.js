// imports

import {
    createPopup
} from 'https://unpkg.com/@picmo/popup-picker@latest/dist/index.js?module';

// DOM elements
const inputText = document.getElementById("inputText");
const setNickname = document.querySelector("#setNickname");
const chatThread = document.getElementById("chatThread");
const chat = document.getElementById("chat");
const canvas = document.getElementById("canvas");
let onlineClientsContainer = document.getElementById("onlineClients");
const sendBtn = document.getElementById("sendMsgBtn");
const drawBtn = document.getElementById("drawBtn");
const canvasTools = document.getElementById("canvasTools");
const logInContainer = document.getElementById("logIn");
const chatfeedback = document.getElementById("chatfeedback");

// --- variables 
let nickname;
let isTyping = false;
let lastKeyPress;
let colorOfPencil = black;

// use WebSocket >>> make sure server uses same ws port!
//const baseURL = window.location.href.split("//")[1];
//const protocol = 'wss';
//const websocket = new WebSocket(`${protocol}://${baseURL}`);
const websocket = new WebSocket("ws://localhost:80");

// --- EVENT LISTENERS ---

// listen on close event (server)
websocket.addEventListener("close", (e) => {
    document.getElementById("serverDown").style.display = 'flex';
    chat.style.display = 'none';
    logInContainer.style.display = 'none';
    setInterval(reloadPage, 4000);
});

// when ws is open checks runs function checkIsTyping every 2 seconds
websocket.addEventListener("open", (e) => {
    setInterval(checkIsTyping, 2000);

});

// listen to messages from client | server
websocket.addEventListener("message", (e) => {

    let obj = parseJSON(e.data);
    let className = "alignLeft";
  
    switch (obj.type) {
        case "text":
            renderMessage(obj, className);
            chatfeedback.innerHTML = "";
            break;
        case "url":
            renderMessage(obj, className);
            chatfeedback.innerHTML = "";
            break;
        case "newClient": {
            renderMessage(obj)
            onlineClients(obj.onlineClients);
        }
        case "disconnect": {
            onlineClients(obj.onlineClients);
            clientDisconnected(obj.disconnectedClient)
            break;
        }
        case "someoneIsTyping": {
            someoneIsTyping(obj)
        }
        default:
            break;
    }

});

function reloadPage () {
    location.reload();
}


// --- Set nickname and send to server ---
setNickname.addEventListener("click", () => {
    nickname = document.getElementById("nickname").value;

    let objMessage = {
        type: "newClient",
        nickname: nickname,
    };

    // send new login/new client to server
    websocket.send(JSON.stringify(objMessage));

    // hide login container and show chat
    logInContainer.style.display = 'none';
    chat.style.display = 'block';
});

// --- Listen on input.value to send msg to chat ---
// --- 1. Press enter to send
inputText.addEventListener("keydown", (e) => {

    if (e.key !== "Enter") {
        lastKeyPress = new Date().getTime();
    }
    if (e.key === "Enter" && inputText.value.length > 0) {
        handleMessage();
        isTyping = false;
        sendTypingToServer();
    }
    // -- Trodde denna kunde göra så den slutar "skriva" om man klickat på enter och det är tommt i fältet.. 
    // if (e.key === "Enter" && inputText.value.length === 0) {
    //     isTyping = false;
    //     sendTypingToServer();
    // }

});

// --- 2. Press on btn to send
sendBtn.addEventListener("click", (e) => {

    if (e.target == sendBtn && inputText.value.length > 0) {
        handleMessage();
        isTyping = false;
        sendTypingToServer();
    } else if (canvas.style.display = "block") {
        canvas.style.display = 'none';
        canvasTools.style.display = 'none'
        saveImgToUrl()
    }
});
// --- Listen on keypress and send timestamp to server for visual feedback
inputText.addEventListener("keypress", (e) => {
   
    let timestamp = new Date().getTime();
    let objMessage = {
        type: "someoneIsTyping",
        nickname: nickname,
        time: timestamp,
    };

    websocket.send(JSON.stringify(objMessage));
})

// --- Check if someone is typing 
function checkIsTyping () {

    let timeNow = new Date().getTime();
    let timeDifferense;
    //console.log("checkIsTyping", isTyping)
    if (lastKeyPress) {

        timeDifferense = lastKeyPress + 5000;

        // 5sek + 2sek from setinterval in websocket open 
        if (timeNow < timeDifferense) {
            console.log("timedifferense less than 5sek", timeDifferense)
            isTyping = true;

        }
        else if (timeNow > timeDifferense) {
            console.log("timedifferense bigger than 5sek", timeDifferense) 
            lastKeyPress = "";
            isTyping = false;
            
        }
        sendTypingToServer();

    }
}

function sendTypingToServer () {
    let objMessage = {
        type: "someoneIsTyping",
        msg: isTyping,
        nickname: nickname,
    };

    // send to server
    websocket.send(JSON.stringify(objMessage));
}

// --- Visual feedback if someone is typing ---
function someoneIsTyping(obj) {
    
    console.log("test frontend someoneistyping", obj)
    if (obj.msg === false) {
        chatfeedback.innerHTML = "";
        //chatFeedback.style.display = 'none';

    } else if (obj.msg === true) {
        chatfeedback.innerHTML = "";
        let whoIsTyping = document.createElement("p");
        whoIsTyping.className = "chatfeedback";
        whoIsTyping.innerText = obj.nickname + " is typing...";
        chatfeedback.appendChild(whoIsTyping);
        //chatFeedback.style.display = 'inline-block';
    }
}

function handleMessage() {

    let objMessage = {
        type: "text",
        msg: inputText.value,
        nickname: nickname,
    };

    // show new message for this user
    // className to show my messages to right
    let className = "alignRight";
    renderMessage(objMessage, className);

    // send to server
    websocket.send(JSON.stringify(objMessage));

    // reset input field
    inputText.value = "";

}


/* functions...
------------------------------- */
// Returns current time like "12:15"
function currentTime() {

    let dayTime = new Date();
    let time = dayTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
    return time;
}

// -- KOLLA PÅ DENNA! catch error??
function parseJSON(data) {
    // try to parse json
    try {
        let obj = JSON.parse(data);

        return obj;
    } catch (error) {
        // log to file in real application....
        return {
            error: "An error receving data...expected json format"
        };
    }
}


// --- Render messenge to client
// obj.type to see if there is an textMessage, url(img)Message or someone logged in

function renderMessage(obj, className) {
 
    switch (obj.type) {

        case "text":
            // use template - cloneNode to get a document fragment
            let template = document.getElementById("message").cloneNode(true);
            // access content
            let newMsg = template.content;
            // change content...
            newMsg.getElementById("msgNickname").innerText = obj.nickname;
            newMsg.getElementById("chatMsgContent").innerText = obj.msg;
            // class to style element to right or left in chat
            newMsg.getElementById("msgContainer").className = className;
            // visual: 10:41
            newMsg.getElementById("msgTime").innerText = currentTime();
            // render using prepend method - last message first
            chatThread.appendChild(newMsg);

            break;
        case "url":
            // use IMG template - cloneNode to get a document fragment
            let imgTemplate = document.getElementById("imgMessage").cloneNode(true);
            // access content
            let newImgMsg = imgTemplate.content;
            newImgMsg.getElementById("imgMsgContainer").className = className;
            newImgMsg.getElementById("imgMsg").src = obj.msg;
            newImgMsg.getElementById("imgMsgNickname").innerText = obj.nickname;
            newImgMsg.getElementById("imgMsgTime").innerText = currentTime();
            chatThread.appendChild(newImgMsg);

            break;
        case "newClient": {
            // use template - cloneNode to get a document fragment
            let template = document.getElementById("message").cloneNode(true);
            // access content
            let newMsg = template.content;
            newMsg.getElementById("chatMsgContainer").className = "chatfeedback";
            newMsg.getElementById("chatMsgContent").innerText = obj.nickname + " " + "just joined the chat.";
            newMsg.getElementById("msgTime").innerText = currentTime();
            chatThread.appendChild(newMsg);
        }
        default:
            break;
    }
}

function clientDisconnected(obj) {

    if (!obj) {
        return;
    }
    // use template - cloneNode to get a document fragment
    let template = document.getElementById("message").cloneNode(true);
    // access content
    let newMsg = template.content;
    newMsg.getElementById("chatMsgContent").innerText = obj.nickname + " " + "just left the chat.";
    chatThread.appendChild(newMsg);
}

// --- Clear canvas ---
function clearCanvas() {
    const ctx = canvas.getContext('2d');

    // White clear background of the canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

}

drawBtn.addEventListener('click', (e) => {
    if (canvas.style.display != "block" && canvasTools.style.display != 'flex') {
        clearCanvas()
        canvas.style.display = 'block';
        canvasTools.style.display = 'flex'

    } else if (canvas.style.display = "block" && canvasTools.style.display == 'flex') {
        console.log("drawBtn onclick: canvas display: block");
        canvas.style.display = 'none';
        canvasTools.style.display = 'none'
    }
});

function onlineClients(obj) {

    onlineClientsContainer.innerHTML = '';
    obj.forEach(client => {

        const nameBubble = document.createElement("div");
        nameBubble.innerText = client.nickname;

        onlineClientsContainer.appendChild(nameBubble)
    });
};

const saveImgToUrl = () => {

    let img = canvas.toDataURL('image/png');
    let imgMsg = {
        type: "url",
        msg: img,
        nickname: nickname,
    };
    let className = "alignRight";
    renderMessage(imgMsg, className);
    // send to server
    websocket.send(JSON.stringify(imgMsg));
};

canvasTools.addEventListener("click", (e) => {
    colorOfPencil = e.target.id;
});

function init(e) {
    const ctx = canvas.getContext('2d');

    const rect = canvas.getBoundingClientRect()
    console.log("canvas.getBoundingClientRect(),", canvas.getBoundingClientRect())

    let startX = e.clientX - rect.left;
    let startY = e.clientY - rect.top;


    canvas.width = window.innerWidth - (chat.offsetLeft * 2) - 4;
    canvas.height = window.innerHeight - 100;
    // canvas.width = 300;
    // canvas.height = 300;

    let lineWidth = 10;

    let isPainting = false;
    const initPaint = (e) => {
        isPainting = true;
        // startX = e.offsetX;
        // startY = chat.offsetTop;
        // console.log("initpaint X", startX)
        paint(e); // needed to be able to make dots
    };

    const finishPaint = () => {
        isPainting = false;
        ctx.stroke();
        ctx.beginPath();
    };

    const paint = (e) => {
        if (!isPainting) return;
        ctx.strokeStyle = colorOfPencil;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        //console.log("paint X", e.clientX)
        ctx.lineTo(e.clientX - chat.offsetLeft - lineWidth * 0.5, e.clientY - chat.offsetTop - lineWidth * 0.5);
        ctx.stroke();
    };
    canvas.onmousedown = initPaint;
    canvas.onmousemove = paint;
    window.onmouseup = finishPaint;

    canvas.ontouchstart = initPaint;
    canvas.ontouchmove = initPaint;
    window.ontouchend = initPaint;

}

window.onload = init;





// --- EMOJI PICKER ---
// https://github.com/joeattardi/picmo

document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.querySelector('#trigger');

    const picker = createPopup({}, {
        referenceElement: trigger,
        triggerElement: trigger,
        position: 'right-end'
    });

    trigger.addEventListener('click', () => {
        picker.toggle();
    });

    picker.addEventListener('emoji:select', (selection) => {
        inputText.value += selection.emoji;
    });

});