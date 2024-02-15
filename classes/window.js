import { nanoid } from "nanoid";

export class Window{
    constructor(session){
        this.id = "W_" + nanoid(10);
        this.session = session.id;
        this.owner = session.owner;
        this.height = '100';
        this.width = '300';
        this.posY = '50';
        this.posX = '50';
    }
}

export class Chat extends Window{
    constructor(session){
        super(session);
        this.type = "chat";
        this.title = "publicChat.exe";
        this.height = '200';
        this.width = '400';
        this.posY = '100';
        this.posX = '0';
    }
}

export class Task extends Window{
    constructor(session){
        super(session);
        this.type = "task";
        this.title = "solveThis.exe";
        this.value = 5;
        this.operation = "+";
        this.numOne = "1";
        this.numTwo = "1";
        this.problem = "1+1";
        this.answer = "2";
    } 
    randomize(){
        let operations = ["+", "-", "*"];
        this.operation = operations[Math.floor(Math.random() * operations.length)];
        this.numOne = Math.floor(Math.random() * 10) + 1;
        this.numTwo = Math.floor(Math.random() * 10) + 1;
        this.problem = String(this.numOne + ' ' + this.operation + ' ' + this.numTwo);
        this.answer = String(eval(this.problem));
        this.value = Math.floor(Math.random() * (5 - 1) + 1);
        this.posY = Math.floor(Math.random() * (80 - 20) + 20);
        this.posX = Math.floor(Math.random() * (80 - 20) + 20);
    }
    correct(players, socket){

        socket.emit("message", "points gained");
       
        let player = this.getOwner(players);
        
        player.session.score += this.value;

        const match = player.session.windows.findIndex((window) => {
            return window.id === this.id;
        });

        if (match) {
            player.session.windows.splice(match, 1);
        }

        setTimeout(() => {
            socket.emit("closeWindow", this.id);
        }, 1500);
    }
    wrong(players, socket){

        socket.emit("message", "life lost");

        let player = this.getOwner(players);

        player.session.lives -= 1;

        const match = player.session.windows.findIndex((window) => {
            return window.id === this.id;
        });

        if (match) {
            player.session.windows.splice(match, 1);
        }

        setTimeout(() => {
            socket.emit("closeWindow", this.id);
        }, 1500);
    }
    getOwner(players){
        let owner = players.find((player) => {
            return player.id === this.owner;
          });

        return owner;
    };
}