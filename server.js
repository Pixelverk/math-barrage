// server setup
import express from "express";
import { Server } from "socket.io";

const PORT = process.env.PORT || 3500;

const app = express();

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://127.0.0.1:5500", "http://localhost:5500"], // Live server
  },
});

// load routes
import { index } from './routes/index.js';
import { leaderboard } from './routes/leaderboard.js';

// use routes
app.use('/', index);
app.use('/game/', leaderboard);

// use static files
app.use(express.static('./public'))

// temporary storage
const db = {
  startTime: '',
  players: [],
  highscores: []
}

// import handlers
import { receiveMessage, checkAnswer } from "./functions/chatHandler.js";
import { login, checkStats } from "./functions/uiHandler.js";

// socket connection
io.on("connection", (socket) => {
  
  console.log(`${socket.id} connected`);

  socket.on("newLogin", (username) => {
    login( {username, socket, db} );
  });

  socket.on("message", ({ winId, message }) => {
    receiveMessage( {winId, message, io, socket, db} );
  });

  socket.on("answer", ({ winId, message }) => {
    checkAnswer( { winId, message, socket, db } );
  });

  socket.on("checkStats", () => {
    checkStats( { socket, db } );
  });

});