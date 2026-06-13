const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs   = require('fs')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 600,
    minHeight: 500,
    title: 'Notepad',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  mainWindow.loadFile('notepad.html')
  mainWindow.setMenuBarVisibility(false)
}

// ── PDF export ────────────────────────────────────────────────────────────────
ipcMain.handle('save-pdf', async (event, suggestedName) => {
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title: 'Save as PDF',
    defaultPath: suggestedName || 'note.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })
  if (canceled || !filePath) return { ok: false }

  try {
    const data = await mainWindow.webContents.printToPDF({
      marginsType: 1,           // default margins
      pageSize: 'A4',
      printBackground: true,    // keeps background colours
      landscape: false,
    })
    fs.writeFileSync(filePath, data)
    return { ok: true, filePath }
  } catch (err) {
    return { ok: false, error: err.message }
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})