var params = {}
var divUrl = null;
var divForwarder = null;
var imgForwarder = null;
var cmdContinue = null;
var cmdCancel = null;
function load() {
	params = getQueryParams(document.location.search);
	divUrl = document.getElementById('url');
    divForwarder = document.getElementById('forwarder');
    imgForwarder = document.getElementById('forwarderIcon');
    divContinue = document.getElementById('cmdContinue');
    divCancel = document.getElementById('cmdCancel');

    divContinue.addEventListener('click', proceedToWebsite);
    divCancel.addEventListener('click', bringMeSomewhereSafe);

    populate();
}

function populate() {
    divUrl.textContent = params.url;
    
    var forwarderUrl = document.createElement('a');
    forwarderUrl.href = params.forwarder;
    divForwarder.textContent = forwarderUrl.hostname;

    imgForwarder.src = forwarderUrl.protocol + "//" + forwarderUrl.host + "/favicon.ico";
    imgForwarder.onerror = function () { 
        this.style.display = "none";
    }
}

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

function proceedToWebsite() {
    var cmd = {
        command: "authorize", 
        arguments: {
            forwarder: params.forwarder,
            url: params.url
        }
    };
    chrome.runtime.sendMessage(cmd, function(res) {
        window.location = params.url;
    });
}

function bringMeSomewhereSafe() {
    window.history.back(2);
}

document.addEventListener('DOMContentLoaded', load);