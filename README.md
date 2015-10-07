# Node.js HTTP Port Guard

Wrap a server "start" function in asynchronous checks for port availability.
Fail if the port is already in use prior to function execution or if the port
does not become utilized after execution.

The only reliable way to determine if a server process has started successfully
is to poll the port it has been assigned. If this port is already in use\*, the
child process will fail to start, but the current process will consider the
operation a success. This invalidates the `kill` function created by this
module and will likely lead to errors during test cleanup.

\* This condition will most commonly be caused by a zombie server instance
   erroneously created in some prior test run.

## API

This module exposes a single function that accepts two arguments: the desired
port and a function that is expected to bind to that port (the actual binding
may take place in another process). This function should return a `kill`
callback function that kills the server

```js
var portGuard = require('http-port-guard');

portGuard(8000, function() {
  var app = startMyApp();

  return app.destroy;
}).then(function(kill) {
  console.log('Application is now available on port 8000!');

  console.log('Now destroying application.');
  kill();
});
```

If the second argument is an object, it will be interpreted as an "options"
object, and the following properties will be honored:

- `host` - {string} - Host name of the server to poll. Defaults to 'localhost'
- `retryPeriod` - {string} - number of milliseconds to wait between port polling
  operations; defaults to 100
- `retryCount` - {string} - number of polling failures to tolerate before
  considering the operation a failure; defaults to 100
- `Promise` - {Function} - Promise A/+ constructor; defaults to
  globally-defined Promise

The function resutns a Promise that is rejected if the port is already in use
or if requests to the specified port fail after startup. It is resolved with
the `kill` callback function provided by `startFn`.

## License

Copyright (c) 2015 Mike Pennisi  
Licensed under the MIT license.
