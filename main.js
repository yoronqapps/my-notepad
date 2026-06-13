const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
const path = require('path')
const fs   = require('fs')

let mainWindow

// ── Speed: parse args early ───────────────────────────────────────────────────
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=128')

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 700,
    minHeight: 500,
    title: 'Notepad',
    icon: path.join(__dirname, 'icon.png'),
    show: false,   // prevent white flash
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  mainWindow.loadFile('notepad.html')
  mainWindow.setMenuBarVisibility(false)

  // Show only when fully ready — faster perceived load
  mainWindow.once('ready-to-show', () => mainWindow.show())

  // ── Right-click context menu (paste, copy, cut, etc.) ──────────────────────
  mainWindow.webContents.on('context-menu', (event, params) => {
    const menu = Menu.buildFromTemplate([
      { label: 'Cut',        role: 'cut',            enabled: params.editFlags.canCut },
      { label: 'Copy',       role: 'copy',           enabled: params.editFlags.canCopy },
      { label: 'Paste',      role: 'paste',          enabled: params.editFlags.canPaste },
      { label: 'Select All', role: 'selectAll' },
      { type: 'separator' },
      { label: 'Undo',       role: 'undo' },
      { label: 'Redo',       role: 'redo' },
    ])
    menu.popup({ window: mainWindow })
  })
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
      marginsType: 1,
      pageSize: 'A4',
      printBackground: true,
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