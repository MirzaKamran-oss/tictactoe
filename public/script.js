const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // ya tum apna Vercel URL bhi de sakte ho
    methods: ["GET", "POST"]
  }
});

let board = Array(9).fill(null);
let currentTurn = "X";
let winner = null;
let winningCombo = [];

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.emit("boardUpdate", { board, currentTurn, winner, combo: winningCombo });

  socket.on("makeMove", (index) => {
    if (!board[index] && !winner) {
      board[index] = currentTurn;
      checkWinner();
      currentTurn = currentTurn === "X" ? "O" : "X";
      io.emit("boardUpdate", { board, currentTurn, winner, combo: winningCombo });
    }
  });

  socket.on("resetGame", () => {
    board = Array(9).fill(null);
    currentTurn = "X";
    winner = null;
    winningCombo = [];
    io.emit("boardUpdate", { board, currentTurn, winner, combo: winningCombo });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

function checkWinner() {
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let combo of combos) {
    const [a,b,c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      winner = board[a];
      winningCombo = combo;
      return;
    }
  }
  if (!board.includes(null)) winner = "Draw";
}

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
