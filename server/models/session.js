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
    start(socket){

        socket.emit("message", "round starting");

        this.lives = 3;
        this.score = 0

        setInterval(() => {
            if (this.windows.length <= 3){
                let task = new Task(this)
                task.randomize()
                this.windows.push(task)
                setTimeout(() => {
                    socket.emit("openWindow", task);
                }, Math.floor(Math.random() * 9000));
            }
        }, 1000);
    }
    end(players, socket){

        socket.emit("message", "round ending");

        let player = this.getOwner(players);
        
        if (player.highscore < this.score) {
            player.highscore = this.score;
            socket.emit("message", "new highscore");
        }

        this.windows = this.windows.filter((win) => win.type == 'chat');

        socket.emit("reStart", "");
        setTimeout(() => {
            this.start(socket);
        }, 3000);
        
    }
    getOwner(players){
        let owner = players.find((player) => {
            return player.id === this.owner;
          });

        return owner;
    }
}