const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("farhanAI", Object.freeze({
  getStatus: () => ipcRenderer.invoke("farhan:status"),\n  getProviderSettings: () => ipcRenderer.invoke("farhan:provider-settings"),\n  saveProviderSettings: (settings) => ipcRenderer.invoke("farhan:save-provider-settings", settings),
  openSite: (url) => ipcRenderer.invoke("farhan:open-site", url),
  openKnown: (target) => ipcRenderer.invoke("farhan:open-known", target),
  chooseFolder: () => ipcRenderer.invoke("farhan:choose-folder"),
  createFolder: (name) => ipcRenderer.invoke("farhan:create-folder", name),
  searchFiles: (query) => ipcRenderer.invoke("farhan:search-files", query),
  openWorkspaceFile: (path) => ipcRenderer.invoke("farhan:open-workspace-file", path),
  chat: (messages) => ipcRenderer.invoke("farhan:chat", messages)
}));
