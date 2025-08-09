const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let currentTurn = "X";
let board = Array(9).fill(null);
let winner = null;

function checkWinner() {
    const winningCombos = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];
    for (let combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], combo };
        }
    }
    if (!board.includes(null)) {
        return { winner: "Draw", combo: [] };
    }
    return null;
}

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.emit("boardUpdate", { board, currentTurn, winner, combo: [] });

    socket.on("makeMove", (index) => {
        if (!winner && board[index] === null) {
            board[index] = currentTurn;
            const result = checkWinner();
            if (result) {
                winner = result.winner;
                io.emit("boardUpdate", { board, currentTurn, winner, combo: result.combo });
            } else {
                currentTurn = currentTurn === "X" ? "O" : "X";
                io.emit("boardUpdate", { board, currentTurn, winner, combo: [] });
            }
        }
    });

    socket.on("resetGame", () => {
        board = Array(9).fill(null);
        currentTurn = "X";
        winner = null;
        io.emit("boardUpdate", { board, currentTurn, winner, combo: [] });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

http.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
