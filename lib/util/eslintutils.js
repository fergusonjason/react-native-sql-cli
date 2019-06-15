const inquirer = require('inquirer');
const shelljs = require('shelljs');
const jbuilder = require('jbuilder');

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
    {type: 'list', name: 'eslintEcmaVersion', message: 'Which ECMAScript version do you wish to support: ', choices: ecmaVersions},
    {type: 'list', name: 'esLintType', message: 'Which lint style do you want?', when: function(response) {return response.esLint;}, choices: lintTypes}

];

// has to return the JSON object, even if we've already written the file
const configureEslint = async function(parentAnswers) {

    var answers = inquirer.prompt(eslintQuestions);

    var eslintJson = {};
    eslintJson.plugins = {};
    eslintJson.parserOptions = {};
    eslintJson.env = {};
    eslintJson.parserOptions.ecmaFeatures = {};
    
    shelljs.echo('Configuring ECMAScript to ' + answers.esLintType);
    configureVersion(eslintJson, parentAnswers);
    
    shelljs.echo("Configuring react and react-native eslint plugins");
    configurePlugins(eslintJson);

    if (parentAnswers.configureBabel) {
        shelljs.echo("Configuring eslint to use babel parser");
        configureParser(eslintJson);
    }

    if (answers.esLintType !== 'none') {
        configureExtends(eslintJson, answers.esLintType);
    }

    configureJsx(eslintJson);
}

function configurePlugins(eslintJson) {
    eslintJson.plugins = ["react","react-native"];
}

function configureVersion(eslintJson, ecmaVersion) {

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
    eslintJson.extends = eslintStyle;
}

function configureParser(eslintJson) {
    eslintJson.parser = 'babel-eslint';
}



function configureJsx(eslintJson) {
    eslintJson.ecmaFeatures.jsx = true;
}

module.exports = configureEslint;