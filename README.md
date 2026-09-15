# ♟️ JS Chess — A Chess Game Built From Scratch

A fully playable chess game built using **HTML**, **CSS**, and **vanilla JavaScript** — no frameworks, no libraries, just the DOM and a lot of logic. This project was built to understand how a real chess engine tracks state, validates moves, and detects game-ending conditions.

## Screenshots
![chess game](screenshots/chess-board-final)
![chess game](screenshots/chess-capturing)


---

## 🚀 Features

This engine handles most of the core rules of chess:

- ✅ **Full piece movement logic** — legal paths for pawns, knights, bishops, rooks, queens, and kings
- ✅ **Capturing** — pieces can capture opponent pieces following standard rules
- ✅ **Path/blocking detection** — sliding pieces (rook, bishop, queen) stop at obstructions and can't jump over pieces
- ✅ **Turn alternation** — enforces strict white/black turn order
- ✅ **Check detection** — the engine identifies when a king is under attack
- ✅ **Checkmate detection** — the game correctly ends when no legal move can escape check
- ✅ **Move validation** — prevents illegal moves, including moves that would leave your own king in check

## 🛠️ Not Yet Implemented

Being transparent about the current scope — these standard chess rules are **not implemented yet**:

- ❌ **Castling** (king-side and queen-side)
- ❌ **Pawn promotion**
- ❌ **Post-game analysis** (move evaluation, best-move suggestions, PGN export, etc.)
- ❌ En passant *(add/remove this line depending on whether you built it)*
- ❌ Stalemate / draw detection *(add/remove depending on your implementation)*

These are documented here as known limitations and potential future improvements — contributions welcome!

---

## 🧰 Tech Stack

| Technology | Purpose |
|------------|---------|
| **HTML5**  | Board structure and layout |
| **CSS3**   | Styling, board grid, piece positioning, highlights |
| **JavaScript (Vanilla)** | Game logic, move validation, state management |

No external libraries or frameworks were used — the entire engine is hand-written.

---

## 📂 Project Structure

```
chess-game/
├── index.html        # Main HTML structure of the board
├── style.css          # Board and piece styling
├── script.js           # Core game logic (moves, rules, turns, check/checkmate)
└── README.md
```

---

## 🧠 How It Works

### 1. Board Representation

The board is represented internally as an 8x8 array (or a similar grid structure), where each cell holds either `null` (empty) or a piece object describing its type and color.

```javascript
// Example board representation
const board = Array.from({ length: 8 }, () => Array(8).fill(null));

// Example piece object
const piece = {
  type: "knight",   // pawn, rook, knight, bishop, queen, king
  color: "white",    // white or black
  hasMoved: false
};
```

### 2. Generating Legal Moves

Each piece type has its own move-generation function. For example, a simplified version of how the rook's sliding movement (and path blocking) works:

```javascript
function getRookMoves(row, col, board) {
  const moves = [];
  const directions = [
    [1, 0], [-1, 0], [0, 1], [0, -1] // down, up, right, left
  ];

  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;

    while (isOnBoard(r, c)) {
      if (board[r][c] === null) {
        moves.push({ row: r, col: c });
      } else {
        // Capture if it's an enemy piece, otherwise stop
        if (board[r][c].color !== board[row][col].color) {
          moves.push({ row: r, col: c });
        }
        break; // path blocked, sliding stops here
      }
      r += dr;
      c += dc;
    }
  }

  return moves;
}
```

### 3. Check Detection

After every simulated move, the engine checks whether the moving player's own king would be under attack. This is done by scanning all opposing pieces' legal moves and seeing if any of them target the king's square.

```javascript
function isKingInCheck(kingColor, board) {
  const kingPos = findKing(kingColor, board);

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color !== kingColor) {
        const enemyMoves = getLegalMoves(row, col, board);
        if (enemyMoves.some(m => m.row === kingPos.row && m.col === kingPos.col)) {
          return true;
        }
      }
    }
  }
  return false;
}
```

### 4. Checkmate Detection

Checkmate is confirmed when the current player **is in check** and **has no legal move** — across every piece they own — that removes the check.

```javascript
function isCheckmate(color, board) {
  if (!isKingInCheck(color, board)) return false;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getLegalMoves(row, col, board);
        for (const move of moves) {
          const simulatedBoard = simulateMove(board, { row, col }, move);
          if (!isKingInCheck(color, simulatedBoard)) {
            return false; // found a move that escapes check
          }
        }
      }
    }
  }
  return true; // no escape found
}
```

### 5. Turn Management

A simple state variable tracks whose turn it is, and toggles after every valid move.

```javascript
let currentTurn = "white";

function switchTurn() {
  currentTurn = currentTurn === "white" ? "black" : "white";
}
```

---

## ▶️ How to Run Locally

No build tools or installations required.

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/chess-game.git
   ```
2. Navigate into the project folder
   ```bash
   cd chess-game
   ```
3. Open `index.html` directly in your browser
   ```bash
   open index.html   # or double-click the file
   ```

That's it — no dependencies, no npm install.

---

## 🗺️ Roadmap / Future Improvements

- [ ] Implement castling (king-side & queen-side)
- [ ] Implement pawn promotion (with a UI to choose the promoted piece)
- [ ] Add stalemate and draw detection
- [ ] Add move history / notation (PGN-style)
- [ ] Add post-game analysis
- [ ] Add an AI opponent (minimax / alpha-beta pruning)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! If you'd like to help implement castling, promotion, or game analysis, feel free to open a pull request or start a discussion.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/castling`)
3. Commit your changes (`git commit -m "Add castling logic"`)
4. Push to the branch (`git push origin feature/castling`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙌 Acknowledgements

Built as a personal learning project to understand chess rule logic and vanilla JavaScript DOM manipulation without relying on any chess libraries.
