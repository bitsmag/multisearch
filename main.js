var timeouts = {};

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {

    function updateHighlights() {
      console.log('RECEIVED MESSAGE: ' + msg.searchTermInputId + ' - ' + msg.searchTerm);
      removeHighlights(msg.searchTermInputId);
      highlightSearchTerm(msg.searchTermInputId, msg.searchTerm);
    }

    if(timeouts[msg.searchTermInputId]) {
      clearTimeout(timeouts[msg.searchTermInputId]);
      timeouts[msg.searchTermInputId] = 0;
    }
    timeouts[msg.searchTermInputId] = setTimeout(updateHighlights, 1000);

  });
});

function highlightSearchTerm (searchTermInputId, searchTerm) {
  console.log('HIGHLIGHT SEARCHTERM: ' + searchTermInputId + ' - ' + searchTerm);
  if (searchTerm !== '') {
    findAndReplaceDOMText(document.getElementsByTagName('body')[0], {
      find: new RegExp(searchTerm, 'g'),
      replace: function(portion) {
        console.log('REPLACE FUNCTION: ' + searchTermInputId + ' - ' + searchTerm);
        var e = document.createElement('span');
        e.className = 'multisearch multisearch-' + searchTermInputId.split('-')[1];
        e.appendChild(document.createTextNode(portion.text));
        return e;
      }
    });
  }
}

function removeHighlights (searchTermInputId) {
  console.log('REMOVE HIGHLIGHTS: ' + searchTermInputId);
  var numberId = searchTermInputId.split('-')[1];
  var highlights = document.getElementsByClassName('multisearch-' + numberId);
  console.log('HIGHLIGHTS FOUND: ' + highlights.length);
  for (var i = highlights.length - 1; i >= 0; --i) {
      console.log('REMOVE: ' + i);
      var parent = highlights[i].parentNode;
      while(highlights[i].firstChild) parent.insertBefore(highlights[i].firstChild, highlights[i]);
      parent.removeChild(highlights[i]);
  }
}
