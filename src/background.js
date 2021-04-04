'use strict'

import { app, protocol, BrowserWindow, globalShortcut, ipcMain, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { join } from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 600,
    minWidth: 300,
    minHeight: 300,
    center: true,
    titleBarStyle: 'hidden',
    frame: false,
    icon: join(__dirname, 'lysosome-icon.png'),
    webPreferences: {
      webSecurity: false,
      images: true,
      enableRemoteModule: true,
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  // globalShortcut.register('MediaStop', () => {
  //   console.log('stop')
  // })
  globalShortcut.register('numadd', () => {
    win.webContents.send('MediaPlayer', { action: 'volume++' })
  })
  globalShortcut.register('numsub', () => {
    win.webContents.send('MediaPlayer', { action: 'volume--' })
  })
  globalShortcut.register('MediaPlayPause', () => {
    win.webContents.send('MediaPlayer', { action: 'play/pause' })
  })
  globalShortcut.register('MediaNextTrack', () => {
    win.webContents.send('MediaPlayer', { action: 'nextTrack' })
  })
  globalShortcut.register('MediaPreviousTrack', () => {
    win.webContents.send('MediaPlayer', { action: 'prevTrack' })
  })

  ipcMain.on('select-directory', (event, arg) => {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }).then(res => {
      win.webContents.send('get-directory', res.filePaths[0])
    })
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')

    // win.webContents.on('dom-ready', () => {

    // })
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  protocol.registerFileProtocol('file', (request, cb) => {
    const url = request.url.replace('file:///', '')
    const decodedUrl = decodeURI(url)
    try {
      return cb(decodedUrl)
    } catch (error) {
      console.error('ERROR: registerLocalResourceProtocol: Could not get file path:', error)
    }
  })
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// function registerLocalResourceProtocol () {
//   protocol.registerFileProtocol('local-resource', (request, callback) => {
//     const url = request.url.replace(/^local-resource:\/\//, '')
//     // Decode URL to prevent errors when loading filenames with UTF-8 chars or chars like "#"
//     const decodedUrl = decodeURI(url) // Needed in case URL contains spaces
//     try {
//       return callback(decodedUrl)
//     } catch (error) {
//       console.error('ERROR: registerLocalResourceProtocol: Could not get file path:', error)
//     }
//   })
// }
