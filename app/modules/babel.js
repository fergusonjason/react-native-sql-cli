const shelljs = require('shelljs');
const yarnUtils = require('./yarn');

const main = function() {

    var babelJson = {};

    installBabel();
    configureBabelPresets(babelJson);
    writeBabelConfig(babelJson);
}

function installBabel() {

    shelljs.echo('Installing babel-core');
    shelljs.exec('yarn add @babel/core@* --dev --silent');

    shelljs.echo('Installing metro-react-native-babel-preset');
    shelljs.exec('yarn add metro-react-native-babel-preset --dev --silent');

    shelljs.echo('Installing babel-preset-env');
    shelljs.exec('yarn add babel-preset-env --dev --silent');

}

function configureBabelPresets(babelJson) {

    babelJson.presets = ['module:metro-react-native-babel-preset','@babel/preset-env'];

}

function writeBabelConfig(babelJson) {

    const jsonfile = require('jsonfile');
    jsonfile.writeFileSync('.babelrc', babelJson, {spaces: 4});
}

module.exports = main;