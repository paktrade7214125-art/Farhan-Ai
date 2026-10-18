const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("farhanAI", Object.freeze({
  getStatus: () => ipcRenderer.invoke("farhan:status"),
  openSite: (url) => ipcRenderer.invoke("farhan:open-site", url),
  chooseFolder: () => ipcRenderer.invoke("farhan:choose-folder"),
  chat: (messages) => ipcRenderer.invoke("farhan:chat", messages)
}));
