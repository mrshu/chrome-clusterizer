
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
            if (request.action == "get_text")
                sendResponse({text: $('div').text()});
    });
