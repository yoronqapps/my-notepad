const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 600,
    minHeight: 500,
    title: 'Notepad',
    icon: path.join(__dirname, 'icon.png'), // optional, see Step 6
    webPreferences: {
      nodeIntegration: false,
    }
  })

  win.loadFile('notepad.html')
  win.setMenuBarVisibility(false) // hides the default Electron menu bar
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})