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

const license = async function() {

    var answers = await inquirer.prompt(questions);

    if (answers.choice !== 'None') {
        setLicense(answers.licenseType);
        writeLicense(answers);
    }
}

function setLicense(licenseType) {

    shelljs.echo('Setting license type:' + licenseType);
    var packageJson = jsonfile.readFileSync('package.json');
    packageJson.license = licenseType;
    jsonfile.writeFileSync('package.json', packageJson);
}

async function writeLicense(answers) {

    const fs = require('fs');
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
    var fileContents = fs.readFileSync('../../templates/license/' + translatedFilename);

    const year = new Date().getFullYear() + '';
    fileContents = fileContents.replace(/<YEAR>/g, year);
    fileContents = fileContents.replace(/<COPYRIGHT HOLDER>/g, answers.copyrightHolder);

    fs.writeFileSync('LICENSE', fileContents);
}

module.exports = license;