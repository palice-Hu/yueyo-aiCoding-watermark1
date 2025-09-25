// 预加载脚本
const { contextBridge, ipcRenderer } = require('electron')

// 暴露API到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectFiles: () => ipcRenderer.invoke('select-files'),
  saveDialog: () => ipcRenderer.invoke('save-dialog')
})