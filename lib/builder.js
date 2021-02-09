const util = require('util');
const cluster = require('cluster');

const chalk = require('chalk')
const numCPUs = require('os').cpus().length;

const { Logger } = require('@kard/node-logger');

const inspect = (obj) => util.inspect(obj, { depth: Infinity, colors: true } )

const log = new Logger('wp-builder', 'blue');
log.setLogLevel(process.env.LOGLEVEL || '');

if(!process.env.__WP_BUILDER_CONFIG__){
  log.critical(chalk.red('builder configuration lost'))
  process.exit(0)
}

if (cluster.isMaster) {

  console.log(`Master ${process.pid} is running`);

  console.log(chalk.green('[argv]'), process.argv.slice(2))
  const builderProcessConfig = JSON.parse(process.env.__WP_BUILDER_CONFIG__)
  console.log(chalk.green('[builderProcessConfig]'), builderProcessConfig)
  const builderConfig = require(builderProcessConfig.builderConfigPath)
  console.log('[builderConfig]', inspect(builderConfig))

  const options = builderConfig[builderProcessConfig.optionsField] || builderConfig.options || builderConfig;

  // Fork workers.
  for (let i = 0; i < options.length; i++) {
    cluster.fork({ __WP_BUILDER_OPTION__: JSON.stringify(options[i]) });
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {

  const option = JSON.parse(process.env.__WP_BUILDER_OPTION__)
  console.log(`Worker ${process.pid} started for`, option);
  setTimeout(process.exit, 1000)
}
