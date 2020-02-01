const {
  app,
  BrowserWindow,
  shell,
  ipcMain
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
let loadWindow;

const createMainWindow = () => {
  // Create the main browser window.
  mainWindow = new BrowserWindow({
    title: 'RedditClient',
    // icon: `${__dirname}/assets/icon-512.png`,
    // hide window until fully loaded
    show: false,
    width: 1280,
    height: 800,
    webPreferences: {
      preload: `${__dirname}/webview/preloadClient.js`,
      nodeIntegration: true
    }
  });

  // remove default menu
  mainWindow.removeMenu();

  // and load the Reddit Frontpage.
  mainWindow.webContents.loadURL(`https://www.reddit.com`);

  // Open the DevTools.
  /* mainWindow.webContents.openDevTools(); */

  // prevent changing the title and icon
  mainWindow.webContents.on('page-title-updated', (event) => {
    event.preventDefault();
  });
  mainWindow.webContents.on('page-favicon-updated', (event) => {
    event.preventDefault();
  });
  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });

  // open external in default browser
  mainWindow.webContents.on('new-window', (event, urlToGo, frameName, disposition, options, additionalFeatures, referrer) => {
    /* console.log('new-window ' + frameName);
    console.log('new-window ' + disposition);
    console.log('new-window ' + options);
    console.log('new-window ' + additionalFeatures);
    console.log('new-window ' + referrer); */

    if (loadWindow) {
      mainWindow.setBounds(loadWindow.getBounds());
      loadWindow.hide();
      mainWindow.show();
    }
    event.preventDefault();
    shell.openExternal(urlToGo);
  });

  mainWindow.webContents.on('will-redirect', (event, urlToGo, isInPlace, isMainFrame, frameProcessId, frameRoutingId) => {
    /* console.log('will-redirect ' + urlToGo);
    console.log('will-redirect ' + isInPlace);
    console.log('will-redirect ' + isMainFrame);
    console.log('will-redirect ' + frameProcessId);
    console.log('will-redirect ' + frameRoutingId); */
    if (!isInPlace) {
      //mainFrame added for stop opening random tabs for ad queries
      if (isMainFrame) {
        if (loadWindow) {
          mainWindow.setBounds(loadWindow.getBounds());
          loadWindow.hide();
          mainWindow.show();
        }
        event.preventDefault();
        shell.openExternal(urlToGo);
      }
    }
  });

  ipcMain.on('ExternalResourceClosed', (event) => {
    if (loadWindow) {
      loadWindow.setBounds(mainWindow.getBounds());
      mainWindow.hide();
      loadWindow.show();
    }
    /* console.log("ExternalResourceClosed"); */
  });

  ipcMain.on('DocumentStartLoading', (event) => {
    if (loadWindow) {
      loadWindow.setBounds(mainWindow.getBounds());
      mainWindow.hide();
      loadWindow.show();
    }
    /* console.log("DocumentStartLoading"); */
  });

  ipcMain.on('DocumentFinishedLoading', (event) => {
    if (loadWindow) {
      mainWindow.setBounds(loadWindow.getBounds());
      loadWindow.hide();
      mainWindow.show();
    }
    /* console.log("DocumentFinishedLoading"); */
  });

  mainWindow.webContents.on('did-finish-load', () => {
    // setting the window title
    mainWindow.setTitle('RedditClient');

    if (loadWindow) {
      mainWindow.setBounds(loadWindow.getBounds());
      loadWindow.hide();
      mainWindow.show();
    }
    /* console.log("did-finish-load"); */
  });

  mainWindow.webContents.on('will-navigate', (event, urlToGo) => {
    /* console.log('will-navigate ' + urlToGo); */
    if (loadWindow) {
      loadWindow.setBounds(mainWindow.getBounds());
      mainWindow.hide();
      loadWindow.show();
    }
  });

  /* mainWindow.webContents.on('did-stop-loading', () => {
    if (loadWindow) {
      loadWindow.hide();
    }
    mainWindow.show();
  });

  mainWindow.webContents.on('did-start-loading', () => {
    mainWindow.hide();
    if (loadWindow) {
      loadWindow.show();
    }
  }); */

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

const createLoadWindow = () => {
  // Create the main browser window.
  loadWindow = new BrowserWindow({
    title: 'RedditClient',
    icon: `${__dirname}/assets/reddit.png`,
    // define width and height for the window
    // width: 1280,
    // height: 800,
    // remove the window frame, so it will become a frameless window
    frame: false,
    // and set the transparency, to remove any window background color
    transparent: true
  });

  if (mainWindow) {
    loadWindow.setBounds(mainWindow.getBounds());
  }

  loadWindow.loadURL(`file://${__dirname}/loadingScreen/loadingScreen.html`);

  loadWindow.webContents.on('did-finish-load', () => {
    loadWindow.show();
  });

  loadWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    loadWindow = null;
  });

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createMainWindow();
  createLoadWindow();
});

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
  if (mainWindow === null || loadWindow === null) {
    mainWindow = null;
    loadWindow = null
    createMainWindow();
    createLoadWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.