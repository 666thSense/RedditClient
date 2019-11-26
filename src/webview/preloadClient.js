const path = require("path");
const fs = require('fs');

var clientCSSPath = path.join(__dirname, 'client.css');
const clientCSS = fs.readFileSync(clientCSSPath);
var clientJSPath = path.join(__dirname, 'client.js');
const clientJS = fs.readFileSync(clientJSPath);

process.once('document-start', () => {
    console.log('This is the awesome document start event!');

    /* inject custom JS */
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.setAttribute('id', 'redditClientJS');
    script.textContent = clientJS;
    document.documentElement.appendChild(script);

    /* inject custom CSS */
    var style = document.createElement('style');
    style.setAttribute('id', 'redditClientCSS');
    style.textContent = clientCSS;
    document.documentElement.appendChild(style);

    /* inject FontAwesome just for the left arrow */
    var fa = document.createElement('link');
    fa.setAttribute('rel', 'stylesheet');
    fa.setAttribute('type', 'text/css');
    fa.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css');
    fa.textContent = clientJS;
    document.documentElement.appendChild(fa);
});