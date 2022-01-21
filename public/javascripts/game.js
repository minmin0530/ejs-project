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
var firstFlag = true;
var timer = 0;
var areas = [];

var area = {
  id: 0,
  x: 0,
  y: 0,
  r: 0,
  g: 0,
  b: 0,
  time: 0
};

window.onload = function() {
  socket = io();
  const canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.addEventListener('mousedown', (event) => {

    if (x > event.clientX - canvas.offsetLeft - 16 && event.clientX - canvas.offsetLeft + 16 > x &&
        y > event.clientY - canvas.offsetTop  - 16 && event.clientY - canvas.offsetTop  + 16 > y) {

      firstFlag = false;
      dragFlag = true;
      dragStart = {
        x: event.clientX - canvas.offsetLeft,
        y: event.clientY - canvas.offsetTop
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
    }
  }, false);

  canvas.addEventListener('mousemove', (event) => {
    if (dragFlag) {
      x = event.clientX - canvas.offsetLeft;
      y = event.clientY - canvas.offsetTop;
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
    if (mapData != null) {
      for (const data of mapData) {
        if (data.x > event.clientX - canvas.offsetLeft - 16 - 16 && event.clientX - canvas.offsetLeft + 16 - 16 > data.x &&
            data.y > event.clientY - canvas.offsetTop  - 16 - 16 && event.clientY - canvas.offsetTop  + 16 - 16 > data.y) {

              dragMove = null;
              dragFlag = false;
              dragEnd = {
                x: data.x + 16,
                y: data.y + 16
              };
              x = data.x + 16;
              y = data.y + 16;
              socket.emit("dragEnd", {
                id: id,
                x: dragEnd.x,
                y: dragEnd.y,
                r: rColor,
                g: gColor,
                b: bColor
              });
          break;

        }
      }
    }
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
  socket.on("dragEnd", (data) => {
    dragData = data.dragData;
    mapData = data.mapData;
    animation = 0;
  });

  socket.on("update", (data) => {
    mapData = data.mapData;
  });
  loop();
};

var ADJUST = 1.0;

var animation = 0;
function loop() {
  ctx.fillStyle = "green";
  ctx.fillRect(0,0,640,640);

  if (mapData != null) {
    for (const data of mapData) {
      ctx.fillStyle = "rgb("+data.r+","+data.g+","+data.b+")";
      ctx.fillRect(data.x / ADJUST, data.y / ADJUST,32,32);
      if ( !(data.r == 255 && data.g == 255 && data.b == 255) ) {
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.font = "24px serif";
        ctx.fillText("" + data.n, data.x + 2, data.y + 28);

        if (dragStartArray && animation < 50) {
        for (let l = 0; l < dragStartArray.length; ++l) {
          // if (dragStartArray[l].id == data.id) {
  
            ctx.strokeStyle = "rgb("+dragStartArray[l].r+","+dragStartArray[l].g+","+dragStartArray[l].b+")";
            ctx.beginPath();
            const at2 = Math.atan2(dragStartArray[l].y - data.y, dragStartArray[l].x - data.x);
            const rad = 14 * Math.PI / 180;
            const cx1 = 20 * Math.cos(at2 + rad) + dragStartArray[l].x;
            const cy1 = 20 * Math.sin(at2 + rad) + dragStartArray[l].y;
            const cx2 = 20 * Math.cos(at2 - rad) + dragStartArray[l].x;
            const cy2 = 20 * Math.sin(at2 - rad) + dragStartArray[l].y;


            const xx = data.x - dragStartArray[l].x;
            const yy = data.y - dragStartArray[l].y;

            

            ctx.moveTo(xx / 50 * animation + dragStartArray[l].x / ADJUST, yy / 50 * animation + dragStartArray[l].y / ADJUST);
            ctx.lineTo(xx / 50 * animation + cx1, yy / 50 * animation + cy1);
            ctx.moveTo(xx / 50 * animation + dragStartArray[l].x / ADJUST, yy / 50 * animation + dragStartArray[l].y / ADJUST);
            ctx.lineTo(xx / 50 * animation + cx2, yy / 50 * animation + cy2);
            ctx.closePath();
            ctx.stroke();

          // }
        }
        }

      }
      // if (timer != 0) {
      //   ctx.fillStyle = "rgb(0,0,0)";
      //   ctx.font = "24px serif";
      //   ctx.fillText("" + data.n, data.x + 2, data.y + 28);    
      // }
    }
  }
  animation += 1;
  if (dragData != null) {
    for (const data of dragData) {
      for (let l = 0; l < dragStartArray.length; ++l) {
        if (dragStartArray[l].id == data.id) {
          ctx.strokeStyle = "rgb("+data.r+","+data.g+","+data.b+")";
          ctx.beginPath();
          ctx.moveTo(dragStartArray[l].x / ADJUST, dragStartArray[l].y / ADJUST);
          ctx.lineTo(data.x / ADJUST, data.y / ADJUST);
          ctx.closePath();
          ctx.stroke();
          
          
          // ctx.beginPath();

          // const at2 = Math.atan2(dragStartArray[l].y - data.y, dragStartArray[l].x - data.x);
          // const rad = 14 * Math.PI / 180;
          // const cx1 = 50 * Math.cos(at2 + rad) + dragStartArray[l].x;
          // const cy1 = 50 * Math.sin(at2 + rad) + dragStartArray[l].y;
          // const cx2 = 50 * Math.cos(at2 - rad) + dragStartArray[l].x;
          // const cy2 = 50 * Math.sin(at2 - rad) + dragStartArray[l].y;
          // ctx.moveTo(dragStartArray[l].x / ADJUST, dragStartArray[l].y / ADJUST);
          // ctx.lineTo(cx1, cy1);
          // ctx.moveTo(dragStartArray[l].x / ADJUST, dragStartArray[l].y / ADJUST);
          // ctx.lineTo(cx2, cy2);
          // ctx.closePath();
          // ctx.stroke();
      
        }
      }
      // ctx.fillStyle = "rgb("+data.r+","+data.g+","+data.b+")";
      // ctx.fillRect(data.x / ADJUST - 16, data.y / ADJUST - 16, 32, 32);
    }
  }
  if (rColor != null && (firstFlag == true || dragMove != null )) {
    ctx.fillStyle = "rgb("+rColor+","+gColor+","+bColor+")";
    ctx.fillRect(x / ADJUST - 16, y / ADJUST - 16, 32, 32);
  }

  if (dragMove != null) {
    ctx.strokeStyle = "rgb("+rColor+","+gColor+","+bColor+")";
    ctx.beginPath();
    ctx.moveTo(dragStart.x / ADJUST, dragStart.y / ADJUST);
    ctx.lineTo(dragMove.x / ADJUST, dragMove.y / ADJUST);
    ctx.closePath();
    ctx.stroke();
  }


  requestAnimationFrame(loop);
}

