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
    var senderUrl = document.createElement('a');
    senderUrl.href = sender.tab.url;

    if (!sender.hostname == extension_id) {
      return sendResponse('err');
    }
    if (request.command == 'authorize') {
      if (authorized_urls.indexOf(request.arguments.forwarder) == -1) {
        authorized_urls.push(request.arguments.forwarder);
      }
      return sendResponse('ok');
    } else if (request.command == 'reloadConfig') {
      loadConfig();
    } else {
      return sendResponse('Invalid Command: ' + request.command);
    }
  });