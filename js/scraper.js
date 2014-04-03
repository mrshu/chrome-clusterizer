
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
            if (request.action == "get_text") {
                var obj = $('div');
                if (obj == undefined) sendResponse({text: ""});
                sendResponse({text: obj.text()});
            }
    });
