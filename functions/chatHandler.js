import { Session } from '../classes/session.js';

export function receiveMessage( {winId, message, io, socket, db} ){
    
    let players = db.players;
    let player = getPlayerById(players, socket.id);

    let windowMatch = windowCheck(player, winId);

    if (windowMatch && windowMatch.type === "chat") {
      return io.emit("message", message);
    }
}

export function checkAnswer( { winId, message, socket, db } ){
    
    let players = db.players;
    let player = getPlayerById(players, socket.id);

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
}

function windowCheck(player, winId){
   
    let session = player.session
    let windows = session.windows
  
    const windowIndex = windows.findIndex((window) => {
      return window.id === winId;
    });
  
    if (windowIndex == -1) return;
    
    return windows[windowIndex];
  };

function getPlayerById(players, theId){
    let player = players.find((player) => {
        return player.id === theId;
    });
    return player;
};