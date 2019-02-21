import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { MessageMain } from './message-main';
var messageMain = new MessageMain();
// =============================
var mainWindow;
function createWindow() {
    Menu.setApplicationMenu(null);
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        autoHideMenuBar: true,
        webPreferences: {
            zoomFactor: 0.8,
        },
        backgroundColor: '#2e2c29',
        show: false,
    });
    mainWindow.webContents.openDevTools();
    // and load the index.html of the app.
    mainWindow.loadFile('./conch/index.html');
    mainWindow.once('ready-to-show', function () {
        mainWindow.show();
        mainWindow.maximize();
    });
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}
app.on('ready', function () {
    createWindow();
    // runExec();
});
// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
app.on('browser-window-created', function (event, win) {
    messageMain.init();
    // ---------------------------------
    // 窗口最小化
    ipcMain.on('window-min', function () {
        mainWindow.minimize();
    });
    // 窗口最大化
    ipcMain.on('window-max', function () {
        if (mainWindow.isMaximized()) {
            mainWindow.restore();
        }
        else {
            mainWindow.maximize();
        }
    });
    // 窗口关闭
    ipcMain.on('window-close', function () {
        mainWindow.close();
    });
});
//# sourceMappingURL=electron-main-build.js.map