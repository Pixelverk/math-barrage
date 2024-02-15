import { Player } from '../classes/player.js';
import { Session } from '../classes/session.js';

export function login( { username, socket, db } ) {
    
    let newPlayer = new Player(socket.id, username);
    let newSession = new Session(newPlayer);

    db.players.push(newPlayer);
    newPlayer.session =  newSession;

    console.log(`${socket.id} is now known as ${newPlayer.username}`);

    newSession.start(db.players, socket)
}

export function checkStats( { socket, db } ) {
    
    let players = db.players;
    let player = getPlayerById(players, socket.id);

    let data = {};

    data.name = player.username;
    data.highScore = player.highscore;
    data.score = player.session.score;
    data.lives = player.session.lives;
    data.session = player.session.id;

    socket.emit("receiveStats", data )
}

function getPlayerById(players, theId){
    let player = players.find((player) => {
        return player.id === theId;
    });
    return player;
};