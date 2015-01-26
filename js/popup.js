document.addEventListener('DOMContentLoaded', function () {
    function clusterize() {
        console.log('clusterize');
        chrome.extension.sendMessage({
          clusterize: true,
          clusters: parseInt(document.getElementById('clusters').value)
        }, function () {
        });
    }

    document.getElementById('btn').addEventListener('click', clusterize, false);
}, false);
