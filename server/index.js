//server
import express from "express";
import { Server } from "socket.io";
import { nanoid } from "nanoid";

const PORT = process.env.PORT || 3500;

const app = express();

const expressServer = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

const io = new Server(expressServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://127.0.0.1:5500", "http://localhost:5500"], // Live server
  },
});

// game objects
import { Player } from "./models/player.js";
import { Session } from "./models/session.js";
import { Chat} from "./models/window.js";

// storage
const players = [];

// communication
io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);

  socket.on("newLogin", (username) => {
    
    let newPlayer = new Player(socket.id, username);
    let newSession = new Session(newPlayer);
    let newChat = new Chat(newSession);

    players.push(newPlayer);
    newPlayer.session =  newSession;
    newPlayer.session.windows.push(newChat);

    socket.emit("openWindow", newChat);

    console.log(`${socket.id} is now known as ${newPlayer.username}`);

    newSession.start(players, socket)

  });

  socket.on("message", ({ winId, message }) => {

    let player = getPlayerById(socket.id);

    let windowMatch = windowCheck(player, winId);

    //let windowType = windowMatch.type;

    if (windowMatch.type === "chat") {
      return io.emit("message", message);
    }

  });

  socket.on("answer", ({ winId, message }) => {

    let player = getPlayerById(socket.id);

    let windowMatch = windowCheck(player, winId);

    if (windowMatch && windowMatch.type === "task") {

      if (message != windowMatch.answer) {
        windowMatch.wrong(players, socket);
        let session = player.session;

        if (session.lives <= 0){
            session.end(players, socket);
            player.session = new Session(player)
            player.session.start(players, socket)
          }
          socket.emit("response", {
            winId,
            message: "Wrong answer!",
          });
          return;      
        } else {
          windowMatch.correct(players, socket);
          return socket.emit("response", {
            winId,
            message: "Correct, adding points!",
          });
        }
    } else {
      socket.emit("closeWindow", winId);
    }
  
  });

  socket.on("checkStats", (arg) => {
    
    let player = getPlayerById(socket.id);

    let data = {};

    data.name = player.username;
    data.highScore = player.highscore;
    data.score = player.session.score;
    data.lives = player.session.lives;
    data.session = player.session.id;

    socket.emit("receiveStats", data )

  });
  
  function windowCheck(player, winId){
   
    let session = player.session
    let windows = session.windows
  
    const windowIndex = windows.findIndex((window) => {
      return window.id === winId;
    });
  
    if (windowIndex == -1) return;
    
    return windows[windowIndex];
  };

  function getPlayerById(theId){
    let player = players.find((player) => {
      return player.id === theId;
    });
    return player;
  };

});


