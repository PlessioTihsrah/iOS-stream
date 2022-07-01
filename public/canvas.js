// methods for html canvas

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const maxHeight = 700;
canvas.height = maxHeight;
let originalHeight = 0;
let originalWidth = 0;

canvas.addEventListener("click", ({ x, y }) => {
  if (!window.runningState) {
    return;
  }
  const rect = canvas.getBoundingClientRect();
  x -= rect.x;
  y -= rect.y;
  const convertedX = (originalWidth / canvas.width) * x;
  const convertedY = (originalHeight / canvas.height) * y;

  socket.emit("click", { x: convertedX, y: convertedY });
});

function drawOnCanvas(imageData) {
  const image = new Image();

  image.onload = function () {
    const newWidth = Math.floor((maxHeight / image.height) * image.width);
    originalHeight = image.height;
    originalWidth = image.width;
    if (canvas.width !== newWidth) {
      canvas.width = newWidth;
    }
    ctx.drawImage(image, 0, 0, newWidth, maxHeight);
  };
  image.src = "data:image/png;base64," + imageData;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
