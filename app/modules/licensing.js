const inquirer = require('inquirer');
const jsonfile = require('jsonfile');
const shelljs = require('shelljs');

const licenseTypes = [
    {name: 'MIT'},
    {name: 'ISC'},
    {name: 'Apache 2.0'},
    {name: 'None'}
];

const questions = [
    {type: 'input', name: 'copyrightHolder', message: 'Name of copyright holder: '},
    {type: 'list', name: 'licenseType', message: 'License type: ', choices: licenseTypes}
]

const license = async function(globalOptions) {

    var answers = await inquirer.prompt(questions);

    if (answers.choice !== 'None') {
        setLicenseInPackageJson(answers.licenseType);
        await writeLicense(answers, globalOptions);
    }
}

function setLicenseInPackageJson(licenseType) {

    shelljs.echo('Setting license type:' + licenseType);
    var packageJson = jsonfile.readFileSync('package.json');
    packageJson.license = licenseType;
    jsonfile.writeFileSync('package.json', packageJson);
}

async function writeLicense(answers, globalOptions) {

    var path = require('path');
    var appDir = path.dirname(require.main.filename);

    const fs = require('fs');

    if (shelljs.pwd() !== globalOptions.projectDirectory) {
        shelljs.cd(globalOptions.projectDirectory);
    }

    var translatedFilename = "";
    switch(answers.licenseType) {
        case "MIT":
            translatedFilename = "mit.txt";
            break;
        case "ISC":
            translatedFilename = "isc.txt";
        case "Apache 2.0":
            translatedFilename = 'apache2.txt';
    }

    var fileContents;
    try {
        fileContents = fs.readFileSync(appDir + '/templates/license/' + translatedFilename, 'utf8');
        const year = new Date().getFullYear() + '';
        fileContents = fileContents.replace(/<YEAR>/g, year);
        fileContents = fileContents.replace(/<COPYRIGHT HOLDER>/g, answers.copyrightHolder);
    } catch (err) {
        shelljs.echo('Unable to read file for license: ' + translatedFilename);
    }

    try {
        fs.writeFileSync('LICENSE', fileContents);
    } catch (err) {
        shelljs.echo('Unable to write file for license: ' + translatedFilename);
    }
}

module.exports = license;