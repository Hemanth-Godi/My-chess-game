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
const squares = document.querySelectorAll(".square");
squares.forEach(square=>{
  square.addEventListener("click",()=>{
    const row = Number(square.dataset.row);
    const col = Number(square.dataset.col);
    const piece = board[row][col];
    if(selected===null){
      if(piece!=""){
        selected = {
          row,
          col
        };
        console.log("Selected");
      }
    }
    else{
      board[row][col] = board[selected.row][selected.col];
      board[selected.row][selected.col] = "";
      selected = null;
      renderBoard();
    }
  });
});

