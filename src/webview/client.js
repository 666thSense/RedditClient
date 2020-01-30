console.log("Hi there, Im the awesome Client script!");
const { ipcRenderer } = require('electron')

window.addEventListener("load", function (event) {
    ipcRenderer.send('DocumentFinishedLoading');
});

document.addEventListener("DOMContentLoaded", function (event) {
    console.log("DOM fully loaded and parsed");
    //ipcRenderer.sendSync('DocumentFinishedLoading');

    /* Add Back Button for fullsized images */
    if (document.body.childElementCount <= 1) {
        var closeButton = document.createElement('button');
        closeButton.setAttribute("onclick", "goClose()");
        closeButton.setAttribute("id", "navigateCloseButton");
        closeButton.innerHTML = '<i class="fas fa-times"></i>';

        if (document.querySelector('body'))
            document.querySelector('body').prepend(closeButton);
    }

    /* add the redditClientButtons */
    var redditClientButtons = document.createElement('div');
    redditClientButtons.setAttribute("id", "redditClientButtons");

    /* add the home button */
    var homeButton = document.createElement('button');
    homeButton.setAttribute("onclick", "goHome()");
    homeButton.setAttribute("id", "navigateHomeButton");
    homeButton.innerHTML = '<i class="fas fa-home"></i>';

    redditClientButtons.append(homeButton);

    /* add the back button */
    var backButton = document.createElement('button');
    backButton.setAttribute("onclick", "goBack()");
    backButton.setAttribute("id", "navigateBackButton");
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i>';

    redditClientButtons.append(backButton);

    if (document.querySelector('header > div:first-child > div:first-child > a'))
        document.querySelector('header > div:first-child > div:first-child > a').prepend(redditClientButtons);

    /* Remove all target blank links */
    // Start observing the target node for configured mutations
    observer.observe(document.body, config);

});

function goClose() {
    ipcRenderer.send('ExternalResourceClosed');
    window.history.back();
}

function goBack() {
    window.history.back();
}

function goHome() {
    window.location = '/';
}


// Options for the observer
const config = {
    attributes: true,
    childList: true,
    subtree: true
};

// Callback function to remove all target _blank 
const callback = function (mutationsList, observer) {
    Array.from(document.querySelectorAll('a[target="_blank"]'))
        .forEach(link => {
            link.setAttribute('target', ''); 
            // DONT USE
            // link.removeAttribute('target');
            // open random Ad-Links because somehow target is necessary
        });
};

// Create observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Later, to stop observing
// observer.disconnect();