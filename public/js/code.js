// DOM elements
const inputText = document.getElementById("inputText");
const setNickname = document.querySelector("#setNickname");
const chatThread = document.getElementById("chatThread");
// Send btn in input msg....s
const sendBtn = document.getElementById("sendMsgBtn");

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

    let obj = parseJSON(event.data);

    // todo
    // use obj property 'type' to handle message event
    switch (obj.type) {
        case "text":
            break;
        case "somethingelse":
            break;
        default:
            break;
    }

    // ...
    renderMessage(obj);
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

inputText.addEventListener("keydown", (event) => {
    // press Enter...make sure at least one char

    if (event.key === "Enter" && inputText.value.length > 0) {
        // chat message object
        let objMessage = {
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
});


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

    // access content
    let newMsg = template.content;

    // change content...
    newMsg.querySelector("span").textContent = obj.nickname;
    newMsg.querySelector("p").textContent = obj.msg;

    // visual: 10:41
    newMsg.getElementById("time").innerText = currentTime();

    // render using prepend method - last message first
    chatThread.appendChild(newMsg);
}



function init(e) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');

    console.log('This is the context', ctx);
    // Paints crazy.. paintbrush is way down than mouse.. 
    console.log(window.innerWidth, window.innerHeight)
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let isPainting = false;
    const initPaint = (e) => {
        isPainting = true;
        paint(e); // needed to be able to make dots
    };

    const finishPaint = () => {
        isPainting = false;
    };

    const paint = (e) => {
        if (!isPainting) return;
        ctx.arc(e.clientX, e.clientY, 10, 0, 2 * Math.PI); // Draw 10px radius circle
        ctx.fill() // hmmm... 
        ctx.beginPath();
        // Perhaps something else needed?
    };
    canvas.onmousedown = initPaint;
    canvas.onmousemove = paint;
    canvas.onmouseup = finishPaint;

}

window.onload = init;