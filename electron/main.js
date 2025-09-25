const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

// 禁用安全警告
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

// 处理GPU问题
app.disableHardwareAcceleration()

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  })

  // 开发环境加载Vite开发服务器，生产环境加载打包后的文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 处理文件系统访问的IPC通道
ipcMain.handle('select-folder', async () => {
  const { dialog } = require('electron')
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  return result
})

ipcMain.handle('select-files', async () => {
  const { dialog } = require('electron')
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] }
    ]
  })
  return result
})

ipcMain.handle('save-dialog', async () => {
  const { dialog } = require('electron')
  const result = await dialog.showSaveDialog({
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }
    ]
  })
  return result
})