const statusDisplay = document.getElementById("status");
const cells = document.querySelectorAll(".cell");
const resetBtn = document.getElementById("reset-btn");
const resetScoreBtn = document.getElementById("reset-score-btn");
const modeSelect = document.getElementById("mode");

const scoreXEl = document.getElementById("score-x");
const scoreOEl = document.getElementById("score-o");
const scoreDrawEl = document.getElementById("score-draw");

const scoreXBox = document.getElementById("score-x-box");
const scoreOBox = document.getElementById("score-o-box");

let gameActive = true;
let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameMode = modeSelect.value;

let scores = {
  X: 0,
  O: 0,
  draw: 0,
};

const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function updateScoreboard() {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDrawEl.textContent = scores.draw;
}

function highlightTurn() {
  scoreXBox.classList.remove("turn-active");
  scoreOBox.classList.remove("turn-active");

  if (currentPlayer === "X") {
    scoreXBox.classList.add("turn-active");
  } else {
    scoreOBox.classList.add("turn-active");
  }
}

function updateStatusTurn() {
  if (!gameActive) return;

  highlightTurn();

  if (gameMode === "ai") {
    statusDisplay.textContent =
      currentPlayer === "X" ? "Your turn (X)" : "Computer's turn (O)";
  } else {
    statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
  }
}

function handleCellClick(e) {
  const clickedCell = e.target;
  const cellIndex = parseInt(clickedCell.getAttribute("data-cell-index"), 10);

  if (!gameActive || gameState[cellIndex] !== "") {
    return;
  }

  if (gameMode === "ai" && currentPlayer === "O") {
    return;
  }

  makeMove(cellIndex);
  checkResult();
}

function makeMove(index) {
  gameState[index] = currentPlayer;
  const cell = document.querySelector(`.cell[data-cell-index="${index}"]`);
  cell.textContent = currentPlayer;
  cell.classList.add("taken");
  
  cell.style.animation = "none";
  setTimeout(() => {
    cell.style.animation = "cellPop 0.3s ease";
  }, 10);
}

function checkResult() {
  let roundWon = false;
  let winningLine = [];

  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];

    if (gameState[a] === "" || gameState[b] === "" || gameState[c] === "") {
      continue;
    }

    if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
      roundWon = true;
      winningLine = [a, b, c];
      break;
    }
  }

  if (roundWon) {
    gameActive = false;

    if (gameMode === "ai") {
      if (currentPlayer === "X") {
        statusDisplay.textContent = "You win! 🎉";
      } else {
        statusDisplay.textContent = "Computer wins! 🤖";
      }
    } else {
      statusDisplay.textContent = `Player ${currentPlayer} wins! 🎉`;
    }

    scores[currentPlayer] += 1;
    updateScoreboard();
    highlightWinningCells(winningLine);
    
    scoreXBox.classList.remove("turn-active");
    scoreOBox.classList.remove("turn-active");
    return;
  }

  const roundDraw = !gameState.includes("");
  if (roundDraw) {
    statusDisplay.textContent = "It's a draw! 🤝";
    gameActive = false;
    scores.draw += 1;
    updateScoreboard();
    
    scoreXBox.classList.remove("turn-active");
    scoreOBox.classList.remove("turn-active");
    return;
  }

  switchPlayer();
}

function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatusTurn();

  if (gameMode === "ai" && currentPlayer === "O" && gameActive) {
    setTimeout(aiMove, 500);
  }
}

function aiMove() {
  if (!gameActive || gameMode !== "ai" || currentPlayer !== "O") {
    return;
  }

  const bestMove = findBestMove();
  
  makeMove(bestMove);
  checkResult();
}

function findBestMove() {
  let bestMove = checkWinningMove("O");
  if (bestMove !== -1) return bestMove;

  bestMove = checkWinningMove("X");
  if (bestMove !== -1) return bestMove;

  if (gameState[4] === "") return 4;

  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(i => gameState[i] === "");
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  const availableIndices = gameState
    .map((val, idx) => (val === "" ? idx : null))
    .filter(val => val !== null);

  return availableIndices[Math.floor(Math.random() * availableIndices.length)];
}

function checkWinningMove(player) {
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    const line = [gameState[a], gameState[b], gameState[c]];
    
    if (line.filter(cell => cell === player).length === 2 && 
        line.filter(cell => cell === "").length === 1) {
      if (gameState[a] === "") return a;
      if (gameState[b] === "") return b;
      if (gameState[c] === "") return c;
    }
  }
  return -1;
}

function highlightWinningCells(indices) {
  indices.forEach((i) => {
    cells[i].classList.add("win");
  });
}

function resetGame() {
  gameActive = true;
  currentPlayer = "X";
  gameState = ["", "", "", "", "", "", "", "", ""];

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("taken", "win");
    cell.style.animation = "none";
  });

  updateStatusTurn();
}

function resetScores() {
  scores = { X: 0, O: 0, draw: 0 };
  updateScoreboard();
}

cells.forEach((cell) => {
  cell.addEventListener("click", handleCellClick);
});

resetBtn.addEventListener("click", resetGame);

resetScoreBtn.addEventListener("click", resetScores);

modeSelect.addEventListener("change", () => {
  gameMode = modeSelect.value;
  resetGame();
});

updateScoreboard();
updateStatusTurn();