const deviceSelector = document.getElementById("selector");
const fpsEl = document.getElementById("fps");
window.runningState = false;
function changeDeviceSelector(devices) {
  deviceSelector.innerHTML = "";
  const osSelector = document.createElement("select");

  osSelector.addEventListener("change", (e) => {
    populateDevices(devices[e.target.value]);
  });

  for (const os in devices) {
    const select = document.createElement("option");
    select.innerText = os;
    select.value = os;
    osSelector.appendChild(select);
  }

  deviceSelector.appendChild(osSelector);
  osSelector.value = "android";
  const deviceIdSelector = document.createElement("select");
  deviceIdSelector.id = "device-id";
  deviceSelector.appendChild(deviceIdSelector);
  populateDevices(devices["android"]);

  const startStopButton = document.createElement("button");
  startStopButton.innerText = window.runningState ? "Stop" : "Start";

  startStopButton.addEventListener("click", () => {
    console.log(window.runningState);
    if (runningState) {
      clearCanvas();
      socket.emit("stop");
      fps.innerText = "";
      startStopButton.innerText = "Start";
    } else {
      const deviceId = deviceIdSelector.value;
      const os = osSelector.value;
      socket.emit("start", { deviceId, os });
      startStopButton.innerText = "Stop";
    }
    window.runningState = !window.runningState;
  });

  const refreshButton = document.createElement("button");
  refreshButton.innerText = "Refresh";
  refreshButton.addEventListener("click", () => socket.emit("getDevices"));

  deviceSelector.appendChild(startStopButton);
  deviceSelector.appendChild(refreshButton);
}

function populateDevices(deviceList) {
  const selectElement = document.getElementById("device-id");
  selectElement.innerHTML = "";
  deviceList.forEach((deviceId) => {
    const optionEl = document.createElement("option");
    optionEl.innerText = deviceId;
    optionEl.value = deviceId;
    selectElement.appendChild(optionEl);
  });
}

function setFps(fps) {
  fpsEl.innerText = `${fps} fps`;
}
