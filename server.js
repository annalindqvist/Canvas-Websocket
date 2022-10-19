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
import {
    info
} from "console";



/* application variables
------------------------------- */
// set port number >>> make sure client javascript uses same WebSocket port!
// port 3000 if you want to host it on ex. render.com
const port = 3000;
// I use port 80 to open with locanhost
//const port = 80;

let connectedClients = [];
let disconnectedClient;

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
    // start websocket
    wss.handleUpgrade(req, socket, head, (ws) => {
        console.log("let user use websocket...");
        wss.emit("connection", ws, req);
    });
});

wss.uniqueId = function () {
    let id = uuidv4();
    return id;
};

/* listen on new websocket connections
------------------------------- */
wss.on("connection", (ws) => {
    console.log("New client connection from IP: ", ws._socket.remoteAddress);
    console.log("Number of connected clients: ", wss.clients.size);

    ws.id = wss.uniqueId();

    // --- WebSocket events (ws) for single client ---

    // -- close event
    ws.on("close", () => {
        console.log(
            "Number of remaining connected clients: ",
            wss.clients.size
        );
        // ws.id = id on client who disconnects
        // search for it in connectedClients
        disconnectedClient = connectedClients.find(c => c.id === ws.id);
        // --- If disconnectedClient exists in connectedClients then we remove and update array
        if (disconnectedClient) {
            let indexOfDisconnectedClient = connectedClients.indexOf(disconnectedClient);
            connectedClients.splice(indexOfDisconnectedClient, 1);

            wss.clients.forEach(client => {

                client.send(JSON.stringify({
                    type: 'disconnect',
                    onlineClients: connectedClients,
                    disconnectedClient: disconnectedClient,
                }))
            });
        }
    });

    // -- message event
    ws.on("message", (data) => {

        let obj = parseJSON(data);
        let objBroadcast = {};

        // -- obj property 'type' to handle message event
        switch (obj.type) {
            case "text":
                // message to clients
                objBroadcast = {
                    type: "text",
                    msg: obj.msg,
                    nickname: obj.nickname,
                };
                broadcastButExclude(wss, ws, objBroadcast);
                break;

            case "url":
                // -- imagemessage
                objBroadcast = {
                    type: "url",
                    msg: obj.msg,
                    nickname: obj.nickname,
                };
                broadcastButExclude(wss, ws, objBroadcast);
                break;
            case "newClient": {
                // -- sets unique id 
                const id = ws.id;
                let newObj = {
                    nickname: obj.nickname,
                    id: id,
                }
                // -- push new client to array of connectedClients
                connectedClients.push(newObj);

                objBroadcast = {
                    type: "newClient",
                    nickname: obj.nickname,
                    id: id,
                    onlineClients: connectedClients,
                };

                wss.clients.forEach((client) => {
                    client.send(JSON.stringify(objBroadcast));
                });
                break;
            }
            case "someoneIsTyping": {
                let objBroadcast = {
                    type: "someoneIsTyping",
                    nickname: obj.nickname,
                    msg: obj.msg,
                };
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