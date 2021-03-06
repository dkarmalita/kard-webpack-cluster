const os = require('os');
const util = require('util');
const chalk = require('chalk');
const { Logger, utils: { formatBytes, formatInterval } } = require('@kard/node-logger');

function sysInfo() {
  return util.inspect({
    FreeMemory: formatBytes(os.freemem()),
    TotalMemory: formatBytes(os.totalmem()),
    CPU_Architecture: os.arch(),
    CPU_Qty: os.cpus().length,
    CPU_List: os.cpus(),
  },
  {
    colors: true,
    depth: Infinity,
  });
}

function ThreadStat() {
  this.startDT = new Date();
  this.getStat = () => {
    const used = process.memoryUsage();
    return {
      elapsedTime: formatInterval(this.startDT, new Date()),

      rss: formatBytes(used.rss),
      // rss, Resident Set Size, is the amount of space occupied in the main memory
      // device (that is a subset of the total allocated memory) for the process,
      // including all C++ and JavaScript objects and code.

      heapTotal: formatBytes(used.heapTotal),
      // heapTotal and heapUsed refer to V8's memory usage

      heapUsed: formatBytes(used.heapUsed),

      external: formatBytes(used.external),
      // external refers to the memory usage of C++ objects bound to JavaScript
      // objects managed by V8.
    };
  };
  this.inspect = () => util.inspect(this.getStat(), { colors: true, depth: Infinity });
}

const isNumber = (x) => typeof x === 'number' || !Number.isNaN(parseInt(x, 10));

const errorOnExternalRun = () => {
  const log = new Logger('wp-builder');

  if (!process.env.__WP_BUILDER_CONFIG__) {
    log.critical(chalk.red('builder configuration lost'));
    process.exit(0);
  }
};

module.exports = {
  ThreadStat,
  isNumber,
  sysInfo,
  errorOnExternalRun,
  inspect: (obj, cfg) => util.inspect(obj, cfg || { colors: true, depth: Infinity }),
};
