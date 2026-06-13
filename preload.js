const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  savePdf: (suggestedName) => ipcRenderer.invoke('save-pdf', suggestedName),
})