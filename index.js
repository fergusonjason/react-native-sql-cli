#! /usr/bin/env node

// React-Native SQLite CLI (second version)
const commander = require('commander');
const shelljs = require('shelljs');

const package = require('./package.json');

const program = new commander.Command();

program.version(package.version, '-v, --version');

program
    .command('create [projectname]')
    .option('-L, --no-lint')
    .option('-B, --no-babel')
    .option('--no-license')
    .option('-N, --no-navigation')
    .option('-S, --no-sqlite-config')
    .option('-R, --no-redux')
    .option('-G, --no-git-config')
    .option('--debug','show debug information and exit')
    .action(function(projectName, options) {
        if (projectName == '' || projectName == null || typeof projectName === 'undefined') {
            shelljs.echo('You must provide a project name!');
            return;
        }
        
        const create = require('./app/commands/create');
        create(projectName, options);
    });

program
    .command('nuke [projectname]')
    .option('--debug', 'show debug information and exit')
    .option('-G, --no-github-nuke')
    .option('-F, --no-file-nuke')
    .action(function(projectname, options) {
        const nuke = require('./app/commands/nuke');
        nuke(projectname, options);
    });

program
    .command('archive [projectname]')
    .option('--debug', 'show debug information and exit')
    .action(function(projectName, options) {
        if (projectName == '' || projectName == null || typeof projectName === 'undefined') {
            shelljs.echo('You must provide a project name!');
            return;
        }
        const archive = require('./app/commands/archive');
        const commandWrapper = require('./app/util/commandDecorator');
        commandWrapper(projectName, options, archive);
        //archive(projectname, options);
    });

program.parse(process.argv);