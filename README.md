# Canvas-Websocket

Welcome to my first schoolproject working with canvas and websocket. I have made an simple chat where you can send textmessages & add emojis from picmo's emojipicker. Also you paint an simple drawing with canvas and send as an image in the chat. 

- I have this project hosted on render.com. Check it out here: https://chitchatapp.onrender.com

-------------------------------------

If you want to clone the project to your computer follow this steps: 

1. copy this link: https://github.com/annalindqvist/Canvas-Websocket.git
2. in vsc terminal type: git clone https://github.com/annalindqvist/Canvas-Websocket.git and press enter.
- 2.1: cd into project " cd Canvas-Websocket.
- 2.2: run "npm install" in terminal
3. to run this on you localhost you need to change what port you run it on. 
- 3.1: open server.js and make sure port is declared as: "const port = 80;".
- 3.2: open public/js/code.js and make sure websocket is declared as: "const websocket = new WebSocket("ws://localhost:80");".
- 3.4: dont forget to save! 
4. to start project simply type: "node server.js" in terminal


-------------------------------------

# Questions about the buttons in the chat?

- 😎 = to open the emojipicker from picmo
- 🖌️ = to open the canvas or when open press again to close & clear the canvas.
- The button next to 🖌️, (paperplain with hearts), you send your message or drawing.

-------------------------------------
# Skolans krav:

Minimum krav: 
1. Funktionalitet i applikationen ska vara baserad på både websockets och canvas - Check
2. Applikationen ska kunna användas meningsfullt med fler än en uppkopplad klient - Check
3. Använd ws biblotektet - Check
4. Applikationen kan ha delar med 'vanliga' DOM element för ex chatt - Check
5. En README.md som beskriver hur man installerar och använder applikationen - Check

// Extra stuff jag valde att göra:
- Hosta på render.com

// Saker jag önskade var bättre
- Funktionen om någon skriver, den bör sluta direkt när man klickar på skickaknappen, gör det inte nu. Räknar ner från senaste knapptrycket endå.
- Designen behöver mer kärlek
- Roligare canvas-funktion

--------------------------------------
# after-presentation branch
A new branch for the work I plan on doing after the presentation of this case. 

## Todo:

###### Canvas: 
- [] paint on mobile not only desktop
- [] painting offset(?) when resizing screen
- [] overall the canvas-popup design
- [] choose from ALL colors not only a few

###### Chat: 
- [] when someone is typing and sends a message so fast that the text "... is typing" shows up after the message is sent. Should it be like that? 
- [] overall design
- [] emoji-picker mobile design
- [] send image from mobile/computer..?
- [] on mobile - open camera and take picture..?

###### Startpage;
- [] overall design

###### Overall code: 
- [] minimize functions