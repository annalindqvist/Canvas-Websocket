# Canvas-Websocket

Welcome to my first schoolproject working with canvas and websocket. I have made an simple chat where you can send textmessages & add emojis from picmo's emojipicker. Also you paint an simple drawing with canvas and send as an image in the chat. 

- I have this project hosted on render.com. Check it out here: https://chitchatapp.onrender.com

-------------------------------------

If you want to clone the project to your computer follow this steps: 

1. copy this link: https://github.com/annalindqvist/Canvas-Websocket.git
2. in vsc terminal type: git clone https://github.com/annalindqvist/Canvas-Websocket.git and press enter.
- 2.1: cd into project " cd Canvas-Websocket.
3. to run this on you localhost you need to change what port you run it on. 
- 3.1: open server.js and make sure port is declared as: "const port = 80;".
- 3.2: open public/js/code.js and make sure websocket is declared as: "const websocket = new WebSocket("ws://localhost:80");".
- 3.4: dont forget to save! 
4. to start project simply type: "node server.js" in terminal


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