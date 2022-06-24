const { Server } = require("socket.io");
const express = require("express");
const path = require("path");
const MobileDevice = require("./MobileDevice");



const app = express();
const port = 8079;
const server = app.listen(port, () => console.log(`Running on port ${port}`));
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

let clientObj = null;

io.on("connection", (client) => {
  clientObj = client;
  console.log("Client is here");
  // change device id later using frontend
  const iosStuff = new MobileDevice('00008110-001115920129801E', client);
  iosStuff.start();

  client.on("click", async (data) => {
    const {x, y} = data;
    await iosStuff.click(x,y);
    
  });
  client.on("disconnect", () => {
    console.log("Disconnect");
    iosStuff.stop();
  });
});
