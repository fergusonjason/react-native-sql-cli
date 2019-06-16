const shelljs = require('shelljs');
const inquirer = require('inquirer');

// const questions = [
//     {type: 'input', name: 'archivename', }
// ];
const main = async function(globalOptions) {
//const main = async function(projectname, commanderOptions) {

    // if (commanderOptions.debug) {
    //     const util = require('util');
    //     shelljs.echo("commander options: " + util.inspect(commanderOptions));
    //     return;
    // }

    // if (!globalOptions.projectName) {
    //     shelljs.echo('You must provide a project name!');
    //     return;
    // }

    if (!shelljs.test('-d', globalOptions.projectName)) {
        shelljs.echo('You must be in the parent directory of your project (i.e. /home/yourname/myprojects) to archive.');
        return;
    }

    // shelljs.echo(__dirname);

    const answers = await inquirer.prompt(buildQuestions(globalOptions.projectName));

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
            shelljs.echo("WARNING: received error code ENOENT");
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

    shelljs.cd(globalOptions.projectName);
    globalOptions.currentDirectory = shelljs.pwd();

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
        try {
            archive.append(getStream('./.gitignore'), {name: '.gitignore'});
        } catch (err) {
            shelljs.echo('Unable to add .gitignore to archive: ' + err.message);
        }
    }

    if (shelljs.test('-f','./LICENSE')) {
        shelljs.echo('Adding license');
        try {
            archive.append(getStream('./LICENSE'), {name: 'LICENSE'});
        } catch (err) {
            shelljs.echo('Unable to add license: ' + err.message);
        }
    }

    archive.finalize();
    //output.close();

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