var extension_id = chrome.runtime.id;
var authorized_urls = [];
var tracked_domains = [];

chrome.webRequest.onHeadersReceived.addListener(function(details){
  var blockingResponse = {};

  if (details.statusCode < 300 || details.statusCode > 399 || details.statusCode == 304 || details.statusCode == 305) {
    return blockingResponse;
  }
  if (!details.responseHeaders) {
    console.debug('No responseHeaders');
    return blockingResponse;
  }
  var locationObj = details.responseHeaders.find(function(i) { return i.name == "Location"; });
  if (!locationObj) { console.debug('No location'); return blockingResponse; }
  
  if (authorized_urls.indexOf(details.url) != -1) {
    return blockingResponse;
  }
  var forwarderUrl = document.createElement('a');
  forwarderUrl.href = details.url;

  if (!tracked_domains.find(function (i) { return i.toLowerCase() == forwarderUrl.hostname.toLowerCase() })) {
    console.debug('Domain not tracked');
    return blockingResponse;
  }

  var redirectUrl = [
    'chrome-extension://',
    extension_id,
    '/redirectConfirmation.html?url=',
    encodeURIComponent(locationObj.value),
    '&forwarder=',
    encodeURIComponent(details.url)
  ].join('');
  blockingResponse.redirectUrl = redirectUrl;
  return blockingResponse;
},
{urls: [ "<all_urls>" ], types: ["main_frame"]},['responseHeaders','blocking']);

loadConfig();
function loadConfig() {
  chrome.storage.sync.get({ trackedDomains: null}, function (items) {
    if (items.trackedDomains == null) {
      tracked_domains = defaultTrackedDomains;
    } else {
      tracked_domains = items.trackedDomains;
    }
  })
}
chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.create({url: "options.html"});
});
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (sender.id != extension_id) {
      return sendResponse({result:'err', message: sender.id + ' != ' + extension_id});
    }
    if (request.command == 'authorize') {
      if (authorized_urls.indexOf(request.arguments.forwarder) == -1) {
        authorized_urls.push(request.arguments.forwarder);
      }
      return sendResponse({result: 'ok'});
    } else if (request.command == 'reloadConfig') {
      loadConfig();
    } else if (request.command == 'addShortener') {
      if (!request.arguments.url) {
        return sendResponse({result: 'argumentMissing', args: {params: [ 'url' ]}});
      }
    
      // Retrieve Domain Name
      var url = document.createElement('a');
      url.href = request.arguments.url;
      var domain = url.hostname.toLowerCase();

      // Checks if we already track this domain
      if (!tracked_domains.find(function (i) { return i.toLowerCase() == domain; })) {
        tracked_domains.push(domain);

        chrome.storage.sync.set({'trackedDomains': tracked_domains}, function() {
          var cmd = {
            command: "reloadConfig", 
          };
          chrome.runtime.sendMessage(cmd);
          return sendResponse({result: 'added', args: {domain: domain}});
        });
        return true; // Tells that the response will be async
      } else {
        return sendResponse({result: 'alreadyTracked', args: {domain: domain}});  
      }
    } else {
      return sendResponse({result: 'invalidCommand', args: {command: request.command}});
    }
  }
);