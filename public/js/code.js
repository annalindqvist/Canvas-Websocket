// imports
import {
    createPopup
} from 'https://unpkg.com/@picmo/popup-picker@latest/dist/index.js?module';

// --- DOM elements---
const inputText = document.getElementById("inputText");
const setNickname = document.getElementById("setNickname");
const chatThread = document.getElementById("chatThread");
const chat = document.getElementById("chat");
const canvas = document.getElementById("canvas");
let onlineClientsContainer = document.getElementById("onlineClients");
const sendBtn = document.getElementById("sendMsgBtn");
const drawBtn = document.getElementById("drawBtn");
const canvasTools = document.getElementById("canvasTools");
const logInContainer = document.getElementById("logIn");
const chatfeedback = document.getElementById("chatTypingfeedback");
const trigger = document.querySelector('#trigger');

// --- variables 
let nickname;
let isTyping = false;
let lastKeyPress;
let colorOfPencil = black;

// --- use WebSocket >>> make sure server uses same ws port!

// -- if hosting on ex render.com use (const baseURL, protocol & first constwebsocket)
// --and comment out "const websocket = new WebSocket("ws://localhost:80");"
//const baseURL = window.location.href.split("//")[1];
//const protocol = 'wss';
//const websocket = new WebSocket(`${protocol}://${baseURL}`);

// -- open with localhost use this one
const websocket = new WebSocket("ws://localhost:80");

// --- EVENT LISTENERS ---

// -- listen on close event (server) & reload page every 4 seconds to try again 
//(render needs the reload if you are not active on the page)
websocket.addEventListener("close", (e) => {
    document.getElementById("serverDown").style.display = 'flex';
    chat.style.display = 'none';
    logInContainer.style.display = 'none';
    setInterval(reloadPage, 4000);
});

// -- when ws is open, runs function checkIsTyping every second (to see if someone is typing)
websocket.addEventListener("open", (e) => {
    setInterval(checkIsTyping, 1000);

});

// -- listen to messages from client | server
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

// -- function to reload page
function reloadPage() {
    location.reload();
};

// --- Set nickname and send to server ---
setNickname.addEventListener("click", () => {
    nickname = document.getElementById("nickname").value;
    if (nickname) {
        let objMessage = {
            type: "newClient",
            nickname: nickname,
        };
        // send new login/new client to server
        websocket.send(JSON.stringify(objMessage));
        // hide login container and show chat
        logInContainer.style.display = 'none';
        chat.style.display = 'block';
    } else {
        document.getElementById("nicknameHelper").classList.add("animate__animated");
        document.getElementById("nicknameHelper").classList.add("animate__shakeX");
    }
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
});

// --- 2. Press on btn to send
sendBtn.addEventListener("click", (e) => {
    if (e.target == sendBtn && inputText.value.length > 0) {
        handleMessage();
        isTyping = false;
        sendTypingToServer();
    } else if (canvas.style.display === "block") {
        canvas.style.display = 'none';
        canvasTools.style.display = 'none'
        inputText.style.display = 'block';
        trigger.style.display = 'flex';
        saveImgToUrl();
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
});

// --- Check if someone is typing 
function checkIsTyping() {
    let timeNow = new Date().getTime();
    let timeDifferense;
    if (lastKeyPress) {
        timeDifferense = lastKeyPress + 4000;
        // 4sek + 1sek from setinterval in websocket open 
        if (timeNow < timeDifferense) {
            isTyping = true;
        } else if (timeNow > timeDifferense) {
            lastKeyPress = "";
            isTyping = false;
        }
        sendTypingToServer();
    }
};

// -- chatscroll to bottom instead of top of chat
function scrollToBottom() {
    chatThread.scrollTop = chatThread.scrollHeight;
};

// -- send isTyping status to server
function sendTypingToServer() {
    let objMessage = {
        type: "someoneIsTyping",
        msg: isTyping,
        nickname: nickname,
    };
    websocket.send(JSON.stringify(objMessage));
};

// --- Visual feedback if someone is typing ---
function someoneIsTyping(obj) {
    if (obj.msg === false) {
        chatfeedback.innerHTML = "";
    } else if (obj.msg === true) {
        chatfeedback.innerHTML = "";
        let whoIsTyping = document.createElement("p");
        whoIsTyping.className = "typingFeedback";
        whoIsTyping.innerText = obj.nickname + " is typing...";
        chatfeedback.appendChild(whoIsTyping);
    }
}
// -- handle if someone typed a message and send to server
function handleMessage() {
    let objMessage = {
        type: "text",
        msg: inputText.value,
        nickname: nickname,
    };
    // show new message for this user
    let className = "alignRight";
    renderMessage(objMessage, className);
    // send to server
    websocket.send(JSON.stringify(objMessage));
    // reset input field
    inputText.value = "";
};

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

function parseJSON(data) {
    // try to parse json
    try {
        let obj = JSON.parse(data);

        return obj;
    } catch (error) {
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
            let newImgMsg = imgTemplate.content;
            newImgMsg.getElementById("imgMsgContainer").className = className;
            newImgMsg.getElementById("chatImgMsgContainer").className = className;
            newImgMsg.getElementById("imgMsg").src = obj.msg;
            newImgMsg.getElementById("imgMsgNickname").innerText = obj.nickname;
            newImgMsg.getElementById("imgMsgTime").innerText = currentTime();
            chatThread.appendChild(newImgMsg);
            break;
        case "newClient": {
            let template = document.getElementById("message").cloneNode(true);
            let newMsg = template.content;
            newMsg.getElementById("chatMsgContainer").className = "chatfeedback";
            newMsg.getElementById("chatMsgContent").innerText = obj.nickname + " " + "just joined the chat.";
            newMsg.getElementById("msgTime").innerText = currentTime();
            chatThread.appendChild(newMsg);
            break;
        }
        default:
            break;
    }
    scrollToBottom();
}

//-- Visual feedback if someone left the chat
function clientDisconnected(obj) {
    if (!obj) {
        return;
    }
    // use template - cloneNode to get a document fragment
    let template = document.getElementById("message").cloneNode(true);
    // access content
    let newMsg = template.content;
    newMsg.getElementById("chatMsgContainer").className = "chatfeedback";
    newMsg.getElementById("chatMsgContent").innerText = obj.nickname + " " + "just left the chat.";
    newMsg.getElementById("msgTime").innerText = currentTime();
    chatThread.appendChild(newMsg);
    scrollToBottom();
}

// --- 'Clear' canvas with white background---
function clearCanvas() {
    const ctx = canvas.getContext('2d');
    // White background of the canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// -- click on pen/drawBtn to open canvas/hide elements and the opposit
drawBtn.addEventListener('click', (e) => {
    if (canvas.style.display != "block" && canvasTools.style.display != 'flex') {
        // clearCanvas()
        canvas.style.display = 'block';
        canvasTools.style.display = 'flex'
        inputText.style.display = 'none';
        trigger.style.display = 'none'
        init();
        clearCanvas()
    } else if (canvas.style.display = "block" && canvasTools.style.display == 'flex') {
        canvas.style.display = 'none';
        canvasTools.style.display = 'none';
        inputText.style.display = 'block';
        trigger.style.display = 'flex'
    }
});

// -- forEach online client create div with nickname
function onlineClients(obj) {
    onlineClientsContainer.innerHTML = '';
    obj.forEach(client => {
        const nameBubble = document.createElement("div");
        nameBubble.innerText = client.nickname;
        onlineClientsContainer.appendChild(nameBubble)
    });
};

// -- save drawing to pgn and sent to server
const saveImgToUrl = () => {
    let img = canvas.toDataURL('image/png');
    let imgMsg = {
        type: "url",
        msg: img,
        nickname: nickname,
    };
    let className = "alignRight";
    renderMessage(imgMsg, className);
    websocket.send(JSON.stringify(imgMsg));
};

// -- colorOfPencil will be color of div/used to change color of pencil when drawing
canvasTools.addEventListener("click", (e) => {
    colorOfPencil = e.target.id;
});

// -- simple draw function
function init(e) {

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth - (chat.offsetLeft * 2) - 4;
    canvas.height = window.innerHeight - 100;
    let lineWidth = 10;
    let isPainting = false;
    const initPaint = (e) => {
        isPainting = true;
        paint(e);
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
        ctx.lineTo(e.clientX - chat.offsetLeft - lineWidth * 0.5, e.clientY - chat.offsetTop - lineWidth * 0.5);
        ctx.stroke();
    };
    // quick-fix if you size the window the canvas doesnt draw correct. this will clear and start over.. 
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth - (chat.offsetLeft * 2) - 4;
        canvas.height = window.innerHeight - 100;
        clearCanvas();
    })
    canvas.onmousedown = initPaint;
    canvas.onmousemove = paint;
    window.onmouseup = finishPaint;

    canvas.addEventListener("touchstart", initPaint);
    canvas.addEventListener("touchmove", paint);
    window.addEventListener("touchend", finishPaint);

}

//window.onload = init;

// --- EMOJI PICKER ---
// https://github.com/joeattardi/picmo

document.addEventListener('DOMContentLoaded', () => {
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