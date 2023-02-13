const socket = io();
let lastScreenshotTime = new Date();

socket.on("connect", () => {
  console.log(socket.id);
  socket.emit("getDevices");
});

socket.on("devices", (devices) => {
  console.log(devices);
  changeDeviceSelector(devices);
});

socket.on("screenshot", (screenshot) => {
  if (!window.runningState) {
    return;
  }
  drawOnCanvas(screenshot);
  socket.emit("requestScreenshot", window.deviceId);
  timeTaken = new Date() - lastScreenshotTime;
  lastScreenshotTime = new Date();
  setFps((1000 / timeTaken).toFixed(2));
});

socket.on("disconnect", () => {
  console.log(socket.id); // undefined
});
