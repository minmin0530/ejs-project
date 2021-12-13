var ctx;
var x = 100;
var y = 100;
var dragFlag = false;
var socket;
var dragData = null;
var id;
var rColor = null;
var gColor;
var bColor;
window.onload = function() {
  socket = io();
  const canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.addEventListener('mousedown', (event) => {
       dragFlag = true;
  }, false);

  canvas.addEventListener('mousemove', (event) => {
    if (dragFlag) {
      x = event.offsetX / 2;
      y = event.offsetY / 3;
      socket.emit("drag", {
        id: id,
        x: x,
        y: y,
        r: rColor,
        g: gColor,
        b: bColor
      });
    }
  }, false);
  
  canvas.addEventListener('mouseup', (event) => {
    dragFlag = false;
  }, false);

  socket.on("userdata", (data) => {
    console.log(data);
    rColor = data.r;
    gColor = data.g;
    bColor = data.b;
    id = data.id;
    x = data.x;
    y = data.y;
  });
  socket.on("drag", (data) => {
    dragData = data;
  });

  loop();
};

function loop() {
  ctx.fillStyle = "green";
  ctx.fillRect(0,0,640,480);

  if (dragData != null) {
    for (const data of dragData) {
      ctx.fillStyle = "rgb("+data.r+","+data.g+","+data.b+")";
      ctx.fillRect(data.x, data.y,4,4);
    }
  }
  if (rColor != null) {
    ctx.fillStyle = "rgb("+rColor+","+gColor+","+bColor+")";
    ctx.fillRect(x,y,4,4);
  }
  requestAnimationFrame(loop);
}

