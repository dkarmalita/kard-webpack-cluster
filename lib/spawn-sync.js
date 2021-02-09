const path = require('path');
const crossSpawn = require('cross-spawn');

/* eslint-disable no-console */
module.exports = async function spawnSync(app, args = [], stdio = 'inherit') {
  const result = crossSpawn.sync(
    app, args, { stdio },
  );
  if (result.signal) {
    if (result.signal === 'SIGKILL') {
      console.log(
        'The build failed because the process exited too early. ' +
          'This probably means the system ran out of memory or someone called ' +
          '`kill -9` on the process.',
      );
    } else if (result.signal === 'SIGTERM') {
      console.log(
        'The build failed because the process exited too early. ' +
          'Someone might have called `kill` or `killall`, or the system could ' +
          'be shutting down.',
      );
    }
    return 1;
  }
  return result.status;
};

