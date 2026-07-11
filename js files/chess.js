import {piecesMap} from "./pieces-map.js";
const play = document.querySelector(".play-area");

for(let i=0;i<64;i++){
  const square = document.createElement("div");
  square.classList.add("square");
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

const squares = document.querySelectorAll(".square");
for(let i=0;i<8;i++){
  for(let j=0;j<8;j++){
    const piece = board[i][j];
    if(piece!=""){
      squares[i*8+j].innerHTML=`<img src="${piecesMap[piece]}" alt="${piece}"
      class=piece>`;
    }
  }
}

