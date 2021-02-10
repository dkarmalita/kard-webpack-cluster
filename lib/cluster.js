const util = require('util');
const cluster = require('cluster');

const chalk = require('chalk')
const numCPUs = require('os').cpus().length;

const { Logger, utils: { formatBytes, formatDate } } = require('@kard/node-logger');

const { ThreadStat, isNumber, inspect, sysInfo, errorOnExternalRun } = require('./utils');
const { logMasterInfo } = require('./stat-utils')

// It insures the thread is executiong internally.
errorOnExternalRun();

if (cluster.isMaster) {

  // Extract config values
  const builderProcessConfig = JSON.parse(process.env.__WP_BUILDER_CONFIG__)
  const { maxThreads, minify } = builderProcessConfig;

  // Prepare master thread logger (separate)
  const log = new Logger('build master', builderProcessConfig.logColors.master, process.env.LOGLEVEL);

  const builderConfig = require(builderProcessConfig.builderConfigPath)
  const options = (builderProcessConfig.onlyOption && [builderProcessConfig.onlyOption]) || // only option
    (builderProcessConfig.optionsField && builderConfig[builderProcessConfig.optionsField]) || // array from field of object config
    builderConfig.options || // default field name of object config
    builderConfig; // config itself (must be an option array)

  const ts = new ThreadStat();

  logMasterInfo(log, builderProcessConfig, options)

  const Queue = require('./queue');

  Queue(options, {
    max: maxThreads,
    logColor: builderProcessConfig.logColors.queue,
    onFinish: (code) => {
      const stat = ts.getStat();
      const ets = stat.elapsedTime;
      log.info(`${code ? 'Fail!' : `Success! Buit ${options.length} brand(s)`} in ${ets} at ${formatDate(new Date())}`);
      log.debug(`Thread info \n${ts.inspect()}`);
    },
  });

} else {
  const option = typeof process.env.__WP_BUILDER_OPTION__ === 'object'
    ? JSON.parse(process.env.__WP_BUILDER_OPTION__)
    : process.env.__WP_BUILDER_OPTION__

  const builder = require('./builder');
  builder(option).then((x) => {
    process.exit(0);
  });
}
