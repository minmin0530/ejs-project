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
var mapData = null;
var dragStart = null;
var dragEnd = null;
var dragMove = null;
var dragStartArray = null;

window.onload = function() {
  socket = io();
  const canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.addEventListener('mousedown', (event) => {
       dragFlag = true;
       dragStart = {
         x: event.offsetX / 2,
         y: event.offsetY / 3
       };
       dragMove = null;

       socket.emit("dragStart", {
        id: id,
        x: dragStart.x,
        y: dragStart.y,
        r: rColor,
        g: gColor,
        b: bColor
      });


  }, false);

  canvas.addEventListener('mousemove', (event) => {
    if (dragFlag) {
      x = event.offsetX / 2;
      y = event.offsetY / 3;
      dragMove = {
        x: x,
        y: y
      };
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
    dragEnd = {
      x: event.offsetX,
      y: event.offsetY
    };
    socket.emit("dragEnd", {
      id: id,
      x: dragEnd.x,
      y: dragEnd.y,
      r: rColor,
      g: gColor,
      b: bColor
    });

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
  socket.on("mapdata", (data) => {
    console.log(data);
    mapData = data;
  });
  
  socket.on("dragStart", (data) => {
    dragStartArray = data;
  });
  socket.on("drag", (data) => {
    dragData = data;
  });

  loop();
};

function loop() {
  ctx.fillStyle = "green";
  ctx.fillRect(0,0,640,480);

  if (mapData != null) {
    for (const data of mapData) {
      ctx.fillStyle = "rgb("+data.r+","+data.g+","+data.b+")";
      ctx.fillRect(data.x, data.y,8,8);
    }
  }
  if (dragData != null) {
    for (const data of dragData) {
      for (let l = 0; l < dragStartArray.length; ++l) {
        if (dragStartArray[l].id == data.id) {
          ctx.strokeStyle = "rgb("+data.r+","+data.g+","+data.b+")";
          ctx.beginPath();
          ctx.moveTo(dragStartArray[l].x, dragStartArray[l].y);
          ctx.lineTo(data.x, data.y);
          ctx.closePath();
          ctx.stroke();    
        }
      }
      ctx.fillStyle = "rgb("+data.r+","+data.g+","+data.b+")";
      ctx.fillRect(data.x, data.y,4,4);
    }
  }
  if (rColor != null) {
    ctx.fillStyle = "rgb("+rColor+","+gColor+","+bColor+")";
    ctx.fillRect(x,y,4,4);
  }

  if (dragMove != null) {
    ctx.strokeStyle = "rgb("+rColor+","+gColor+","+bColor+")";
    ctx.beginPath();
    ctx.moveTo(dragStart.x, dragStart.y);
    ctx.lineTo(dragMove.x, dragMove.y);
    ctx.closePath();
    ctx.stroke();
  }
  requestAnimationFrame(loop);
}

