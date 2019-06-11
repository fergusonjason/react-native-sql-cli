const shelljs = require('shelljs');
const inquirer = require('inquirer');

const questions = [
    {type: 'input', name: 'archivename', }
];
const main = async function(projectname, commanderOptions) {

    if (commanderOptions.showCommanderOptions) {
        const util = require('util');
        shelljs.echo("commander options: " + util.inspect(commanderOptions));
        return;
    }

    if (!shelljs.test('-d', projectname)) {
        shelljs.echo('You must be in the parent directory of your project (i.e. /home/yourname/myprojects) to archive.');
        return;
    }

    shelljs.echo(__dirname);

    const answers = await inquirer.prompt(buildQuestions(projectname));

    const fs = require('fs');
    const archiver = require('archiver');

    // I could support tar.gz if I wanted to
    var archive = archiver('zip', {zlib: {level: 9}});

    const filename = shelljs.pwd() + '/' + answers.archiveName + '.zip';

    const getStream = function(filename) {
        return fs.readFileSync(filename);
    }

    var output = fs.createWriteStream(filename);

    output.on('close', function() {
        shelljs.echo('Finished creating archive file ' + filename);
    });

    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            // log warning
          } else {
            // throw error
            throw err;
          }
    });

    archive.on('error', function(err) {
        throw err;
      });

    archive.pipe(output);

    shelljs.cd(projectname);

    shelljs.echo('Adding android directory');
    archive.directory('android/',true);

    shelljs.echo('Adding IOS directory');
    archive.directory('ios/', true);

    shelljs.echo('Adding test directory');
    archive.directory('__tests__/', true);

    shelljs.echo('Addign app directory');
    archive.directory('app/', true);

    try {
        shelljs.echo('Adding JSON files');
        archive.glob('*.json');
    } catch (err) {
        shelljs.echo('Unable to add JSON files: ' + err.message);
    }

    shelljs.echo('Adding root directory .js files');
    archive.glob('*.js');

    shelljs.echo('Adding root directory .lock files');
    archive.glob('*.lock');

    if (shelljs.test('-f','./.gitignore')) {
        shelljs.echo('Adding .gitignore');
        archive.append(getStream('./.gitignore'), {name: '.gitignore'});
    }

    if (shelljs.test('-f','./LICENSE')) {
        shelljs.echo('Adding license');
        archive.append(fs.createReadStream('./LICENSE'), {name: 'LICENSE'});
    }

    output.on('close', function() {
        shelljs.echo('Completed writing archive (' + archive.pointer() + ')');
    });

}

function buildQuestions(projectname) {

    const questions = [
        {type: 'input', name: 'archiveName', message: 'archive name', default: projectname, validate: function(input) { 
            return input !== '';
        }}
    ];

    return questions;
}

module.exports = main;