const {
  app,
  BrowserWindow,
  BrowserView,
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

const createMainWindow = () => {
  // Create the main browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    
  });

  mainView = new BrowserView({
    webPreferences: {
      preload: `${__dirname}/webview/preloadClient.js`
    }
  });

  mainWindow.setBrowserView(mainView);

  // and load the index.html of the app.
  mainView.setAutoResize({});
  mainView.webContents.loadURL(`https://www.reddit.com`);

  loadWindow = new BrowserView({

  });
  loadWindow.webContents.loadURL(`file://${__dirname}/loadingScreen/loadingScreen.html`);

  /* // Create loading window
  loadWindow = new BrowserWindow({
    parent: mainWindow,
    //show: false,
  });
  loadWindow.loadURL(`file://${__dirname}/loadingScreen/loadingScreen.html`); */

  /* mainWindow.once('ready-to-show', () => {
    win.show()
  }); */

  // Open the DevTools.
  mainView.webContents.openDevTools();

  // open external in default browser
  mainView.webContents.on('new-window', (event, urlToGo, frameName, disposition, options, additionalFeatures, referrer) => {
    /* if (mainWindow.useDefaultWindowBehaviour) {
        mainWindow.useDefaultWindowBehaviour = false;
        return;
    } */
    console.log('new-window ' + frameName);
    console.log('new-window ' + disposition);
    console.log('new-window ' + options);
    console.log('new-window ' + additionalFeatures);
    console.log('new-window ' + referrer);

    event.preventDefault();
    shell.openExternal(urlToGo);
  });

  mainView.webContents.on('will-redirect', (event, urlToGo, isInPlace, isMainFrame, frameProcessId, frameRoutingId) => {
    console.log('will-redirect ' + urlToGo);
    console.log('will-redirect ' + isInPlace);
    console.log('will-redirect ' + isMainFrame);
    console.log('will-redirect ' + frameProcessId);
    console.log('will-redirect ' + frameRoutingId);
    if (!isInPlace) {
      //mainFrame added for stop opening random tabs for ad queries
      if (isMainFrame) {
        event.preventDefault();
        shell.openExternal(urlToGo);
      }
    }
  });

  /* mainWindow.webContents.on('will-navigate', (event, url) => {
  
    console.log(url);

    event.preventDefault();
    shell.openExternal(url);
  }); */

  /* mainWindow.webContents.on('did-finish-load', () => {
    loadWindow.hide();
    mainWindow.show();
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
app.on('ready', createMainWindow);

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
    createMainWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.