function Background()
{
}

Background.prototype.get_text = function() {
    chrome.tabs.query({}, function(tabs) {
        tabs.forEach(function(e, i ,a) {
            console.log(tabs[i]);
            if (tabs[i].url.indexOf("chrome") == 0) return;
            chrome.tabs.sendMessage(tabs[i].id, {action: "get_text"}, function(response) {
                console.log(response.text);
            });
        })
    });
}


var background = new Background();
