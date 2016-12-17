var params = {}
var divUrl = null;
var divForwarder = null;
var imgForwarder = null;
var cmdAddShortener = null;
var cmdContinue = null;
var cmdCancel = null;
function load() {
	params = getQueryParams(document.location.search);
	divUrl = document.getElementById('url');
    divForwarder = document.getElementById('forwarder');
    imgForwarder = document.getElementById('forwarderIcon');
    cmdAddShortener = document.getElementById('cmdAddShortener');
    cmdContinue = document.getElementById('cmdContinue');
    cmdCancel = document.getElementById('cmdCancel');

    cmdAddShortener.addEventListener('click', addToShortener);
    cmdContinue.addEventListener('click', proceedToWebsite);
    cmdCancel.addEventListener('click', bringMeSomewhereSafe);

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

function addToShortener() {
    var cmd = {
        command: "addShortener", 
        arguments: {
            url: params.url
        }
    };
    chrome.runtime.sendMessage(cmd, function(res) {
        if (res.result == 'added') {
            var divResultMessage = document.createElement('div');
            divResultMessage.classList.add('alert');
            divResultMessage.classList.add('alert-success');
            divResultMessage.textContent = "Domain: " + res.args.domain + " added to track list successfuly";
            var messagesArea = document.getElementById('messages');
            messagesArea.append(divResultMessage);
            setTimeout(function() {
                divResultMessage.remove();
            }, 5000)
        } else if (res.result == 'alreadyTracked') {
            var divResultMessage = document.createElement('div');
            divResultMessage.classList.add('alert');
            divResultMessage.classList.add('alert-warning');
            divResultMessage.textContent = "Domain: " + res.args.domain + " tracked already";
            var messagesArea = document.getElementById('messages');
            messagesArea.append(divResultMessage);
            setTimeout(function() {
                divResultMessage.remove();
            }, 5000)
        }
    });
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
        if (res.result == 'ok') {
            window.location = params.url;
        }
    });
}

function bringMeSomewhereSafe() {
    window.history.back(2);
}

document.addEventListener('DOMContentLoaded', load);