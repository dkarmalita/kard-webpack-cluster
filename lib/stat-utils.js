const chalk = require('chalk')
const { Logger, utils: { formatBytes, formatDate } } = require('@kard/node-logger');
const { inspect, sysInfo } = require('./utils');

const logMasterInfo = (log, builderProcessConfig, options) => {
  log.debug(`builderProcessConfig: \n`, inspect(builderProcessConfig));
  log.info(`${formatDate(new Date())} build strarting for ${options.length} option(s)`);
  log.debug(`${formatDate(new Date())} build strarting for \n${inspect(options)}`);
  log.debug(`loglevel ${log.getLogLevel()} (${Logger.getLevelId(log.getLogLevel())})`);
  log.trace(`System info \n${sysInfo()}`);
}

module.exports = {
  logMasterInfo,
}
