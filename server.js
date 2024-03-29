// server setup
import express from "express";
import nunjucks from "nunjucks";
import { Server } from "socket.io";

const PORT = process.env.PORT || 3500;

const app = express();

nunjucks.configure('views', {
  autoescape: true,
  express: app
});

app.set('view engine', 'njk');

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

// "database"
const db = {
  startTime: '',
  players: [],
  highscores: [
    {
      score: 5,
      user: 'tester1',
      session: 'noSession',
    },
    {
      score: 2,
      user: 'tester2',
      session: 'noSession',
    },
    {
      score: 20,
      user: 'tester3',
      session: 'noSession',
    }
  ]
}

// basic routes
app.get("/", (req, res) =>{
  res.render('index');
});

app.get("/leaderboard", (req, res) =>{
  res.render('leaderboard', { startTime: db.startTime, scores: sortScores(db.highscores) });
});

// use static files
app.use(express.static('./public'))

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

// random utils?

// get server start time
function fancyDate(){
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  return (year + "-" + month + "-" + date + " " + hours + ":" + minutes);
}
// store server start time in DB
db.startTime = fancyDate();

// sort highscores
function sortScores(scores){  

  function compareNumbers(a, b) {
    return a.score - b.score;
  }

  let ascending = scores.sort(compareNumbers);
  let descending = ascending.reverse();

  return descending;

}