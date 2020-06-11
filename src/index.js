const {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  Menu
} = require('electron');
const contextMenu = require('electron-context-menu');

// add context menu
contextMenu({
  prepend: (defaultActions, params, browserWindow) => [{
    label: 'Search Google for “{selection}”',
    // Only show it when right-clicking text
    visible: params.selectionText.trim().length > 0,
    click: () => {
      shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`).catch(err => {
        if (err) console.log(err)
      });
    }
  },
    {
      label: `Search on Reddit`,
      visible: params.selectionText.trim().length > 0,
      click: () =>{
        browserWindow.loadURL(`https://reddit.com/search/?q=${encodeURIComponent(params.selectionText)}`).then(console.log);
        console.log(`https://reddit.com/search/?q=${encodeURIComponent(params.selectionText)}`)
      }
    },
    {
      label: `Search on ${getSubReddit(mainWindow.webContents.getURL())}`,
      visible:
          mainWindow.webContents.getURL().match(/^https:\/\/www.reddit.com\/r\/.*/) &&
              params.selectionText.trim().length > 0
      ? true : false, //I know is redundant, but for some reason fixed the Search on Null problem
      click: () =>{
        let subReddit = getSubReddit(mainWindow.webContents.getURL());
        browserWindow.loadURL(`https://reddit.com/${subReddit[0]}search?q=${encodeURIComponent(params.selectionText)}&restrict_sr=1`).then(console.log);
        console.log(`https://reddit.com/${subReddit[0]}search?q=${encodeURIComponent(params.selectionText)}&restrict_sr=1`)
      }
    }]
});

//Although it's only one line, it may be used frequently, may want to create a utilities package for things like this
const getSubReddit = (url) => url.match(/r\/[^\/]*\//);


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let loadWindow;
//Created a variable to tell if the load page has already been displayed since interfered with the search functions,
let loaded = false;

const createMainWindow = () => {
  // Create the main browser window.
  mainWindow = new BrowserWindow({
    title: 'RedditClient',
    icon: `${__dirname}/assets/icon-512.png`,
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
  mainWindow.setMenu(null);
  mainWindow.removeMenu();
  Menu.setApplicationMenu(null)

  // and load the Reddit Frontpage.
  mainWindow.webContents.loadURL(`https://www.reddit.com`).catch(err => {
    if (err) console.log(err)
  })

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
    // You have to add a catch, can't ignore promises.
    shell.openExternal(urlToGo).catch(err => {
      if (err) console.log(err)
    })
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
        if (loadWindow && !loaded) {
          console.log("THIS IS IT")
          mainWindow.setBounds(loadWindow.getBounds());
          loadWindow.hide();
          mainWindow.show();
        }
        // If the URL is not in the Reddit domain then open in the browser
        if (!urlToGo.match(/^https:\/\/www.reddit.com.*/)){
          console.log(""+ urlToGo.toString())
          event.preventDefault();
          shell.openExternal(urlToGo).catch(err => {
            if (err) console.log(err)
          })
        }
      }
    }
  });

  ipcMain.on('ExternalResourceClosed', (event) => {
    if (loadWindow && !loaded) {
      loadWindow.setBounds(mainWindow.getBounds());
      mainWindow.hide();
      loadWindow.show();
    }
    /* console.log("ExternalResourceClosed"); */
  });

  ipcMain.on('DocumentStartLoading', (event) => {
    if (loadWindow && !loaded) {
      loadWindow.setBounds(mainWindow.getBounds());
      mainWindow.hide();
      loadWindow.show();
    }
     console.log("DocumentStartLoading");
  });

  ipcMain.on('DocumentFinishedLoading', (event) => {
    if (loadWindow && !loaded) {
      mainWindow.setBounds(loadWindow.getBounds());
      loadWindow.hide();
      mainWindow.show();
    }
    /* console.log("DocumentFinishedLoading"); */
  });

  mainWindow.webContents.on('did-finish-load', () => {
    // setting the window title
    mainWindow.setTitle('RedditClient');

    if (loadWindow && !loaded) {
      mainWindow.setBounds(loadWindow.getBounds());
      loadWindow.hide();
      mainWindow.show();
      loaded = true;
    }
    /* console.log("did-finish-load"); */
  });

  mainWindow.webContents.on('will-navigate', (event, urlToGo) => {
    /* console.log('will-navigate ' + urlToGo); */
    if (loadWindow && !loaded) {
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

  loadWindow.loadURL(`file://${__dirname}/loadingScreen/loadingScreen.html`).catch(err =>{
    console.log(err);
  });

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