const socket = io();

socket.on("connect", () => {
  console.log(socket.id);
  socket.emit("getDevices");
});

socket.on("devices", (devices) => {
  changeDeviceSelector(devices);
});

socket.on("screenshot", ({ screenshot, timeTaken }) => {
  if (!window.runningState) {
    return;
  }
  drawOnCanvas(screenshot);
  setFps((1000 / timeTaken).toFixed(2));
});

socket.on("disconnect", () => {
  console.log(socket.id); // undefined
});
