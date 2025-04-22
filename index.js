// Electron Loader Script
// Code sets up window (and closing)


const { app, BrowserWindow, shell } = require('electron')
const path = require('path')


function createWindow () {
    const win = new BrowserWindow({
        width: 900,
        height: 750, // width of the main control panel appears to be linked to height not width for some reason
        titleBarStyle: 'hidden',
            // expose window controlls in Windows/Linux
        ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
        trafficLightPosition: { x: 12, y: 12}
    })

    win.loadFile('index.html')
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
