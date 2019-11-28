const {
  app,
  BrowserWindow,
  shell
} = require('electron');
const contextMenu = require('electron-context-menu');

// add context menu
contextMenu({
  prepend: (defaultActions, params, browserWindow) => [{
    label: 'Search Google for “{selection}”',
    // Only show it when right-clicking text
    visible: params.selectionText.trim().length > 0,
    click: () => {
      shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`);
    }
  }]
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    //show: false,
    width: 1280,
    height: 800,
    webPreferences: {
      preload: `${__dirname}/webview/preloadClient.js`
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`https://www.reddit.com`);

  /* mainWindow.once('ready-to-show', () => {
    win.show()
  }); */

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // open external in default browser
  mainWindow.webContents.on('new-window', (event, urlToGo, frameName, disposition, options, additionalFeatures, referrer) => {
    /* if (mainWindow.useDefaultWindowBehaviour) {
        mainWindow.useDefaultWindowBehaviour = false;
        return;
    } */
    console.log(frameName);
    console.log(disposition);
    console.log(options);
    console.log(additionalFeatures);
    console.log(referrer);

    event.preventDefault();
    shell.openExternal(urlToGo);
  });

  mainWindow.webContents.on('will-redirect', (event, urlToGo, isInPlace, isMainFrame) => {
    console.log(urlToGo);
    console.log(isInPlace);
    console.log(isMainFrame);
    if (!isInPlace) { 
        event.preventDefault();
        shell.openExternal(urlToGo);
    }
  }); 

  /* mainWindow.webContents.on('will-navigate', (event, url) => {
  
    console.log(url);

    event.preventDefault();
    shell.openExternal(url);
  }); */


  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.