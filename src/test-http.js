'use strict';

var http = require('http');

module.exports = function(host, port, Promise) {
  return new Promise(function(resolve, reject) {
    http.get({ host: host, port: port }, function() {
      resolve();
    }).on('error', function(err) {
      reject(err);
    });
  });
};
