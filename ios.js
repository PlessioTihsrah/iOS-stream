const { exec } = require("child_process");
const fs = require("fs");


class IOSStuff {
  deviceId;
  running;
  client;
  driver;

  constructor(deviceId, socket) {
    this.deviceId = deviceId;
    this.running = false;
    this.client = socket;
  }

  click (x, y) {
    
    return new Promise((resolve, reject) => {
      exec(
        // change this for ios
        `adb -s ${this.deviceId} shell input tap ${x} ${y}`,
        (error, stdout, stderr) => {
          if (error) {
            reject(error.message);
            return;
          }
          if (stderr) {
            reject(stderr);
            return;
          }
          resolve();
        }
      );
    })
  }

  async start() {
    this.running = true;
    while(this.running) {
      const time = new Date().getTime();
      const screenshot = await this.takeScreenshot();
      const timeTaken = new Date().getTime() - time;
      console.log("Sending screenshot, took " + timeTaken + " ms")
      this.client.emit('screenshot', screenshot);
    }
    console.log("Stopping screenshotter done");
  }

  stop() {
    console.log("Stopping screenshotter");
    this.running = false;
  }

  takeScreenshot() {
    return new Promise((resolve, reject) => {
        const output = `/tmp/screen-${this.deviceId}.png`
      exec(
        // "idevicescreenshot -u " + this.deviceId + " " + output,
        `adb -s ${this.deviceId} shell screencap -p > ${output}`,
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
    var bitmap = fs.readFileSync(file, 'base64');
    return bitmap;
  }
}

module.exports = IOSStuff;
