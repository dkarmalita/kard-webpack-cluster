const path = require('path')
const chalk = require('chalk')
const { Logger } = require('@kard/node-logger');
const spawnSync = require('./lib/spawn-sync');
const { isNumber } = require('./lib/utils');

// Here we have take processConfig passed or prepare own one.
// NOTE: (kard) We need to convert context and args to the process config here.
// Also, we allow to prepare the config on the uppe level for usage in 3d paty components.
const config = !process.env.__WP_BUILDER_CONFIG__
  ? {
    wpConfigPath: path.join(__dirname, './webpack/dev.config.js'),
    builderConfigPath: path.join(process.cwd(), './brands/build.config.js'),
    optionsField: 'brands', // of builderConfigPath
    optionIdField: null, // within an option object if ant
    maxThreads: 5,
    minify: false,
    loglevel: Logger.logLevels.Information,
    // ref: https://github.com/dkarmalita/kard-node-logger/blob/master/lib/Logger.js
  }
  : JSON.parse(process.env.__WP_BUILDER_CONFIG__)

// WARNING: It must be set. Othercase, the cluster builder reject its run
if(!process.env.__WP_BUILDER_CONFIG__){
  process.env.__WP_BUILDER_CONFIG__ = JSON.stringify(config)
}

// it sets LOGLEVEL globally. We don't need make additional efforts in other files.
if (!isNumber(process.env.LOGLEVEL)) { process.env.LOGLEVEL = config.loglevel; }

// Run cluster builder
const builderPath = path.join(__dirname, './lib/cluster.js')
spawnSync('node', [builderPath, ...process.argv.slice(2)])

