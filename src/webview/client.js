console.log("Hi there, Im the awesome Client script!");

document.addEventListener("DOMContentLoaded", function (event) {
    console.log("DOM fully loaded and parsed");

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

    document.querySelector('header > div:first-child').prepend(redditClientButtons);

});

function goBack() {
    window.history.back();
}

function goHome() {
    window.location = '/';
}