#!/usr/bin/env node

const program = require('commander');

const ArgV = require('./ArgV');
const envsub = require('../envsub');
const version = require('../package.json').version;

let addEnvironmentVariable = (envVar, envVarList) => {
  envVarList.push(envVar);
  return [...new Set(envVarList)]; // unique
};

program
  .version(version)
  .usage('[options] <templateFile> [outputFile]')
  .option('-d, --diff', 'show diff between template file and output file')
  .option('-e, --env <name>[=value]', 'environment variable to substitute .. if none specified then substitute all .. this flag can be repeated', addEnvironmentVariable, [])
  .option('-p, --protect', 'protect non-existent environment variables (that would otherwise be substituted) .. do not substitute them with an empty string')
  .option('-s, --syntax <syntax>', 'substitution syntax, one of .. dollar-basic $MYVAR .. dollar-curly ${MYVAR} .. dollar-both $MYVAR and ${MYVAR} .. handlebars {{MYVAR}} .. default ${MYVAR}', /^(dollar-basic|dollar-curly|dollar-both|handlebars|default)$/i, 'default');








/* istanbul ignore next */
program.on('--help', () => {
  console.log('  Examples:');
  console.log('');
  console.log('    Typical usage');
  console.log('    -------------');
  console.log('    $ envsub templateFile outputFile');
  console.log('    $ envsub --diff --env MYVAR1 --env MYVAR2=foo --protect --syntax handlebars templateFile outputFile');
  console.log('');
  console.log('    Overwrite your templateFile');
  console.log('    ---------------------------');
  console.log('    Useful inside a docker container after you have copied your templateFile into the container');
  console.log('    $ envsub templateFile');
  console.log('    $ envsub --env MYVAR1 --env MYVAR2=foo templateFile');
  console.log('');
});

program.parse(ArgV.get());

let templateFile = (program.args.length > 0) ? program.args[0] : null;
let outputFile = (program.args.length > 1) ? program.args[1] : null;
let options = {
  diff: !!program.diff,
  protect: !!program.protect,
  syntax: program.syntax.toLowerCase()
};

if (program.env.length > 0) {
  let envs = [];
  program.env.forEach((env) => {
    let nvp = env.split(/=(.+)/);
    if (nvp.length > 1) {
      envs.push({name: nvp[0], value: nvp[1]});
    } else {
      envs.push({name: nvp[0]});
    }
  });
  options.envs = envs;
}

let obj = {
  templateFile,
  outputFile,
  options,
  cli: true
};

module.exports = obj;

envsub(obj);
