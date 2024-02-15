import { nanoid } from "nanoid";
import { Chat, Task } from './window.js';

export class Session{
    constructor(player){
        this.id = "S_" + nanoid(10);
        this.owner = player.id;
        this.score = 0;
        this.speed = 1;
        this.lives = 3;
        this.windows = []
    }
    start(players, socket){

        let player = this.getOwner(players);

        this.lives = 3;
        this.score = 0;
        let queue = "empty";

        let newChat = new Chat(this);
        this.windows.push(newChat);
        socket.emit("openWindow", newChat);

        this.windowInterval = setInterval(() => {
          
            if (this.windows.length <= 3 && queue === "empty"){
                queue = "full";
                setTimeout(() => {
                    let task = new Task(this);
                    task.randomize();
                    if (task.session == player.session.id){
                        this.windows.push(task)
                        socket.emit("openWindow", task);
                    } else {
                        return;
                    }
                    queue = "empty";
                }, Math.floor(Math.random() * 8000) + 1 );
            }
            
        }, 1000);

        socket.emit("message", "round started");

    }
    end(players, socket, db){

        clearInterval(this.windowInterval);

        socket.emit("message", "round ending");

        let player = this.getOwner(players);
        
        if (player.highscore < this.score) {
            player.highscore = this.score;
            socket.emit("message", "new highscore");

            let hs = {
                score: this.score,
                user: player.username,
                session: this.id,
            }
            db.highscores.push(hs)
            console.log(db.highscores)

        }

        this.windows = []

        socket.emit("removeTasks", "");
        
    }
    getOwner(players){
        let owner = players.find((player) => {
            return player.id === this.owner;
          });

        return owner;
    }
}