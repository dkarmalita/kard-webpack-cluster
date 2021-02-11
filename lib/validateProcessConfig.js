const fs = require('fs');
const chalk = require('chalk');
const { Logger } = require('@kard/node-logger');

const validateProcessConfig = (config) => {
  const log = new Logger('wp-builder');

  const validate = (test, msg, warn) => {
    if (test) { return; }
    if (!warn) {
      log.critical(chalk.red(`[builder configuration error] ${msg}`));
      process.exit(1);
    } else {
      log.warn(chalk.yellow(`[builder configuration warn] ${msg}`));
    }
  };

  const validateOption = (el) => typeof el !== 'object' || typeof el.id === 'string';

  const validateOptionsArr = (opts) => !opts.find((el) => !validateOption(el));

  const isInt = (x) => !Number.isNaN(x) && Number.isInteger(parseFloat(x));

  const isObject = (x) => typeof x === 'object' && !Array.isArray(x);

  // wpConfigPath: string, file, must exist,
  validate(
    typeof config.wpConfigPath === 'string',
    `wpConfigPath \n Invalid type: ${typeof config.wpConfigPath}`,
  );
  validate(
    fs.existsSync(config.wpConfigPath),
    `wpConfigPath \n file not found : ${config.wpConfigPath}`,
  );

  // onlyOption: not requiredm any type except array, must have id while object
  validate(
    !Array.isArray(config.onlyOption),
    'onlyOption \n Invalid Array type',
  );
  validate(
    validateOption(config.onlyOption),
    'onlyOption \n while it has the "object" type, must have the string "id" field',
  );

  if (!config.onlyOption) {
    // builderConfigPath: rquired while !onlyOption, string
    validate(
      typeof config.builderConfigPath === 'string',
      `builderConfigPath \n Invalid type: ${typeof config.wpConfigPath}`,
    );
    validate(
      fs.existsSync(config.builderConfigPath),
      `builderConfigPath \n file not found : ${config.wpConfigPath}`,
    );

    // eslint-disable-next-line import/no-dynamic-require, global-require
    const builderConfig = require(config.builderConfigPath);
    validate(
      typeof builderConfig === 'object',
      'builderConfigPath (file format) \n "builderConfigPath" must point to an array-containing or object-containing file',
    );
    validate(
      !Array.isArray(builderConfig) && (config.optionsField || builderConfig.options),
      'builderConfigPath (file format) \n the object-containing file must have either the "options" field or a field with which name is pointed by the "optionsField" of the process config',
    );

    const options = builderConfig[config.optionsField] || builderConfig.options || builderConfig;
    validate(
      Array.isArray(options),
      `builderConfigPath (file format) \n Invalid options type: ${typeof options}, must be Array`,
    );

    validate(
      validateOptionsArr(options),
      'builderConfigPath (file format) \n each object option must have the "id" string field',
    );
  }

  // maxThreads: args.maxThreads || builderConfig.maxThreads,
  // The max concurrent building threads to run. While empty, it'll be equivalent to
  // the CPUs/COREs available count
  validate(
    config.maxThreads,
    'maxThreads \n "maxThreads" is not set, using CPUs/COREs count as the default',
    true,
  );
  validate(
    !config.maxThreads || isInt(config.maxThreads),
    'maxThreads \n while exists, "maxThreads" must be an integer value',
  );

  // logLevel: 'info',
  // Log level to use. If absent, default value ("information") is using. Details at the link below.
  // One of: Trace, Debug, Information, Warning, Error, Critical, None, default: information
  // https://github.com/dkarmalita/kard-node-logger/blob/master/lib/Logger.js
  validate(
    config.logLevel,
    'logLevel \n "logLevel" is not set, using the default "information" level',
    true,
  );
  validate(
    !config.logLevel || typeof config.logLevel === 'string',
    'logLevel \n while exists, "logLevel" must be a string value',
  );

  // logColors: ,
  validate(
    config.logColors,
    'logColors \n "logColors" is not set, using the default values',
    true,
  );
  validate(
    !config.logColors || isObject(config.logColors),
    'logColors \n while exists, "logColors" must be an object value',
  );

  // config.logColors shape { master: 'magenta', builder: 'green', queue: 'firebrick'}
  validate(
    !config.logColors || config.logColors.master,
    'logColors \n while exists, "logColors.master" using the default values',
    true,
  );

  validate(
    !config.logColors || config.logColors.builder,
    'logColors \n while exists, "logColors.builder" using the default values',
    true,
  );

  validate(
    !config.logColors || config.logColors.queue,
    'logColors \n while exists, "logColors.queue" using the default values',
    true,
  );

  validate(
    !config.logColors || typeof config.logColors.master === 'string',
    'logColors \n while exists, "logColors.master" must be a string value',
  );

  validate(
    !config.logColors || typeof config.logColors.builder === 'string',
    'logColors \n while exists, "logColors.builder" must be a string value',
    true,
  );

  validate(
    !config.logColors || typeof config.logColors.queue === 'string',
    'logColors \n while exists, "logColors.queue" must be a string value',
    true,
  );

  // buildContext: { minify: args.minify || false },
};

module.exports = validateProcessConfig;
