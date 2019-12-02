console.log("Hi there, Im the awesome Client script!");

document.addEventListener("DOMContentLoaded", function (event) {
    console.log("DOM fully loaded and parsed");

    /* Add Remove Button for fullsized images */
    if (document.body.childElementCount <= 1) {
        var closeButton = document.createElement('button');
        closeButton.setAttribute("onclick", "goBack()");
        closeButton.setAttribute("id", "navigateCloseButton");
        closeButton.innerHTML = '<i class="fas fa-times"></i>';

        if (document.querySelector('body'))
            document.querySelector('body').prepend(closeButton);
    }

    /* Add loader overlay */
    var loaderOverlay = document.createElement('div');
    loaderOverlay.setAttribute('id', 'ClientLoaderOverlay');
    var loaderShow = document.createElement('div');
    loaderShow.setAttribute('id', 'ClientLoaderAnimator');
    loaderOverlay.appendChild(loaderShow);
    document.body.appendChild(loaderOverlay);

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

    if (document.querySelector('header > div:first-child'))
        document.querySelector('header > div:first-child').prepend(redditClientButtons);

    /* Remove all target blank links */
    // Start observing the target node for configured mutations
    observer.observe(document.body, config);

    console.log("peng");

});

window.addEventListener('load', (event) => {
    console.log("loool");
    document.querySelector('#ClientLoaderOverlay').setAttribute('style', 'display: none;');
});

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