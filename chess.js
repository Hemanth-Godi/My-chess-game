const play = document.querySelector(".play-area");

for(let i=0;i<64;i++){
  const square = document.createElement("div");
  square.classList.add("square");
  play.appendChild(square);
}