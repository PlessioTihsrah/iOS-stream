const fs = require("fs");
const axios = require("axios").default;
const util = require("util");
const exec = util.promisify(require("child_process").exec);

class MobileDevice {
  deviceId;
  running;
  client;
  driver;
  deviceType;

  constructor(socket) {
    this.running = false;
    this.client = socket;
  }
  getAvailableDevicesAndroid() {
    return new Promise((resolve) => {
      exec("adb devices")
        .then(({ stdout, stderr }) => {
          if (stderr) {
            throw stderr;
          }
          const devices = stdout
            .trim()
            .split("\n")
            .slice(1)
            .map((device) => device.split("\t")[0]);
          resolve(devices);
        })
        .catch(() => resolve([]));
    });
  }

  getAvailableDevicesIos() {
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
  getAvailableDevices() {
    return new Promise(async (resolve) => {
      const androidDevices = await this.getAvailableDevicesAndroid();
      const iosDevices = await this.getAvailableDevicesIos();
      resolve({
        android: androidDevices,
        ios: iosDevices,
      });
    });
  }

  click(x, y) {
    if (!this.running) {
      return;
    }
    console.log("Clicking at ", { x, y });
    if (this.deviceType === "ios") {
      const wdaPort = 8401;
      return axios.post(`http://localhost:${wdaPort}/bs/tap`, { x, y });
    }

    const command = `adb -s ${this.deviceId} shell input tap ${x} ${y}`;
    return new Promise((resolve, reject) => {
      exec(command)
        .then(({ stdout, stderr }) => {
          if (stderr) {
            throw stderr;
          }

          resolve(stdout);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  async start(deviceId, deviceType) {
    this.deviceId = deviceId;
    this.deviceType = deviceType;
    this.running = true;
    while (this.running) {
      const time = new Date().getTime();
      const screenshot = await this.takeScreenshot();
      const timeTaken = new Date().getTime() - time;
      this.client.emit("screenshot", { screenshot, timeTaken });
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
