Cluster.linkages = {
  'single': singleLink,
  'complete': completeLink,
  'average': averageLink,
}

function Cluster(options) {
  if (!(this instanceof Cluster)) return new Cluster(options)

  if (!Array.isArray(options.input)) throw new TypeError('input must be an array')
  if (!options.input.length) throw new Error('input must not be empty')
  if (typeof options.distance !== 'function') throw new TypeError('invalid distance function')

  if (typeof options.linkage === 'string') options.linkage = Cluster.linkages[options.linkage]

  if (typeof options.linkage !== 'function') throw new TypeError('invalid linkage function')


  this.input = options.input
  this.distance = options.distance
  this.linkage = options.linkage

  // array of distances between each input index
  this.distances = createDistanceArray(options.input, options.distance)
  // cache lookup for similarities between clusters
  this.links = Object.create(null)

  // store the current clusters by indexes
  // this is private and gets rewritten on every level
  var clusters = this.clusters = []
  for (var i = 0, l = options.input.length; i < l; i++)
    clusters.push([i])

  // store each level
  var level = {
    linkage: null,
    clusters: clusters,
  }
  this.levels = [level]

  var minClusters = Math.max(options.minClusters || 1, 1)
  var maxLinkage = typeof options.maxLinkage === 'number'
    ? options.maxLinkage
    : Infinity

  while (this.clusters.length > minClusters && level.linkage < maxLinkage)
    level = this.reduce()
  return this.levels
}

/**
 * Merge the two most closely linked clusters.
 */

Cluster.prototype.reduce = function () {
  var clusters = this.clusters
  var min
  for (var i = 0; i < clusters.length; i++) {
    for (var j = 0; j < i; j++) {
      var linkage = this.linkageOf(clusters[i], clusters[j])

      // set the linkage as the min
      if (!min || linkage < min.linkage) {
        min = {
          linkage: linkage,
          i: i,
          j: j,
        }
      }
    }
  }

  clusters = this.clusters = clusters.slice()
  clusters[min.i] = clusters[min.i].concat(clusters[min.j])
  clusters.splice(min.j, 1)
  var level = {
    linkage: min.linkage,
    clusters: clusters,
    from: j,
    to: i,
  }
  this.levels.push(level)
  return level
}

/**
 * Calculate the linkage between two clusters.
 */

Cluster.prototype.linkageOf = function (clusterA, clusterB) {
  var hash = clusterA.length > clusterB.length
    ? ('' + clusterA + '-' + clusterB)
    : ('' + clusterB + '-' + clusterA)
  var links = this.links
  if (hash in links) return links[hash]

  // grab all the distances
  var distances = [];
  for (var k = 0; k < clusterA.length; k++) {
    for (var h = 0; h < clusterB.length; h++) {
      distances.push(this.distanceOf(clusterA[k], clusterB[h]))
    }
  }

  // cache and return the linkage
  return links[hash] = this.linkage(distances)
}

/**
 * Calculate the distance between two inputs.
 */

Cluster.prototype.distanceOf = function (i, j) {
  if (i > j) return this.distances[i][j]
  return this.distances[j][i]
}

/**
 * Create the upper triangle of the symmetric, distance matrix.
 * Only i > j is valid for matrix[i][j].
 */

function createDistanceArray(input, distance) {
  var length = input.length
  var matrix = new Array(length)
  for (var i = 0; i < length; i++) {
    matrix[i] = new Array(i)
    for (var j = 0; j < i; j++)
      matrix[i][j] = distance(input[i], input[j])
  }

  return matrix
}

/*
 * Predefined linkage functions
 */

function singleLink(distances) {
  return Math.min.apply(null, distances)
}

function completeLink(distances) {
  return Math.max.apply(null, distances)
}

function averageLink(distances) {
  var sum = distances.reduce(function (a, b) {
    return a + b
  })
  return sum / distances.length
}

// Manhattan distance (for now)
function distanceMeasure(a, b) {
  var d = 0;
  var aN = 0;
  var bN = 0;
  for (var i = 0; i < a.length; i++) {
      d += a[i] * b[i];
      aN += a[i] * a[i];
      bN += b[i] * b[i];
  }
  return d / (Math.sqrt(aN) + Math.sqrt(bN));
}

function TfIdf(docs) {
    var $this = this;
    this.D = docs.length;
    this._idfCache = {};

    this.docs = docs.map(function(doc){
        return $this.tf(doc);
    });

    this.computed_docs = this.equalize(this.docs);
}

TfIdf.prototype.get_docs = function() {
    return this.computed_docs;
}

TfIdf.prototype.tf = function (doc) {
    var matches = doc.match(/\b\w\w+\b/g);
    matches = matches.map(function(match) {
        return match.toLowerCase();
    });
    var frequencies = {};
    matches.map(function(item) {
        if (item in frequencies) {
            frequencies[item] += 1;
        } else {
            frequencies[item] = 1;
        }
    });

    return frequencies;
}

TfIdf.prototype.idf = function (term) {
    if (this._idfCache[term] && this._idfCache.hasOwnProperty(term))
        return this._idfCache[term];

    var df = 0;
    this.docs.map(function(doc) {
        df += ((term in doc) ? 1 : 0);
    });

    var idf = 1 + Math.log((this.D) / ( 1 + df ));
    this._idfCache[term] = idf;
    return idf;
}

TfIdf.prototype.equalize = function(docs) {
    var $this = this;
    var keys = new Array();
    docs.map(function(doc){
        keys = keys.concat(Object.keys(doc));
    });

    keys = keys.filter(function (e, i, keys) {
        return keys.lastIndexOf(e) === i;
    });

    return docs.map(function(doc){
        var frequencies = new Array();
        for (var i in keys) {
            var key = keys[i];

            if (key in doc) {
                frequencies.push(doc[key] * $this.idf(key));
            } else {
                frequencies.push(0);
            }
        }

        return frequencies;
    });
}

function Clusterizer(docs, numClusters) {
    docs = docs.map(function (doc) {
        return doc.text;
    });

    var tfidf = new TfIdf(docs);

    docs = tfidf.get_docs();

    var levels = Cluster({
      input: docs,
      distance: distanceMeasure,
      linkage: 'complete',
      minClusters: numClusters,
    });

    return levels;
}

function Background()
{
    var $this = this;

    // Automatically inject content scripts on install
    // as per http://stackoverflow.com/a/11598753
    this.inject();

    chrome.extension.onMessage.addListener(function(request, sender, callback){
        if (request.clusterize)
            $this.clusterize(request.clusters);
        if (request.equalize)
            $this.equalize();
        return true;
    });
}

Background.prototype.equalize = function () {
    chrome.tabs.query({}, function(tabs) {
        tabs = tabs.filter(function (tab) {
            return ! tab.url.match(/chrome-devtools:\/\//gi);
        });

        var firstTab = tabs.pop();
        chrome.windows.create({
            tabId: firstTab.id
        }, function(win) {
            var tabIds = tabs.map(function (tab) {
                return tab.id
            });
            chrome.tabs.move(tabIds, {windowId: win.id, index: -1});
        });
    });
}

var ALLOWED_URLS_RE = /https?:\/\//gi;

Background.prototype.clusterize = function(numClusters) {
    this.out = new Array();
    var $this = this;
    chrome.tabs.query({}, function(tabs) {
        var t = new Array();

        tabs.forEach(function(e, i, a){
            // ignoring internal urls
            if (tabs[i].url.match(ALLOWED_URLS_RE)) {
                t.push(e);
            }
        });

        t.forEach(function(e, i ,a) {
            chrome.tabs.sendMessage(t[i].id, {action: "get_text"}, function(response) {
                if (response == undefined) return;
                $this.out.push({
                    text: response.text,
                    url: e.url,
                    title: response.title,
                    id: e.id
                });

                var ids = $this.out.map(function (item) {
                    return item.id;
                });
                console.log(t.filter(function(i) {
                    return ids.indexOf(i.id) < 0;
                }));
                console.log(t.length, $this.out.length);

                if (t.length == $this.out.length) {
                    var clusters = new Clusterizer($this.out, numClusters);
                    console.log(clusters);
                    clusters = clusters[clusters.length -1].clusters;
                    console.log(clusters.map(function(cluster){
                        return cluster.map(function(id) {
                            return $this.out[id].url;
                        });
                    }));

                    clusters.map(function (cluster) {
                        var firstID = cluster.pop();
                        chrome.windows.create({
                            tabId: $this.out[firstID].id,
                            type: "normal"
                        }, function (win) {
                            var tabIDs = cluster.map(function(id) {
                                return $this.out[id].id;
                            });
                            chrome.tabs.move(tabIDs, {windowId: win.id, index: -1});
                        });

                    });
                }
            });
        });
    });
}

Background.prototype.inject = function () {
    // Add a `manifest` property to the `chrome` object.
    chrome.manifest = chrome.app.getDetails();

    var injectIntoTab = function (tab) {
        // You could iterate through the content scripts here
        var scripts = chrome.manifest.content_scripts[0].js;
        var i = 0, s = scripts.length;
        for( ; i < s; i++ ) {
            chrome.tabs.executeScript(tab.id, {
                file: scripts[i]
            });
        }
    }

    // Get all windows
    chrome.windows.getAll({
        populate: true
    }, function (windows) {
        var i = 0, w = windows.length, currentWindow;
        for( ; i < w; i++ ) {
            currentWindow = windows[i];
            var j = 0, t = currentWindow.tabs.length, currentTab;
            for( ; j < t; j++ ) {
                currentTab = currentWindow.tabs[j];
                // Skip chrome:// and other pages
                if(currentTab.url.match(ALLOWED_URLS_RE)) {
                    injectIntoTab(currentTab);
                }
            }
        }
    });
}


var background = new Background();
