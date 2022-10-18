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

// -- Port 3000 for render.com
//const port = 3000;
// -- Port 80 for localhost
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

    // start websocket
    wss.handleUpgrade(req, socket, head, (ws) => {
        console.log("let user use websocket...");

        wss.emit("connection", ws, req);
    });
});

let connectedClients = [];
let disconnectedClient;

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

    wss.clients.forEach(client => {
        console.log("client id: ", client.id)
        // client.send(`{"id": "${client.id}}`)
    })

    // --- WebSocket events (ws) for single client ---

    // -- close event
    ws.on("close", () => {
        // Får ut id:t på den som lämnar
        console.log("Client disconnected", ws.id);
        console.log(
            "Number of remaining connected clients: ",
            wss.clients.size
        );

        disconnectedClient = connectedClients.find(c => c.id === ws.id);
        let indexOfDisconnectedClient = connectedClients.indexOf(disconnectedClient);
        connectedClients.splice(indexOfDisconnectedClient, 1);

        wss.clients.forEach(client => {

            client.send(JSON.stringify({
                type: 'disconnect',
                onlineClients: connectedClients,
                disconnectedClient: disconnectedClient,
            }))
        });

    });

    // -- message event
    ws.on("message", (data) => {

        let obj = parseJSON(data);
        console.log(obj)
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
                console.log("case text", objBroadcast)
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

                wss.clients.forEach((client) => {
                    client.send(JSON.stringify(objBroadcast));
                });
                // visar inte inloggade förän nästa händelse sker, enbart login eller alla händelser?
                //broadcastButExclude(wss, ws, objBroadcast);
                break;
            }
            case "someoneIsTyping": {
                let objBroadcast = {
                    type: "someoneIsTyping",
                    nickname: obj.nickname,
                    msg: obj.msg,
                };
                //console.log("case someoneIsTyping", objBroadcast)
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