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
    // todo
    // use obj property 'type' to handle message event
    switch (obj.type) {
        case "text":
            console.log("text körs")
            renderMessage(obj);
            break;
        case "url":
            console.log("test url", obj)
            renderImgMsg(obj)
            break;
        default:
            break;
    }
   
});

setNickname.addEventListener("click", () => {
    // get value from input nickname
    nickname = document.getElementById("nickname").value;

    // if set - disable input nickname
    document.getElementById("nickname").setAttribute("disabled", true);

    // enable input field
    document.getElementById("inputText").removeAttribute("disabled");

    // focus input field
    document.getElementById("inputText").focus();
});

inputText.addEventListener("keydown", (e) => {
    // press Enter...make sure at least one char

    if (e.key === "Enter" && inputText.value.length > 0) {
       
        handleMessage();
    }
});

sendBtn.addEventListener("click", (e) => {

    if (e.target == sendBtn && inputText.value.length > 0) {
       
        handleMessage();
    }
});

function handleMessage() {

    let objMessage = {
        type: "text",
        msg: inputText.value,
        nickname: nickname,
    };

    // show new message for this user
    renderMessage(objMessage);

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

/**
 * render new message
 *
 * @param {obj}
 */
function renderMessage(obj) {
    // use template - cloneNode to get a document fragment
    let template = document.getElementById("message").cloneNode(true);

    console.log("obj", obj)

    // access content
    let newMsg = template.content;

    // gets an div with background img of canvas but doesnt show what i painted.. only white..

    // change content...
    newMsg.getElementById("msgNickname").innerText = obj.nickname;
    newMsg.getElementById("chatMsgContent").innerText = obj.msg;

    // visual: 10:41
    newMsg.getElementById("msgTime").innerText = currentTime();

    // render using prepend method - last message first
    chatThread.appendChild(newMsg);
}


function openCloseCanvas(e) {

}

drawBtn.addEventListener('click', (e) => {
    if (canvas.style.display != "block") {
        console.log("none", canvas);
        canvas.style.display = 'block';
    }
    
    else if (canvas.style.display = "block") {
        console.log("drawBtn onclick: canvas display: block");
        canvas.style.display = 'none';
        saveImgToUrl()
    }
});


function init(e) {
    const ctx = canvas.getContext('2d');

    let startX = e.clientX - canvas.offsetLeft;
    let startY = e.clientY - canvas.offsetTop;

    const canvasOffsetX = canvas.offsetLeft;
    const canvasOffsetY = canvas.offsetTop;

    // canvas.width = window.innerWidth - canvasOffsetX;
    // canvas.height = window.innerHeight - canvasOffsetY;
    canvas.width = 300;
    canvas.height = 300;

    let lineWidth = 10;
   
    let isPainting = false;
    const initPaint = (e) => {
       // ctx.fillStyle = "white";
        isPainting = true;
        startX = e.offsetX;
        startY = chat.offsetTop;
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
        ctx.lineTo(e.clientX - canvasOffsetX, e.clientY - chat.offsetTop);
        ctx.stroke();
    };
    canvas.onmousedown = initPaint;
    canvas.onmousemove = paint;
    window.onmouseup = finishPaint;

}

window.onload = init;

const saveImgToUrl =  () => {

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
    renderImgMsg(imgMsg)
    // send to server
    websocket.send(JSON.stringify(imgMsg));

}

function renderImgMsg (obj) {

    console.log(obj.msg)
    let imgTag = document.createElement("img");
    imgTag.src = obj.msg;

    chatThread.appendChild(imgTag);

}