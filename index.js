const { Server } = require("socket.io");
const express = require("express");
const path = require("path");
const MobileDevice = require("./MobileDevice");

const app = express();
const port = 8079;
const server = app.listen(port, () => console.log(`Running on port ${port}`));
const io = new Server(server);
app.use(express.static("public"));

io.on("connection", (client) => {
  let mobileDevice = new MobileDevice(client);

  client.on("start", ({ deviceId, os }) => {
    mobileDevice.start(deviceId, os);
  });
  client.on("click", async (data) => {
    const { x, y } = data;
    await mobileDevice.click(x, y);
  });
  client.on("disconnect", () => {
    mobileDevice.stop();
    mobileDevice = null;
  });

  client.on("stop", () => {
    mobileDevice.stop();
  });

  client.on("getDevices", async () => {
    const devices = await mobileDevice.getAvailableDevices();
    client.emit("devices", devices);
  });
});
