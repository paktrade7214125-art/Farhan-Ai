const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("farhanAI", Object.freeze({
  getStatus: () => ipcRenderer.invoke("farhan:status"),
  openSite: (url) => ipcRenderer.invoke("farhan:open-site", url),
  openKnown: (target) => ipcRenderer.invoke("farhan:open-known", target),
  chooseFolder: () => ipcRenderer.invoke("farhan:choose-folder"),
  createFolder: (name) => ipcRenderer.invoke("farhan:create-folder", name),
  searchFiles: (query) => ipcRenderer.invoke("farhan:search-files", query),
  openWorkspaceFile: (path) => ipcRenderer.invoke("farhan:open-workspace-file", path),
  chat: (messages) => ipcRenderer.invoke("farhan:chat", messages)
}));
