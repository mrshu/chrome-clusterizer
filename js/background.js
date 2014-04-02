function Background()
{
}

Background.prototype.get_text = function() {
    chrome.tabs.query({}, function(tabs) {
        console.log(tabs);
        chrome.tabs.sendMessage(tabs[0].id, {action: "get_text"}, function(response) {
            console.log(response.text);
        });
    });
}


var background = new Background();
