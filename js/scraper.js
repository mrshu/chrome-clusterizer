
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
            if (request.action == "get_text") {
                var links = document.getElementsByTagName('a');
                var hrefs = new Array();
                for (var i = 0; i < links.length; i++) {
                    var host = links[i].hostname;
                    host = host.replace(/www\./, '');

                    if (host !== '')
                        hrefs.push(host);
                }

                console.log(hrefs)

                sendResponse({
                    text: document.body.innerText,
                    title: document.title,
                    links: hrefs
                });
            }
    });
