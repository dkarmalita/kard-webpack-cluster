const cluster = require('cluster');
const chalk = require('chalk');
const { Logger, utils: { formatBytes, formatDate } } = require('@kard/node-logger');

let stop = false;

function stopAll() {
  stop = true;
  Object.keys(cluster.workers).forEach(id => cluster.workers[id].send('stop'));
}

function Worker(option, logColor) {
  const log = new Logger(`worker ${option}`, logColor, process.env.LOGLEVEL);
  let _worker = null;

  let _start = null;
  let _finish = null;

  this.getStart = () => _start;
  this.getFinish = () => _finish;

  this.getTheme = () => option;
  this.isActive = () => !!_worker;
  this.isReady = () => !_start;
  this.getWorker = () => _worker;
  this.fork = () => {
    _start = new Date();
    _worker = cluster.fork({ __WP_BUILDER_OPTION__: option });

    _worker.on('exit', (code, signal) => {
      _finish = new Date();
      _worker = null;

      /* eslint-disable no-console */
      if (signal) {
        log.warn(`${option} worker was killed by signal: ${signal}`);
      } else if (code !== 0) {
        log.warn(`${option} worker exited with error code: ${code}`);
      } else {
        // console.log(`${option}  worker success!`);
      }
    });
  };
}

function Queue(options, { max, onFinish, logColor } = {}) {
  const _queue = options.map(option => new Worker(option, logColor));

  const _start = new Date();
  let _finish = null;

  this.getStart = () => _start;
  this.getFinish = () => _finish;

  this.onFinish = (code) => {
    _finish = new Date();
    if (typeof onFinish === 'function') { onFinish(code); }
  };

  this.countActive = () => _queue.filter(el => el.isActive()).length;
  this.activate = () => {
    if (stop) { return; }
    _queue.forEach((e, i, q) => {
      if (!e.isReady()) { return; }
      if (max && this.countActive() >= max) { return; }
      e.fork();
    });
  };

  cluster.on('exit', (worker, code, signal) => {
    if (stop && this.countActive() === 0) {
      this.onFinish(1);
      process.exit(1);
    }
    if (stop) { return; }
    if (code) { stopAll(); }
    this.activate();
    if (this.countActive() === 0) {
      this.onFinish(0);
    }
  });

  this.activate();
}

module.exports = Queue;
