document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn').addEventListener('click', function() {
        console.log('clusterize');
        chrome.extension.sendMessage({
          clusterize: true,
          clusters: parseInt(document.getElementById('clusters').value)
        }, function () {
        });

        document.getElementById('status').innerHTML = 'Hard computation in process ...';
    }, false);

    document.getElementById('equalize').addEventListener('click', function () {
        chrome.extension.sendMessage({
            equalize: true
        });
    }, false);
}, false);
