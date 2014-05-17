meteor-http-proxy
==============

Simple dynamic HTTP proxying with Meteor. This is a proof of concept; it has not been performance tested.

## Simple Example

```js
if (Meteor.isServer) {
  Meteor.startup(function () {
    HTTPProxy.start({
      port: 80,
      fallbackTarget: '127.0.0.1:9000'
    });

    // Add some hostnames to proxy.
    // Hostnames can be added or removed at any time before or after
    // starting the proxy server
    // and routing logic will immediately reflect your changes.
    // The hostname must be unique.
    HTTPProxy.HostNameMap.insert({
    	hostname: 'something.com',
    	target: {
    		host: '127.0.0.1',
    		port: 9001
    	}
    });
    HTTPProxy.HostNameMap.insert({
    	hostname: 'one.something.com',
    	target: {
    		host: '127.0.0.1',
    		port: 9002
    	}
    });
    HTTPProxy.HostNameMap.insert({
    	hostname: 'somethingelse.org',
    	target: {
    		host: '127.0.0.1',
    		port: 9003
    	}
    });

    // Assuming you modify DNS to route all of the registered hostnames
    // to the server that is running this app, this will take care of
    // routing the incoming requests to the correct app.
  });
}
```