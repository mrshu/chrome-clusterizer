function Background()
{
}

Background.prototype.get_text = function(callback) {
    var out = new Array();
    chrome.tabs.query({}, function(tabs) {
        tabs.forEach(function(e, i ,a) {
            // ignoring internal urls
            if (tabs[i].url.indexOf("chrome") == 0) return;
            chrome.tabs.sendMessage(tabs[i].id, {action: "get_text"}, function(response) {
                out.push({text: response.text, url: tabs[i].url, title: response.title});
            });
        });
        callback(out);
    });
}


var background = new Background();
