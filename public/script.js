const socket = io("https://tictactoe-production-9052.up.railway.app");

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");

let board = Array(9).fill(null);
let currentTurn = "X";
let winner = null;
let winningCombo = [];

const moveSound = new Audio("move.mp3");
const winSound = new Audio("win.mp3");

function renderBoard() {
    boardElement.innerHTML = "";
    board.forEach((cell, index) => {
        const cellDiv = document.createElement("div");
        cellDiv.classList.add("cell");
        if (winningCombo.includes(index)) {
            cellDiv.classList.add("winning-cell");
        }
        cellDiv.textContent = cell || "";
        cellDiv.addEventListener("click", () => {
            if (!winner) socket.emit("makeMove", index);
        });
        boardElement.appendChild(cellDiv);
    });
}

socket.on("boardUpdate", (data) => {
    board = data.board;
    currentTurn = data.currentTurn;
    winner = data.winner;
    winningCombo = data.combo;

    if (winner) {
        if (winner === "Draw") {
            statusElement.textContent = "It's a Draw!";
        } else {
            statusElement.textContent = `Winner: ${winner}`;
            winSound.play();
        }
    } else {
        statusElement.textContent = `Current Turn: ${currentTurn}`;
        moveSound.play();
    }

    renderBoard();
});

resetBtn.addEventListener("click", () => {
    socket.emit("resetGame");
});

renderBoard();
