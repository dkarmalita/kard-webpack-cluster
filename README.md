# webpack-cluster

## How to add to a project

```sh
npm i -S @kard/webpack-cluster
npx install-peerdeps --dev @kard/webpack-cluster
```

## Usage pattern

```js
const build = require('@kard/wp-builder')

build({
  wpConfigPath, 
  // String. Must exist.
  // It points to a webpack config file to use

  onlyOption, 
  // Any type except array. Must have id field while is an object.
  // The only option to build. If defined, only it will be builded.

  builderConfigPath, 
  // String. Must be defined while !onlyOptions 
  // It points to a JS or JSON config file that contains an array of the build option or an object which contains this array

  optionsField, 
  // String. Must be defined while !onlyOptions and !builderConfig.options
  // While the configuration file contains an object, here is the name of the field within the build options array

  maxThreads, 
  // Integer. Optional.
  // The max concurrent building threads to run. While empty, it'll be equivalent to the CPUs/COREs available count

  logLevel, 
  // String. Optional.
  // Log level to use. If absent, default value ("information") is using.
  // One of: Trace, Debug, Information, Warning, Error, Critical, None, 
  // default: information
  // Details: https://github.com/dkarmalita/kard-node-logger/blob/master/lib/Logger.js

  logColors, 
  // Object of shape. Optional.
  // Log colors scheme.
  // Example: { master: 'magenta', builder: 'green', queue: 'firebrick'}

  buildContext, 
  // Any type. Optional.
  // Will be passsed as the second argument to webpack.config.js function.
  // Example: { minify: true },

})
```
