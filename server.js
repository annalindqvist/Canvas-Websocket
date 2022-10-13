/* dependencies - imports
------------------------------- */
import express from "express";

// core module http - no npm install...
import http from "http";

// use websocket server
import {
    WebSocketServer
} from "ws";

// import functions
import {
    parseJSON,
    broadcast,
    broadcastButExclude
} from "./libs/functions.js";
import {
    v4 as uuidv4
} from "uuid";
import { info } from "console";



/* application variables
------------------------------- */
// set port number >>> make sure client javascript uses same WebSocket port!
const port = 80;



/* express
------------------------------- */
// express 'app' environment
const app = express();

// serve static files - every file in folder named 'public'
app.use(express.static("public"));



/* server(s)
------------------------------- */
// use core module http and pass express as an instance
const server = http.createServer(app);

// create WebSocket server - use a predefined server
const wss = new WebSocketServer({
    noServer: true
});





/* allow websockets - listener
------------------------------- */
// upgrade event - websocket communication
server.on("upgrade", (req, socket, head) => {
    console.log("Upgrade event client: ", req.headers);

    // use authentication - only logged in users allowed ?
    // socket.write('HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Basic\r\n\r\n');
    // socket.destroy();
    // return;

    // start websocket
    wss.handleUpgrade(req, socket, head, (ws) => {
        console.log("let user use websocket...");

        wss.emit("connection", ws, req);
    });
});

let connectedClients = [];
let disconnectedClient;
let isTypingArr = [];

wss.isTyping = function (time) {

    let timeNow = new Date();
    console.log("timeNow", timeNow)

    if (isTypingArr.length < 1) {
        isTypingArr.push(time);
        console.log("if", isTypingArr)
    }
    else {
        isTypingArr.pop();
        isTypingArr.push(time);
        console.log("else", isTypingArr)
    }
}


wss.uniqueId = function () {
    let id = uuidv4();
    return id;
}

/* listen on new websocket connections
------------------------------- */
wss.on("connection", (ws) => {
    console.log("New client connection from IP: ", ws._socket.remoteAddress);
    console.log("Number of connected clients: ", wss.clients.size);

    ws.id = wss.uniqueId();

    wss.clients.forEach(client => {
        console.log("client id: ", client.id)
        // client.send(`{"id": "${client.id}}`)
    })

    // WebSocket events (ws) for single client

    // close event
    ws.on("close", () => {
        // får ut id:t på den som lämnar men vill använda nickname för att skriva ut det i chatten?
        console.log("Client disconnected", ws.id);
        console.log(
            "Number of remaining connected clients: ",
            wss.clients.size
        );

        disconnectedClient = connectedClients.find(c => c.id === ws.id);
        let indexOfDisconnectedClient = connectedClients.indexOf(disconnectedClient);
        connectedClients.splice(indexOfDisconnectedClient, 1);

        //let remaningClients = connectedClients.filter(c => c.id !== ws.id)
            //console.log("disconnectedClient", disconnectedClient);
            //console.log("connectedClients", connectedClients)
        // console.log("disconnectedCLients", remaningClients)
        // console.log("disconnected clients", disconnectedClient)

        wss.clients.forEach(client => {

            client.send(JSON.stringify({
                type: 'disconnect',
                onlineClients: connectedClients,
                disconnectedClient: disconnectedClient,
            }))
        });

        // console.log("test connectedclients", connectedClients)
    });

    // message event
    ws.on("message", (data) => {
        // console.log('Message received: %s', data);

        let obj = parseJSON(data);
        console.log(obj)
        let objBroadcast = {};
        // todo
        // use obj property 'type' to handle message event
        switch (obj.type) {
            case "text":
                // chatt historik i "state"objekt? /array?  payload
                // message to clients
                objBroadcast = {
                    type: "text",
                    msg: obj.msg,
                    nickname: obj.nickname,
                };
                console.log("case text", objBroadcast)
                // broadcast to all but this ws...
                broadcastButExclude(wss, ws, objBroadcast);

                break;

            case "url":
                objBroadcast = {
                    type: "url",
                    msg: obj.msg,
                    nickname: obj.nickname,
                };
                console.log("case url", objBroadcast)
                broadcastButExclude(wss, ws, objBroadcast);
                break;
            case "newClient": {
                const id = ws.id;

                let newObj = {
                    nickname: obj.nickname,
                    id: id,
                }
                connectedClients.push(newObj);

                objBroadcast = {
                    type: "newClient",
                    nickname: obj.nickname,
                    id: id,
                    onlineClients: connectedClients,
                };

                console.log("rad 173 connectedclients", connectedClients)
                //console.log("case newClient", objBroadcast)

                wss.clients.forEach((client) => {
                    
                        client.send(JSON.stringify(objBroadcast));
                    
                });
                //broadcastButExclude(wss, ws, objBroadcast);
                break;
            }
            case "someoneIsTyping": {

                console.log(obj.time)
                wss.isTyping(obj.time)

                objBroadcast = {
                    type: "someoneIsTyping",
                    nickname: obj.nickname,
                    timeOfPress: isTypingArr,
                };
                console.log("case someoneIsTyping", objBroadcast)
                broadcastButExclude(wss, ws, objBroadcast);

                break;
            }
            default:
                break;
        }
    });
});



/* listen on initial connection
------------------------------- */
server.listen(port, (req, res) => {
    console.log(`Express server (and http) running on port ${port}`);
});