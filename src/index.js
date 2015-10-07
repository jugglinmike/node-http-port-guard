'use strict';

var testHttp = require('./test-http');
var poll = require('./poll');

/**
 * @param {number} port
 * @param {object} [options]
 * @param {string} [options.host] - Host name of the server to poll. Defaults
 *                                  to 'localhost'
 * @param {string} [options.retryPeriod] - number of milliseconds to wait
 *                                         between port polling operations;
 *                                         defaults to 100
 * @param {string} [options.retryCount] - number of polling failures to
 *                                        tolerate before considering the
 *                                        operation a failure; defaults to 100
 * @param {Function} [options.Promise] - Promise A/+ constructor; defaults to
 *                                       globally-defined Promise
 * @param {Function} startFn A function that starts a server process on the
 *                           supplied port. This function should return a
 *                           `kill` callback function that kills the server.
 *
 * @returns {Promise} rejected if the port is already in use or if requests to
 *                    the specified port fail after startup. Resolved with the
 *                    `kill` callback function provided by `startFn`.
 */
module.exports = function(port, options, startFn) {
  var testPort;

  if (typeof options === 'function') {
    startFn = options;
    options = {};
  }

  if (!('host' in options)) {
    options.host = 'localhost';
  }

  if (!('retryPeriod' in options)) {
    options.retryPeriod = 100;
  }

  if (!('retryCount' in options)) {
    options.retryCount = 100;
  }

  if (!('Promise' in options)) {
    options.Promise = Promise;
  }

  testPort = testHttp.bind(null, options.host, port, options.Promise);

  return testPort().then(function() {
      throw new Error(
          'Refusing to start server process on port ' + port +
          ' (port already in use)'
        );
    }, function() {
      // No server found; okay to proceed.
      var kill = startFn();

      return poll(testPort, options.retryCount, options.retryPeriod)
        .then(function() {
          return kill;
        }, function(err) {
          throw new Error('Server unavailable: ' + err);
        });
    });
};
