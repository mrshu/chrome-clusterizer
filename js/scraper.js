
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
            if (request.action == "get_text") {
                sendResponse({text: document.body.innerText, title: document.title});
            }
    });
