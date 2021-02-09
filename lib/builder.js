const util = require('util');
const path = require('path');
const cluster = require('cluster');
const chalk = require('chalk');
const webpack = require('webpack');
const { ThreadStat } = require('./utils');
const { Logger } = require('@kard/node-logger');

let log
let ts;

const worker = cluster.worker;
worker.on('message', (msg) => {
  if (msg === 'stop') {
    log.warn('stopped');
    process.exit(0);
  }
});

async function build(config) {
  return new Promise((resolve) => {
    let compiler = webpack(config);
    compiler.run((err, stats) => {
      compiler = null;

      if (err) {
        log.critical(chalk.red(err.stack || err));
        if (err.details) {
          log.critical(chalk.red(err.details));
        }
        process.exit(1);
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        log.critical(chalk.red(info.errors.toString()));
        process.exit(1);
      }

      if (stats.hasWarnings()) {
        log.warn(chalk.yellow(info.warnings.toString()));
      }

      log.trace(stats.toString({ chunks: false, colors: true }));

      resolve(err);
    });
  });
}

const getOptionId = (option, builderProcessConfig) => {
  if(typeof option !== 'object'){ return option }
  if(!builderProcessConfig.optionIdField){ JSON.stringify(option) }
  return option[builderProcessConfig.optionIdField]
}

async function main(option) {
  const builderProcessConfig = JSON.parse(process.env.__WP_BUILDER_CONFIG__)
  const threadId = getOptionId(option, builderProcessConfig)

  log = new Logger(threadId, 'blue');
  log.setLogLevel(process.env.LOGLEVEL);

  log.info('Building...');
  ts = new ThreadStat(threadId);

  const configRaw = require(builderProcessConfig.wpConfigPath);
  const config = typeof configRaw === 'function' ? configRaw(option, builderProcessConfig) : configRaw;
  // const config = typeof configRaw === 'function' ? configRaw({ theme, subTheme, minify }) : configRaw;

  log.debug(`Output path: ${config.output.path}`);
  await build(config);

  log.info('Success!');
  log.debug(`Thread Info \n${ts.inspect()}`);
}

module.exports = main;
