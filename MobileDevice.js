const { exec } = require("child_process");
const fs = require("fs");

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

  clickCommand(x, y) {
    if (this.deviceType === "android") {
      return `adb -s ${this.deviceId} shell input tap ${x} ${y}`;
    } else {
      // to be implemented using wda
      console.log({ x, y });
    }
  }
  click(x, y) {
    const command = this.clickCommand(x, y);
    if (!command) {
      return;
    }
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

  screenshotCommand (outputFile) {
    if (this.deviceType === "android") {
      return `adb -s ${this.deviceId} shell screencap -p > ${outputFile}`
    } else {
      return `idevicescreenshot -u ${this.deviceId} ${outputFile}`
    }
  }
  takeScreenshot() {
    
    return new Promise((resolve, reject) => {
      const output = `/tmp/screen-${this.deviceId}.png`;
      const command  = this.screenshotCommand(output);
      exec(
        command,
        (error, stdout, stderr) => {
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
        }
      );
    });
  }

  base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file, "base64");
    return bitmap;
  }
}

module.exports = MobileDevice;
