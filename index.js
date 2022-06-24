const { Server } = require("socket.io");
const express = require("express");
const path = require("path");
const IOSStuff = require("./ios");



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
  // change device id
  const iosStuff = new IOSStuff('17211JEC202889', client);
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
