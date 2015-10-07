'use strict';

var http = require('http');
var test = require('tape');
var sinon = require('sinon');

var portGuard = require('../');

function createServer(host, port, done) {
  var server = http.createServer(function(req, res) {
    res.end('');
  });

  server.listen(port, host, done);

  return server;
}

test('resolves once server becomes available', function(t) {
  var ready = false;
  var server;

  t.timeoutAfter(2000);

  portGuard(8082, function() {
    server = createServer('localhost', 8082, function() {
      ready = true;
    });
  }).then(function() {
    server.close();
    t.equal(ready, true);
    t.end();
  }, function(err) {
    t.fail(err);
  });
});

test('resolves Promise with provided value', function(t) {
  var obj = {};
  var server;

  t.timeoutAfter(2000);

  portGuard(8082, function() {
    server = createServer('localhost', 8082, function() {});
    return obj;
  }).then(function(val) {
    server.close();
    t.equal(val, obj);
    t.end();
  }, function(err) {
    t.fail(err);
  });
});

test('fails when port is in use', function(t) {
  var server = createServer('localhost', 8083, function() {
    portGuard(8083, function() {})
      .then(function() {
        t.fail('Expected promise to be rejected.');
        server.close();
      }, function() {
        server.close();
        t.end();
      });
  });
});

test('uses custom Promise constructor', function(t) {
  var server, spiedResolve, spiedReject;
  var TruePromise = Promise;
  var MyPromise = sinon.spy(function(resolver) {
    return new TruePromise(function(trueResolve, trueReject) {
      spiedResolve = sinon.spy(trueResolve);
      spiedReject = sinon.spy(trueReject);
      resolver(spiedResolve, spiedReject);
    });
  });
  sinon.spy(global, 'Promise');

  portGuard(8008, { Promise: MyPromise }, function() {
    t.ok(MyPromise.callCount > 0);
    t.ok(Promise.callCount === 0);
    server = createServer('localhost', 8008, function() {});
  }).then(function() {
    server.close();
    t.ok(MyPromise.callCount > 0);
    t.ok(Promise.callCount === 0);
    t.end();
  }, function(err) {
    t.fail(err);
  }).then(function() {
    Promise.restore();
  });
});
