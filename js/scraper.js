
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
            if (request.action == "get_text") {
                var text = '';
                var obj = $('div');
                if (obj == undefined) sendResponse({text: ""});

                obj.each(function(i){
                    var tmp = $(this).html();
                    tmp = tmp.replace(/<script[\s\S]*>[\s\S]*<\/script>/gi, '');
                    tmp = tmp.replace(/(<([^>]+)>)/ig, ' ');
                    text += tmp;
                })
                sendResponse({text: text, title: document.title});
            }
    });
