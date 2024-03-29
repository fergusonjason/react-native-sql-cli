const inquirer = require('inquirer');
const shelljs = require('shelljs');
const yarnUtils = require('./yarn');

const lintTypes = [
    {name: 'none'},
    {name: 'react/react-native'},
    {name: 'eslint-recommended'},
    {name: 'standard'},
    {name: 'google'},
    {name: 'airbnb'}
];

const ecmaVersions = [
    {name: 'es5'},
    {name: 'es6 (ECMAScript 2015)'},
    {name: 'es7 (ECMAScript 2016)'},
    {name: 'es8 (ECMAScript 2017)'},
    {name: 'es9 (ECMAScript 2018)'}
];

const eslintQuestions = [
    {type: 'list', name: 'eslintEcmaVersion', message: 'ECMAScript version: ', choices: ecmaVersions},
    {type: 'list', name: 'esLintType', message: 'Lint style: ', choices: lintTypes}
];

// has to return the JSON object, even if we've already written the file
const configureEslint = async function(parentAnswers) {

    var answers = await inquirer.prompt(eslintQuestions);

    var eslintJson = {};
    eslintJson.ecmaFeatures = {};
    eslintJson.plugins = {};
    eslintJson.parserOptions = {};
    eslintJson.env = {};
    eslintJson.parserOptions.ecmaFeatures = {};
    eslintJson.extends = [];
    
    if (answers.esLintType !== 'none') {
        shelljs.echo('Installing Eslint preset: ' + answers.esLintType);
        installEsLintAndStyles(answers.esLintType);
    }

    shelljs.echo('Configuring ECMAScript to ' + answers.eslintEcmaVersion);
    configureEcmaVersion(eslintJson, answers.eslintEcmaVersion);
    
    shelljs.echo('Configuring react and react-native eslint plugins');
    configurePlugins(eslintJson);

    if (parentAnswers.configureBabel) {
        shelljs.echo('Configuring eslint to use babel parser');
        configureParser(eslintJson);
    }

    if (answers.esLintType !== 'none') {
        configureExtends(eslintJson, answers.esLintType);
    }

    configureJsx(eslintJson);

    writeEslint(eslintJson);
}

function installEsLintAndStyles(type) {

    yarnUtils.installDevPackage('eslint');

    if (type === 'none') {
        shelljs.echo('Not installing eslint type');
        return;
    }

    shelljs.echo('Attempting to install eslint for type ' + type);

    shelljs.exec('yarn add eslint-plugin-import --peer --silent');
    shelljs.exec('yarn add eslint-plugin-jsx-ally --peer --silent');
    shelljs.exec('yarn add eslint-plugin-react --peer --silent');

    var installPackage;
    switch (type) {
        case 'eslint-recommended':
            installPackage = 'eslint-config-recommended';
            break;
        case 'react/react-native':
            installPackage = ['eslint-plugin-react','eslint-plugin-react-native'];
            break;
        case 'standard':
            installPackage = 'eslint-config-standard';
            break;
        case 'google':
            installPackage = 'eslint-config-google';
            break;
        case 'airbnb':
            installPackage = 'eslint-config-airbnb';
            break;
    }

    if (installPackage) {
        yarnUtils.installDevPackage(installPackage);
    }

}

function configurePlugins(eslintJson) {
    eslintJson.plugins = ['react','react-native'];
}

function configureEcmaVersion(eslintJson, ecmaVersion) {

    eslintJson.env.es6 = true;

    switch (ecmaVersion) {
    case 'es5':
        break;
    case 'es6 (ECMAScript 2015)':
        eslintJson.parserOptions.ecmaVersion = 6;
        break;
    case 'es7 (ECMAScript 2016)':
        eslintJson.parserOptions.ecmaVersion = 7;
        break;
    case 'es8 (ECMAScript 2017)':
        eslintJson.parserOptions.ecmaVersion = 8;
        break;
    case 'es9 (ECMAScript 2018)':
        eslintJson.parserOptions.ecmaVersion = 9;
        break;
    }

}

function configureExtends(eslintJson, eslintStyle) {
    shelljs.echo('Configuring eslint style: ' + eslintStyle);
    eslintJson.extends.push(eslintStyle);
}

function configureParser(eslintJson) {
    eslintJson.parser = 'babel-eslint';
}



function configureJsx(eslintJson) {
    eslintJson.ecmaFeatures.jsx = true;
}


function writeEslint(eslintJson) {
    const jsonfile = require('jsonfile');
    const file = '.eslintrc';
    jsonfile.writeFileSync(file, eslintJson, {spaces: 4});
}

module.exports = configureEslint;