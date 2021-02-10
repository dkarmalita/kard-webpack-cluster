const path = require('path')
const chalk = require('chalk')
const numCPUs = require('os').cpus().length;
const { Logger } = require('@kard/node-logger');
const spawnSync = require('./lib/spawn-sync');
const { isNumber } = require('./lib/utils');
const validateProcessConfig = require('./lib/validateProcessConfig')

// TODO:
// [x] remove brands verb (cluster.js)
// [x] implement config.onlyOption support
// [x] implements config.logColors support. shape { master: 'magenta', builder: 'blue', queue: 'firebrick'}
// [ ] validate config here && combine config with CLI
// [ ] add json builder config support

const build = (config) => {
  validateProcessConfig(config)

  // Update config with defaults
  if(!config.logColors){ config.logColors = {} }
  if(!config.maxThreads){ config.maxThreads = numCPUs }

  // WARNING: It must be set. Othercase, the cluster builder reject its run
  process.env.__WP_BUILDER_CONFIG__ = JSON.stringify(config)

  // it sets LOGLEVEL globally. We don't need make additional efforts in other files.
  if (!isNumber(process.env.LOGLEVEL)) {
    process.env.LOGLEVEL = config.logLevel || Logger.logLevels.Information;
  }

  // Run cluster builder
  const builderPath = path.join(__dirname, './lib/cluster.js')
  spawnSync('node', [builderPath, ...process.argv.slice(2)])
}

module.exports = build
