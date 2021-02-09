const path = require('path')

const chalk = require('chalk')
console.log(chalk.green('[wp-build] main'))

const spawnSync = require('./lib/spawn-sync');

const builderPath = path.join(__dirname, './lib/builder.js')
console.log(builderPath)

// Set id variable with the running mode ('development', 'production', 'debugging')
// WARNING: It must be set& Othercase, the cluster builder reject its run
if(!process.env.__WP_BUILDER_CONFIG__){
  process.env.__WP_BUILDER_CONFIG__ = JSON.stringify({})
}

// Run cluster builder
spawnSync('node', [builderPath, 'Hello Argv'])

