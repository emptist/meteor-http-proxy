var cacheTime = 30000; // cache hostname map for 30 seconds

HTTPProxy = {};

HTTPProxy.HostNameMap = new Meteor.Collection("HostNameMap");
HTTPProxy.HostNameMap._ensureIndex({hostname: 1}, {unique: true});
// hostname (unique), target.host, target.port

var htCache = {};
function getProxyForHostname(hostname) {
	if (typeof hostname !== "string") return;
	var doc = htCache[hostname];
	if (!doc || doc.lastRetrieved < Date.now() - cacheTime) {
	  // refresh cached target
	  doc = HTTPProxy.HostNameMap.findOne({hostname: hostname});
	  if (doc) {
		doc = {
			proxyServer: new httpProxy.createProxyServer({ target: doc.target }),
			lastRetrieved: Date.now()
		};
		htCache[hostname] = doc;
	  }
	}
	return doc && doc.proxyServer;
}

function removePort(hostname) {
	var lastColon = hostname.lastIndexOf(":");
	if (lastColon === -1) {
		return hostname;
	}
	return hostname.slice(0, lastColon);
}

var http = Npm.require('http'), httpProxy = Npm.require('http-proxy'), url = Npm.require('url');

/**
 * Starts the proxy server.
 * @param  {Object} [options]
 * @param  {Number} [options.port=8080]
 * @param  {String|Object} [options.fallbackTarget]
 * @return {undefined}
 */
HTTPProxy.start = function httpProxyStart(options) {
	options = options || {};

    // Create a proxy server
	var proxyServer = http.createServer(Meteor.bindEnvironment(function (req, res) {
	  var proxy, hostname = removePort(req.headers.host);
	  if (hostname) {
	  	proxy = getProxyForHostname(hostname);
	  } else if (options.fallbackTarget) {
	  	proxy = new httpProxy.createProxyServer({
		    target: options.fallbackTarget
		});
	  }
	  if (!proxy) {
	  	console.warn('HTTPProxy: Could not proxy web traffic for ' + req.headers.host);
	    res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not Found\n");
        res.end();
	    return;
	  }
	  proxy.web(req, res);
	}, "HTTPProxy.start createServer"));

	// Listen to the `upgrade` event and proxy the
	// WebSocket requests as well.
	proxyServer.on('upgrade', Meteor.bindEnvironment(function (req, socket, head) {
	  var proxy, hostname = removePort(req.headers.host);
	  if (hostname) {
	  	proxy = getProxyForHostname(hostname);
	  } else if (options.fallbackTarget) {
	  	proxy = new httpProxy.createProxyServer({
		    target: options.fallbackTarget
		});
	  }
	  if (!proxy) {
	  	console.warn('HTTPProxy: Could not proxy websocket traffic for ' + req.headers.host);
	    res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not Found\n");
        res.end();
	    return;
	  }
	  proxy.ws(req, socket, head);
	}, "HTTPProxy.start createServer"));

	proxyServer.listen(options.port || 8080);
};