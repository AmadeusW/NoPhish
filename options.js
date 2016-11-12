
function restoreOptions() {
  chrome.storage.sync.get({
    trackedDomains: null,
  }, function(items) {

  	if (items.trackedDomains == null) {
  		document.getElementById('trackedDomains').value = defaultTrackedDomains.join('\r\n');
  	} else {
  		document.getElementById('trackedDomains').value  = items.trackedDomains.join('\r\n');
  	}
  });
}

function saveOptions() {

	var trackedDomains = document.getElementById('trackedDomains').value;
	trackedDomains = trackedDomains.split(/\r|\n/m).filter(function (i) { return i != null && i != ''; });
	chrome.storage.sync.set({'trackedDomains': trackedDomains}, function() {
		var saveSuccessful = document.getElementById('saveSuccessful')
		saveSuccessful.style.display = null;
		setTimeout(function() { saveSuccessful.style.display = "none"; },5000);
		var cmd = {
        	command: "reloadConfig", 
    	};
    	chrome.runtime.sendMessage(cmd);

	});
}

function reloadDefaults() {
	document.getElementById('trackedDomains').value = defaultTrackedDomains.join('\r\n');
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('reloadDefaults').addEventListener('click', reloadDefaults);

