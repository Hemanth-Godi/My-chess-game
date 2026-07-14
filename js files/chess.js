import {piecesMap} from "./pieces-map.js";
const play = document.querySelector(".play-area");

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
const squares = document.querySelectorAll(".square");
squares.forEach(square=>{
  square.addEventListener("click",()=>{
    const row = Number(square.dataset.row);
    const col = Number(square.dataset.col);
    const piece = board[row][col];
    if(selected===null){
      if(piece!="" && piece[0]===currentPlayer){
        selected = {
          row,
          col
        };
        console.log("Selected");
      }
    }
    else{
      if(selected.row===row && selected.col===col){
        selected = null;
        return;
      }
      const piece = board[selected.row][selected.col];
      const targetPiece = board[row][col];
      if(targetPiece!="" && targetPiece[0]===piece[0]){
        selected = null;
        return;
      }
      let validMove = isValidMove(
        piece,
        selected.row,
        selected.col,
        row,
        col);
      let pathClear = true;
      if(validMove){
        if(piece==="wr"||piece==="br"){
          pathClear = isPathClearRook(
            selected.row,
            selected.col,
            row,
            col
          );
        }
        else if(piece==="wb"||piece==="bb"){
          pathClear = isPathClearBishop(
            selected.row,
            selected.col,
            row,
            col
          );
        }
        else if(piece==="wq"||piece==="bq"){
          pathClear = isPathClearQueen(
            selected.row,
            selected.col,
            row,
            col
          );
        }
     }
     const color = piece[0];
     if(validMove && pathClear 
      && !wouldLeaveKingInCheck(
        selected.row,
        selected.col,
        row,
        col,
        color
      )
     ){
      board[row][col] = board[selected.row][selected.col];
      board[selected.row][selected.col] = "";
      if(isKingInCheck("w")){
        console.log("White in check");
      }
      if(isKingInCheck("b")){
        console.log("Black in check");
      }
      currentPlayer = currentPlayer==="w"?"b":"w";
      console.log("Turn",currentPlayer);
      renderBoard();
     }
     selected = null;
   }
  });
});

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
    if(toRow===fromRow-1){
      return true;
    }
    if(fromRow===6 && toRow===4){
      return true;
    }
  }
  if(piece==="bp"){
    if(toRow===fromRow+1){
      return true;
    } 
    if(fromRow===1 && toRow===3){
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

