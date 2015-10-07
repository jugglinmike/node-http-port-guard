'use strict';

var poll = module.exports = function(exec, retryCount, retryPeriod, count) {
  return exec().then(null, function() {
    count = (count || 0) + 1;
    if (count < retryCount) {

      return new Promise(function(resolve) {
        setTimeout(resolve, retryPeriod);
      }).then(poll.bind(null, exec, retryCount, retryPeriod, count));
    } else {
      throw new Error('Polling timeout (' + count + ' attempts)');
    }
  });
};
