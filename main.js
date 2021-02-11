const path = require('path');
const numCPUs = require('os').cpus().length;
const { Logger } = require('@kard/node-logger');
const spawnSync = require('./lib/spawn-sync');
const { isNumber } = require('./lib/utils');
const validateProcessConfig = require('./lib/validateProcessConfig');

const build = (config) => {
  validateProcessConfig(config);

  const cfg = { ...config };

  // Update cfg with defaults
  if (!cfg.logColors) { cfg.logColors = {}; }
  if (!cfg.maxThreads) { cfg.maxThreads = numCPUs; }

  // WARNING: It must be set. Othercase, the cluster builder reject its run
  process.env.__WP_BUILDER_CONFIG__ = JSON.stringify(cfg);

  // it sets LOGLEVEL globally. We don't need make additional efforts in other files.
  if (!isNumber(process.env.LOGLEVEL)) {
    process.env.LOGLEVEL = cfg.logLevel || Logger.logLevels.Information;
  }

  // Run cluster builder
  const builderPath = path.join(__dirname, './lib/cluster.js');
  spawnSync('node', [builderPath, ...process.argv.slice(2)]);
};

module.exports = build;
