// Elements
const login = document.getElementById("login");
const loginForm = document.getElementById("login-form");
const game = document.getElementById("game");

const socket = io("ws://localhost:3500");

let windowCount = 0;

// login start
loginForm.addEventListener("submit", loginUser);

function loginUser(e) {
  e.preventDefault();

  const username = e.target.elements.username.value.trim();

  if (username) {
    socket.emit("newLogin", username);
    login.classList.toggle("hidden");
    game.classList.toggle("hidden");
  } else {
    window.alert("error! enter a name");
  }
}

// login end

function sendMessage(e) {
  e.target.elements;

  const input = document.querySelector("input");

  if (input.value) {
    socket.emit("message", {
      winId: e.target.dataset.pid,
      message: input.value,
    });
    input.value = "";
  }

  input.focus();
}

let prompts = document.querySelectorAll(".prompt");

prompts.forEach((prompt) => {
  prompt.addEventListener("submit", sendMessage(prompt));
});

// Listen for messages and show them in the list
socket.on("message", (message) => {
  const li = document.createElement("li");
  li.textContent = message;
  document.querySelector(`[data-type="chat"] ul`).appendChild(li);
});

socket.on("response", ({ winId, message }) => {
  let element = document.querySelector(`[data-pid="${winId}"] p`)
  if (element){
    element.innerHTML = message;
  }

});

socket.on(
  "openWindow",
  ({ id, type, height, width, posX, posY, title, problem }) => {
    let x = new TWindow(id, type, height, width, posX, posY, title, problem);
    x.render();
    socket.emit("checkStats", "");
  }
);

socket.on("closeWindow", (winId) => {
  let element = document.querySelector(`[data-pid="${winId}"]`)
  if (element){
    element.classList.remove("open");
    element.remove();
  }
  socket.emit("checkStats", "");
});

socket.on("receiveStats", (data) => {
  let statBox = document.querySelector(`.statBox`);
  let name = statBox.querySelector("#userName");
  let highScore = statBox.querySelector("#highScore");
  let score = statBox.querySelector("#score");
  let lives = statBox.querySelector("#lives");

  name.innerHTML = data.name;
  highScore.innerHTML = "Best: " + data.highScore;
  score.innerHTML = "Score: " + data.score;
  lives.innerHTML = "Lives: " + data.lives;

});

socket.on("reStart", () => {
  let items = document.querySelectorAll("div[data-type='task']")
  for (let i = 0; i < items.length; i++) {
    items[i].remove();
  }
});

/**
 * Terminal Window
 */
class TWindow {
  constructor(
    id,
    type,
    height,
    width,
    posX,
    posY,
    title,
    problem
    )
    {
    this.id = id;
    this.type = type;
    this.height = height;
    this.width = width;
    this.posX = posX;
    this.posY = posY;
    this.title = title;
    this.content = problem;
    this.element = this.init();
  }

  init() {
    const heightInPercent = (this.height / game.clientHeight) * 100;
    const widthInPercent = (this.width / game.clientWidth) * 100;

    const maxTop =
      ((game.clientHeight - this.height) / game.clientHeight) * 100;
    const maxLeft = ((game.clientWidth - this.width) / game.clientWidth) * 100;

    let x = this.posX - widthInPercent / 2;
    x = Math.max(0, Math.min(maxLeft, x));

    let y = this.posY - heightInPercent / 2;
    y = Math.max(0, Math.min(maxTop, y));

    const header = this.getHeader();
    const contentArea = this.getContentArea(this.content);
    const prompt = this.getPrompt();

    const element = document.createElement("div");
    element.setAttribute("data-pid", this.id);
    element.setAttribute("data-type", this.type);
    element.style.height = `${heightInPercent}%`;
    element.style.width = `${widthInPercent}%`;
    element.classList.add("win");
    element.style.maxHeight = `${this.height}px`;
    element.style.maxWidth = `${this.width}px`;
    element.style.minHeight = `${this.height / 2}px`;
    element.style.minWidth = `${this.width / 2}px`;
    element.style.top = `${y}%`;
    element.style.left = `${x}%`;

    element.appendChild(header);
    
    element.appendChild(contentArea);

    element.appendChild(prompt);

    dragElement(element);

    return element;
  }

  getHeader() {
    const header = document.createElement("div");
    const title = document.createTextNode(this.title);
    header.classList.add("win__header");
    header.appendChild(title);
    return header;
  }

  getContentArea(content){
    const contentArea = document.createElement("div");
    contentArea.classList.add("win__content");
    if (this.type == "chat"){
      const ul = document.createElement("ul");
      contentArea.appendChild(ul);
    } else {
      const p = document.createElement("p");
      p.innerHTML = content;
      contentArea.appendChild(p);
    }
    return contentArea;
  }

  getPrompt() {
    const form = document.createElement("form");
    const input = document.createElement("input");
    form.classList.add("win__form")
    input.setAttribute("type", "text");
    form.appendChild(input);

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      let input = e.target.querySelector("input");

      //console.log(e.target.parentNode.dataset.pid);

      if (input.value) {
        socket.emit("message", {
          winId: e.target.parentNode.dataset.pid,
          message: input.value,
        });
        input.value = "";
      }

      input.focus();
    });

    return form;
  }

  render() {
    game.appendChild(this.element);

    //this.element.querySelector("input").focus();

    //console.log(`Opened: ${this.title}`);

    setTimeout(() => {
      this.element.classList.add("open");
    }, 100);
  }
}





// Make the DIV element draggable:
function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  if (elmnt.querySelector(".win__header")) {
    // if present, the header is where you move the DIV from:
    elmnt.querySelector(".win__header").onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    elmnt.classList.add("being-dragged");
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = (e) => {
      closeDragElement(e);
    };
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;

    if (document.querySelector(".front")) {
      document.querySelector(".front").classList.remove("front");
    }

    elmnt.classList.add("front");
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement(e) {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
    e.target.classList.remove("being-dragged");
  }
}


// audio player
var bgMusic = document.getElementById("bgAudio"); 

function playAudio() { 
  bgMusic.play(); 
} 

function pauseAudio() { 
  bgMusic.pause(); 
} 