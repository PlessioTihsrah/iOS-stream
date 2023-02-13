const fs = require("fs");
const axios = require("axios").default;
const util = require("util");
const exec = util.promisify(require("child_process").exec);

class MobileDevice {
  deviceId;
  client;
  driver;
  constructor(socket) {
    this.client = socket;
  }

  getAvailableDevices() {
    return new Promise((resolve) => {
      exec("idevice_id")
        .then(({ stdout, stderr }) => {
          if (stderr || !stdout.trim()) {
            resolve([]);
          }
          resolve(
            stdout
              .trim()
              .split("\n")
              .map((device) => device.split(" ")[0])
          );
        })
        .catch(() => resolve([]));
    });
  }

  click(x, y) {
    console.log("Clicking at ", { x, y });
    const wdaPort = 8401;
    return axios.post(`http://localhost:${wdaPort}/bs/tap`, { x, y });
  }

  async requestScreenshot(deviceId) {
    const time = new Date().getTime();
    const screenshot = await this.takeScreenshot(deviceId);
    const timeTaken = new Date().getTime() - time;
    console.log("Time taken for screenshot", timeTaken)
    this.client.emit("screenshot", screenshot);
  }

  screenshotCommand(outputFile, deviceId) {
    return `idevicescreenshot -u ${deviceId} ${outputFile}`;
  }
  takeScreenshot(deviceId) {
    return new Promise((resolve, reject) => {
      const output = `/tmp/screen-${deviceId}.png`;
      const command = this.screenshotCommand(output, deviceId);
      exec(command).then(({ stderr, stdout }) => {
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
