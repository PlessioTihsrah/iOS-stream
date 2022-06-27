const { exec } = require("child_process");
const fs = require("fs");
const axios = require("axios").default;

class MobileDevice {
  deviceId;
  running;
  client;
  driver;
  deviceType;

  constructor(deviceId, socket, deviceType) {
    this.deviceId = deviceId;
    this.running = false;
    this.client = socket;
    this.deviceType = deviceType;
  }

  click(x, y) {
    console.log("Clicking at ", { x, y });
    if (this.deviceType === "ios") {
      const wdaPort = 8401;
      return axios.post(`http://localhost:${wdaPort}/bs/tap`, { x, y });
    }

    const command = `adb -s ${this.deviceId} shell input tap ${x} ${y}`;
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error.message);
          return;
        }
        if (stderr) {
          reject(stderr);
          return;
        }
        resolve();
      });
    });
  }

  async start() {
    this.running = true;
    while (this.running) {
      const time = new Date().getTime();
      const screenshot = await this.takeScreenshot();
      const timeTaken = new Date().getTime() - time;
      console.log("Sending screenshot, took " + timeTaken + " ms");
      this.client.emit("screenshot", screenshot);
    }
    console.log("Stopping screenshotter done");
  }

  stop() {
    console.log("Stopping screenshotter");
    this.running = false;
  }

  screenshotCommand(outputFile) {
    if (this.deviceType === "android") {
      return `adb -s ${this.deviceId} shell screencap -p > ${outputFile}`;
    } else {
      return `idevicescreenshot -u ${this.deviceId} ${outputFile}`;
    }
  }
  takeScreenshot() {
    return new Promise((resolve, reject) => {
      const output = `/tmp/screen-${this.deviceId}.png`;
      const command = this.screenshotCommand(output);
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error.message);
          return;
        }
        if (stderr) {
          reject(stderr);
          return;
        }
        const base64 = this.base64_encode(output);
        resolve(base64);
      });
    });
  }

  base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file, "base64");
    return bitmap;
  }
}

module.exports = MobileDevice;
