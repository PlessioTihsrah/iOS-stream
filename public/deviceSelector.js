const deviceSelector = document.getElementById("selector");
const fpsEl = document.getElementById("fps");
window.runningState = false;
function changeDeviceSelector(devices) {
  deviceSelector.innerHTML = "";
  const deviceIdSelector = document.createElement("select");
  deviceIdSelector.id = "device-id";
  deviceSelector.appendChild(deviceIdSelector);
  populateDevices(devices);

  const startStopButton = document.createElement("button");
  startStopButton.innerText = window.runningState ? "Stop" : "Start";

  startStopButton.addEventListener("click", () => {
    console.log(window.runningState);
    if (runningState) {
      clearCanvas();
      fps.innerText = "";
      startStopButton.innerText = "Start";
    } else {
      const deviceId = deviceIdSelector.value;
      window.deviceId = deviceId;
      socket.emit("requestScreenshot", deviceId);
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
