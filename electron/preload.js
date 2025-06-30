const { contextBridge } = require('electron');
const os = require('os');

contextBridge.exposeInMainWorld('factory', {
  systemInfo: () => `${os.platform()} • ${os.arch()}`
});
