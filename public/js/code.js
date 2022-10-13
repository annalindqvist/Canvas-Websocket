// DOM elements
const inputText = document.getElementById("inputText");
const setNickname = document.querySelector("#setNickname");
const chatThread = document.getElementById("chatThread");
const chat = document.getElementById("chat");
const canvas = document.getElementById("canvas");
// Send btn in input msg....s
const sendBtn = document.getElementById("sendMsgBtn");
const drawBtn = document.getElementById("drawBtn");

// variable current user | nickname
let nickname;

// use WebSocket >>> make sure server uses same ws port!
const websocket = new WebSocket("ws://localhost:80");


/* event listeners
------------------------------- */

// listen on close event (server)
websocket.addEventListener("close", (event) => {
    // console.log('Server down...', event);
    document.getElementById("status").textContent = "Sry....server down";
});

// listen to messages from client | server
websocket.addEventListener("message", (event) => {
    // console.log(event.data);

    console.log("Event", event)
    let obj = parseJSON(event.data);
    console.log("objjj", obj)
    let className = "alignLeft";
    // todo
    // use obj property 'type' to handle message event
    switch (obj.type) {
        case "text":
            //console.log("text körs")

            renderMessage(obj, className);
            isTypingContainer.innerHTML = "";
            break;
        case "url":
            //console.log("test url", obj)

            renderMessage(obj, className);
            isTypingContainer.innerHTML = "";
            //renderImgMsg(obj)
            break;
        case "newClient": {
            // newClientLogIn(obj)
            renderMessage(obj)
            //console.log("newClient test", obj)
            onlineClients(obj.onlineClients);
        }
        case "disconnect": {
            //console.log(obj); 
            onlineClients(obj.onlineClients);
            clientDisconnected(obj.disconnectedClient)
            break;
        }
        case "someoneIsTyping": {
            renderSomeoneIsTyping(obj)
            console.log("someoneistyping arr", obj.timeOfPress)
        }
        default:
            break;
    }

});

setNickname.addEventListener("click", () => {
    // get value from input nickname
    nickname = document.getElementById("nickname").value;

    let objMessage = {
        type: "newClient",
        nickname: nickname,
    };

    // send new login/new client to server
    websocket.send(JSON.stringify(objMessage));

    // hide login container and show chat
    const logInContainer = document.getElementById("logIn");
    logInContainer.style.display = 'none';
    chat.style.display = 'block';

});

inputText.addEventListener("keydown", (e) => {

    // if (inputText.value.length > 0) {
    //     someoneIsTyping("start");
    // }
    // if (inputText.value.length < 0) {
    //     someoneIsTyping("stop");
    // }
    // press Enter & make sure at least one char to send handleMessage function
    if (e.key === "Enter" && inputText.value.length > 0) {

        handleMessage();
    }
});

inputText.addEventListener("keypress", (e) => {
    console.log(e)

    // time of keypress
    let timestamp = new Date(e.timeStamp);
    console.log("timestamp", timestamp);
    // Får ut i consolen: timestamp Thu Jan 01 1970 01:00:03 GMT+0100 (centraleuropeisk normaltid)
    
    
    
    //console.log("time", timestamp);
    //timestamp = timestamp.toTimeString().split(' ')[0];
   

    let objMessage = {
        type: "someoneIsTyping",
        nickname: nickname,
        time: timestamp,
    };

    websocket.send(JSON.stringify(objMessage));
})

sendBtn.addEventListener("click", (e) => {

    if (e.target == sendBtn && inputText.value.length > 0) {

        handleMessage();
        isTypingContainer.innerHTML = "";
    }
});

// function someoneIsTyping(info) {
//     console.log("test someoneistyping")

//     //console.log("info", info)

//     let objMessage = {
//         type: "someoneIsTyping",
//         msg: info,
//         nickname: nickname,
//     };

//     websocket.send(JSON.stringify(objMessage));
// }

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

function currentTime() {

    let dayTime = new Date();
    // time right now with output: 12:00
    let time = dayTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
    return time;
}

/**
 * parse JSON
 *
 * @param {*} data
 * @return {obj}
 */
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

const isTypingContainer = document.getElementById("isTypingContainer");

function renderSomeoneIsTyping(obj) {

    // if (obj.msg === "stop") {
    //     isTypingContainer.innerHTML = "";
    // } else if (obj.msg === "start") {
        isTypingContainer.innerHTML = "";
        let whoIsTyping = document.createElement("p");
        whoIsTyping.innerText = obj.nickname + " " + "is typing..";
        isTypingContainer.appendChild(whoIsTyping);
    // }

}

/**
 * render new message
 *
 * @param {obj}
 */


function renderMessage(obj, className) {
    // // use template - cloneNode to get a document fragment
    // let template = document.getElementById("message").cloneNode(true);

    // //console.log("test render", obj)
    // // access content
    // let newMsg = template.content;

    // // class to style element to right or left in chat
    // newMsg.querySelector("li").className = className;

    // // change content...
    // newMsg.getElementById("msgNickname").innerText = obj.nickname;
    // newMsg.getElementById("chatMsgContent").innerText = obj.msg;

    // // visual: 10:41
    // newMsg.getElementById("msgTime").innerText = currentTime();

    // // render using prepend method - last message first
    // chatThread.appendChild(newMsg);

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
            newMsg.getElementById("chatMsgContent").innerText = obj.nickname + " " + "just joined the chat.";
            newMsg.getElementById("msgTime").innerText = currentTime();
            chatThread.appendChild(newMsg);
        }
        default:
            break;
    }
}

// function newClientLogIn(obj) {

//     // use template - cloneNode to get a document fragment
//     let template = document.getElementById("message").cloneNode(true);
//     // access content
//     let newMsg = template.content;
//     newMsg.getElementById("chatMsgContent").innerText = obj.nickname + " " + "just joined the chat.";
//     chatThread.appendChild(newMsg);
// }

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


function clearCanvas() {
    const ctx = canvas.getContext('2d');

    // White clear background of the canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

}

drawBtn.addEventListener('click', (e) => {
    if (canvas.style.display != "block") {
        clearCanvas()
        canvas.style.display = 'block';
    } else if (canvas.style.display = "block") {
        console.log("drawBtn onclick: canvas display: block");
        canvas.style.display = 'none';
        saveImgToUrl()
    }
});


function init(e) {
    const ctx = canvas.getContext('2d');

    const rect = canvas.getBoundingClientRect()
    // const x = e.clientX - rect.left
    // const y = e.clientY - rect.top
    // console.log("x: " + x + " y: " + y)
    console.log("canvas.getBoundingClientRect(),", canvas.getBoundingClientRect())

    let startX = e.clientX - rect.left;
    let startY = e.clientY - rect.top;

    // const canvasOffsetX = canvas.offsetLeft;
    // const canvasOffsetY = canvas.offsetTop;

    canvas.width = window.innerWidth - (chat.offsetLeft * 2) - 4;
    canvas.height = window.innerHeight - 200;
    // canvas.width = 300;
    // canvas.height = 300;

    let lineWidth = 20;

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

        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        //console.log("paint X", e.clientX)
        ctx.lineTo(e.clientX - chat.offsetLeft - lineWidth * 0.5, e.clientY - chat.offsetTop - lineWidth * 0.5);
        ctx.stroke();
    };
    canvas.onmousedown = initPaint;
    canvas.onmousemove = paint;
    window.onmouseup = finishPaint;

}

window.onload = init;

const saveImgToUrl = () => {

    let img = canvas.toDataURL('image/png');
    console.log("saveImgToUrl", img)
    // let imgSubst = img.substr(img.indexOf(',')+1).toString()
    // console.log("img", imgSubst)

    let imgMsg = {
        type: "url",
        msg: img,
        nickname: nickname,
    };
    console.log("imgMsg", imgMsg)
    //renderImgMsg(imgMsg)

    let className = "alignRight";
    renderMessage(imgMsg, className)
    // send to server
    websocket.send(JSON.stringify(imgMsg));

}

// function renderImgMsg(obj) {

//     console.log(obj.msg)
//     let imgTag = document.createElement("img");
//     imgTag.src = obj.msg;

//     chatThread.appendChild(imgTag);

// }

let onlineClientsContainer = document.getElementById("onlineClients");

function onlineClients(obj) {

    console.log("connected clients are: ", obj)

    onlineClientsContainer.innerHTML = '';
    obj.forEach(client => {

        //console.log("client", client)
        const nameBubble = document.createElement("div");
        nameBubble.innerText = client.nickname;

        onlineClientsContainer.appendChild(nameBubble)
    });

}