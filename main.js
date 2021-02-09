const path = require('path')

const chalk = require('chalk')
console.log(chalk.green('[wp-build] main'))

const spawnSync = require('./lib/spawn-sync');

const builderPath = path.join(__dirname, './lib/builder.js')
console.log(builderPath)

// WARNING: It must be set& Othercase, the cluster builder reject its run
// NOTE: (kard) We need to convert context and args to the process config here.
// Also, we allow to prepare the config on the uppe level for usage in 3d paty components.
const config = {
  wpConfigPath: path.join(__dirname, './webpack/dev.config.js'),
  builderConfigPath: path.join(process.cwd(), './brands/build.config.js'),
  optionsField: 'brands', // of builderConfigPath
}

if(!process.env.__WP_BUILDER_CONFIG__){
  process.env.__WP_BUILDER_CONFIG__ = JSON.stringify(config)
}

// Run cluster builder
spawnSync('node', [builderPath, 'Hello Argv'])

