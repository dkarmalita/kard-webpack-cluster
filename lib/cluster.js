const cluster = require('cluster');
const { Logger, utils: { formatDate } } = require('@kard/node-logger');
const { ThreadStat, errorOnExternalRun } = require('./utils');
const { logMasterInfo } = require('./stat-utils');

// It insures the thread is executiong internally.
errorOnExternalRun();

if (cluster.isMaster) {
  // Extract config values
  const builderProcessConfig = JSON.parse(process.env.__WP_BUILDER_CONFIG__);
  const { maxThreads } = builderProcessConfig;

  // Prepare master thread logger (separate)
  const log = new Logger('build master', builderProcessConfig.logColors.master, process.env.LOGLEVEL);

  // eslint-disable-next-line import/no-dynamic-require, global-require
  const builderConfig = require(builderProcessConfig.builderConfigPath);

  const { onlyOption, optionsField } = builderProcessConfig;
  const options = (onlyOption && [onlyOption]) // only option the first
    || (optionsField && builderConfig[optionsField]) // array from field of object config
    || builderConfig.options // default field name of object config
    || builderConfig; // config itself (must be an option array)

  const ts = new ThreadStat();

  logMasterInfo(log, builderProcessConfig, options);

  // eslint-disable-next-line global-require
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
    : process.env.__WP_BUILDER_OPTION__;

  // eslint-disable-next-line global-require
  const builder = require('./builder');
  builder(option).then(() => {
    process.exit(0);
  });
}
