import { nanoid } from "nanoid";
import { Chat, Task} from "./window.js";

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

        socket.emit("message", "round starting");

        let player = this.getOwner(players);

        this.lives = 3;
        this.score = 0;
        let queue = "empty";

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
    }
    end(players, socket){

        clearInterval(this.windowInterval);

        socket.emit("message", "round ending");

        let player = this.getOwner(players);
        
        if (player.highscore < this.score) {
            player.highscore = this.score;
            socket.emit("message", "new highscore");
        }

        this.windows = this.windows.filter((win) => win.type == 'chat');

        socket.emit("reStart", "");
        
    }
    getOwner(players){
        let owner = players.find((player) => {
            return player.id === this.owner;
          });

        return owner;
    }
}