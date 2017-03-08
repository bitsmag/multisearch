var port;

function getTabId(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var id = tab.id;
    callback(id);
  });
}

function isLastInput (id) {
	var isLast = true;
	var searchTermInputs = document.getElementById('searchTermsForm').getElementsByTagName('input');

	for (var i = 0; i < searchTermInputs.length; i++) {
		if (searchTermInputs[i].id.split("-")[1] > id) {
			isLast = false;
		}
	}

	return isLast;
}

function addNewInput (id, value) {
	var inputNode = document.createElement('input');
	inputNode.type = 'text';
	inputNode.id = 'searchTermInput-' + id;
  inputNode.value = value;
	document.getElementById('searchTermsForm').appendChild(inputNode);
}

function addChangeListener (numberId) {
  (function () {
  	var searchTermInput = document.getElementById('searchTermInput-'+numberId);
    if (searchTermInput) {
      searchTermInput.addEventListener('input', function(){
        port.postMessage({searchTermInputId: searchTermInput.id, searchTerm: searchTermInput.value});
        if (isLastInput(numberId)) {
          addNewInput(numberId+1, null);
          addChangeListener(numberId+1);
        }
      });
    }
  }());
}

document.addEventListener('DOMContentLoaded', function() {

	getTabId(function(tabId){
		port = chrome.tabs.connect(tabId, {name: 'multisearch'});

    port.onMessage.addListener(function(msg) { // After connect main.js sends stored searchTerms
      var i = 0;
      do {
        searchTerm = msg.searchTerms['searchTermInput-'+i] ? msg.searchTerms['searchTermInput-'+i] : null;
        addNewInput(i, searchTerm);
        addChangeListener(i);
        i++;
      }
      while (msg.searchTerms['searchTermInput-'+i]);
    });
	});

});
