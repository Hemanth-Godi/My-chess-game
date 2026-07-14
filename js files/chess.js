import {piecesMap} from "./pieces-map.js";
const play = document.querySelector(".play-area");
const boardElement = document.querySelector(".board");
const sounds = {
  move:new Audio("sound/move.mp3"),
  capture:new Audio("sound/capture.mp3"),
  check:new Audio("sound/check.ogg"),
  checkmate:new Audio("sound/checkmate.mp3")
};

for(let i=0;i<64;i++){
  const square = document.createElement("div");
  square.classList.add("square");
  square.dataset.row = Math.floor(i/8);
  square.dataset.col = i%8;
  play.appendChild(square);
}
const board = [
  ["br","bn","bb","bq","bk","bb","bn","br"],
  ["bp","bp","bp","bp","bp","bp","bp","bp"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["wp","wp","wp","wp","wp","wp","wp","wp"],
  ["wr","wn","wb","wq","wk","wb","wn","wr"]
];

function renderBoard(){
const squares = document.querySelectorAll(".square");
for(let i=0;i<8;i++){
  for(let j=0;j<8;j++){
    squares[i*8+j].innerHTML = "";
    const piece = board[i][j];
    if(piece!=""){
      squares[i*8+j].innerHTML=`<img src="${piecesMap[piece]}" alt="${piece}"
      class=piece>`;
    }
  }
}
}
renderBoard();

let selected = null;
let currentPlayer = "w";
let gameOver = false;
const squares = document.querySelectorAll(".square");
squares.forEach(square=>{
  square.addEventListener("click",()=>{
    if(gameOver){
      return;
    }
    const row = Number(square.dataset.row);
    const col = Number(square.dataset.col);
    const piece = board[row][col];
    if(selected===null){
      if(piece!="" && piece[0]===currentPlayer){
        selectPiece(row,col);
      }
    }
    else{
      if(selected.row===row && selected.col===col){
        clearSelection();
        return;
      }
      const selectedPiece = board[selected.row][selected.col];
      const targetPiece = board[row][col];
      if(targetPiece!="" && targetPiece[0]===selectedPiece[0]){
        if(targetPiece[0]===currentPlayer){
          selectPiece(row,col);
        }
        else{
          clearSelection();
        }
        return;
      }
      const color = selectedPiece[0];
      const isCapture = targetPiece!=="";
      const validMove = canMoveTo(
        selectedPiece,
        selected.row,
        selected.col,
        row,
        col,
        color
      );
     if(validMove){
      board[row][col] = board[selected.row][selected.col];
      board[selected.row][selected.col] = "";
      clearSelection();
      renderBoard();
      const opponent =
        color==="w"
        ? "b"
        : "w";
      if(isCheckmate(opponent)){
        playSound("checkmate");
        endGame(color);
        return;
      }
      if(isKingInCheck(opponent)){
        playSound("check");
        console.log(
          opponent==="w"
          ? "White in check"
          : "Black in check"
        );
      }
      else if(isCapture){
        playSound("capture");
      }
      else{
        playSound("move");
      }
      currentPlayer = currentPlayer==="w"?"b":"w";
      console.log("Turn",currentPlayer);
     }
     clearSelection();
   }
  });
});

function selectPiece(row,col){
  selected = {
    row,
    col
  };
  showMoveHints(row,col);
}

function clearSelection(){
  selected = null;
  clearMoveHints();
}

function clearMoveHints(){
  squares.forEach(square=>{
    square.classList.remove(
      "selected",
      "move-hint",
      "capture-hint"
    );
  });
}

function playSound(soundName){
  const sound = sounds[soundName];
  if(!sound){
    return;
  }
  sound.currentTime = 0;
  sound.play().catch(()=>{});
}

function endGame(winnerColor){
  gameOver = true;
  clearSelection();
  const winner =
    winnerColor==="w"
    ? "White"
    : "Black";
  const overlay = document.createElement("div");
  overlay.classList.add("game-over");
  overlay.innerHTML=`
    <div class="game-over-panel">
      <span class="game-over-label">Checkmate</span>
      <strong>${winner} wins</strong>
    </div>
  `;
  boardElement.appendChild(overlay);
}

function showMoveHints(row,col){
  clearMoveHints();
  const selectedSquare = squares[row*8+col];
  selectedSquare.classList.add("selected");
  const legalMoves = getLegalMoves(row,col);
  legalMoves.forEach(move=>{
    const square = squares[move.row*8+move.col];
    if(board[move.row][move.col]===""){
      square.classList.add("move-hint");
    }
    else{
      square.classList.add("capture-hint");
    }
  });
}

function getLegalMoves(fromRow,fromCol){
  const piece = board[fromRow][fromCol];
  if(piece==="" || piece[0]!==currentPlayer){
    return [];
  }
  const legalMoves = [];
  for(let toRow=0; toRow<8; toRow++){
    for(let toCol=0; toCol<8; toCol++){
      if(canMoveTo(
        piece,
        fromRow,
        fromCol,
        toRow,
        toCol,
        piece[0]
      )){
        legalMoves.push({
          row:toRow,
          col:toCol
        });
      }
    }
  }
  return legalMoves;
}

function canMoveTo(
  piece,
  fromRow,
  fromCol,
  toRow,
  toCol,
  color
){
  if(fromRow===toRow && fromCol===toCol){
    return false;
  }
  const targetPiece = board[toRow][toCol];
  if(targetPiece!=="" && targetPiece[0]===color){
    return false;
  }
  const validMove = isValidMove(
    piece,
    fromRow,
    fromCol,
    toRow,
    toCol
  );
  if(!validMove){
    return false;
  }
  const pathClear = isPathClear(
    piece,
    fromRow,
    fromCol,
    toRow,
    toCol
  );
  if(!pathClear){
    return false;
  }
  return !wouldLeaveKingInCheck(
    fromRow,
    fromCol,
    toRow,
    toCol,
    color
  );
}

function isValidMove(piece,fromRow,fromCol,toRow,toCol){
  switch(piece){
    case "wr":
    case "br":
      return isValidRookMove(fromRow,fromCol,toRow,toCol);

    case "wb":
    case "bb":
      return isValidBishopMove(fromRow,fromCol,toRow,toCol);

    case "wn":
    case "bn":
      return isValidKnightMove(fromRow,fromCol,toRow,toCol);

    case "wq":
    case "bq":
      return isValidQueenMove(fromRow,fromCol,toRow,toCol);

    case "wk":
    case "bk":
      return isValidKingMove(fromRow,fromCol,toRow,toCol);

    case "wp":
    case "bp":
      return isValidPawnMove(piece,fromRow,fromCol,toRow,toCol);
  }
  return false;
}
function isValidRookMove(fromRow,fromCol,toRow,toCol){
  return(
    fromRow===toRow || fromCol===toCol
  );
}
function isValidBishopMove(fromRow,fromCol,toRow,toCol){
  return(
    Math.abs(toRow-fromRow)===Math.abs(toCol-fromCol)
  );
}
function isValidKnightMove(fromRow,fromCol,toRow,toCol){
  const rowDiff = Math.abs(toRow-fromRow);
  const colDiff = Math.abs(toCol-fromCol);
  return(
    (rowDiff===2 && colDiff===1) || (rowDiff===1 && colDiff===2)
  );
}
function isValidQueenMove(fromRow,fromCol,toRow,toCol){
  return(
    isValidRookMove(fromRow,fromCol,toRow,toCol) ||
    isValidBishopMove(fromRow,fromCol,toRow,toCol)
  );
}
function isValidKingMove(fromRow,fromCol,toRow,toCol){
  const rowDiff = Math.abs(toRow-fromRow);
  const colDiff = Math.abs(toCol-fromCol);
  return(
    rowDiff<=1 && colDiff<=1
  );
}
function isValidPawnMove(piece,fromRow,fromCol,toRow,toCol){
  //diognal capturing
  if(piece==="wp" && toRow===fromRow-1 && Math.abs(toCol-fromCol)===1){
    const targetPiece = board[toRow][toCol];
    return(
      targetPiece!=="" && targetPiece[0]==="b"
    );
  }
  if(piece==="bp" &&toRow===fromRow+1 && Math.abs(toCol-fromCol)===1){
    const targetPiece = board[toRow][toCol];
    return(
      targetPiece!=="" && targetPiece[0]==="w"
    );
  }
  if(fromCol!==toCol){
    return false;
  }
  if(piece==="wp"){
    if(toRow===fromRow-1 && board[toRow][toCol]===""){
      return true;
    }
    if(
      fromRow===6 &&
      toRow===4 &&
      board[5][fromCol]==="" &&
      board[toRow][toCol]===""
    ){
      return true;
    }
  }
  if(piece==="bp"){
    if(toRow===fromRow+1 && board[toRow][toCol]===""){
      return true;
    } 
    if(
      fromRow===1 &&
      toRow===3 &&
      board[2][fromCol]==="" &&
      board[toRow][toCol]===""
    ){
      return true;
    }
  }
  return false;
}
//Collision detection
function isPathClearRook(
    fromRow,
    fromCol,
    toRow,
    toCol
){
    if(fromRow === toRow){
        const step =
            toCol > fromCol ? 1 : -1;
        for(
            let col = fromCol + step;
            col !== toCol;
            col += step
        ){
            if(board[fromRow][col] !== ""){
                return false;
            }
        }
    }
    if(fromCol === toCol){
        const step =
            toRow > fromRow ? 1 : -1;
        for(
            let row = fromRow + step;
            row !== toRow;
            row += step
        ){
            if(board[row][fromCol] !== ""){
                return false;
            }
        }
    }
    return true;
}

function isPathClearBishop(
    fromRow,
    fromCol,
    toRow,
    toCol
){
    const rowStep =
        toRow > fromRow ? 1 : -1;
    const colStep =
        toCol > fromCol ? 1 : -1;
    let row = fromRow + rowStep;
    let col = fromCol + colStep;
    while(
        row !== toRow &&
        col !== toCol
    ){
        if(board[row][col] !== ""){
            return false;
        }
        row += rowStep;
        col += colStep;
    }
    return true;
}

function isPathClearQueen(
    fromRow,
    fromCol,
    toRow,
    toCol
){
    if(
        fromRow === toRow ||
        fromCol === toCol
    ){
        return isPathClearRook(
            fromRow,
            fromCol,
            toRow,
            toCol
        );
    }
    return isPathClearBishop(
        fromRow,
        fromCol,
        toRow,
        toCol
    );
}
//check detection
function findKing(color){
    const king = color + "k";
    for(let row=0; row<8; row++){
        for(let col=0; col<8; col++){
            if(board[row][col] === king){
                return {
                    row,
                    col
                };
            }
        }
    }
    return null;
}
function isPathClear(
    piece,
    fromRow,
    fromCol,
    toRow,
    toCol
){
    if(piece==="wr" || piece==="br"){
        return isPathClearRook(
            fromRow,
            fromCol,
            toRow,
            toCol
        );
    }
    if(piece==="wb" || piece==="bb"){
        return isPathClearBishop(
            fromRow,
            fromCol,
            toRow,
            toCol
        );
    }
    if(piece==="wq" || piece==="bq"){
        return isPathClearQueen(
            fromRow,
            fromCol,
            toRow,
            toCol
        );
    }
    return true;
}
function isKingInCheck(color){
    const kingPos = findKing(color);
    const enemyColor =
        color === "w"
        ? "b"
        : "w";
    for(let row=0; row<8; row++){
        for(let col=0; col<8; col++){
            const piece = board[row][col];
            if(
                piece !== "" &&
                piece[0] === enemyColor
            ){
                const validMove =
                    isValidMove(
                        piece,
                        row,
                        col,
                        kingPos.row,
                        kingPos.col
                    );
                const pathClear =
                    isPathClear(
                        piece,
                        row,
                        col,
                        kingPos.row,
                        kingPos.col
                    );
                if(validMove && pathClear){
                    return true;
                }
            }
        }
    }
    return false;
}
function wouldLeaveKingInCheck(
    fromRow,
    fromCol,
    toRow,
    toCol,
    color
){
    const movingPiece =
        board[fromRow][fromCol];
    const capturedPiece =
        board[toRow][toCol];
    // Make move temporarily
    board[toRow][toCol] =
        movingPiece;
    board[fromRow][fromCol] =
        "";
    // Check king safety
    const kingInCheck =
        isKingInCheck(color);
    // Undo move
    board[fromRow][fromCol] =
        movingPiece;
    board[toRow][toCol] =
        capturedPiece;
    return kingInCheck;
}
function isCheckmate(color){
    if(!isKingInCheck(color)){
        return false;
    }
    for(let fromRow=0; fromRow<8; fromRow++){
        for(let fromCol=0; fromCol<8; fromCol++){
            const piece = board[fromRow][fromCol];
            if(
                piece === "" ||
                piece[0] !== color
            ){
                continue;
            }
            for(let toRow=0; toRow<8; toRow++){
                for(let toCol=0; toCol<8; toCol++){
                    if(
                        fromRow===toRow &&
                        fromCol===toCol
                    ){
                        continue;
                    }
                    const targetPiece =
                        board[toRow][toCol];
                    // Can't capture own piece
                    if(
                        targetPiece !== "" &&
                        targetPiece[0] === color
                    ){
                        continue;
                    }
                    const validMove =
                        isValidMove(
                            piece,
                            fromRow,
                            fromCol,
                            toRow,
                            toCol
                        );
                    if(!validMove){
                        continue;
                    }
                    const pathClear =
                        isPathClear(
                            piece,
                            fromRow,
                            fromCol,
                            toRow,
                            toCol
                        );
                    if(!pathClear){
                        continue;
                    }
                    const kingStillInCheck =
                        wouldLeaveKingInCheck(
                            fromRow,
                            fromCol,
                            toRow,
                            toCol,
                            color
                        );
                    if(!kingStillInCheck){
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

