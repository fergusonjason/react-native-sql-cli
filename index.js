#! /usr/bin/env node

// React-Native SQLite CLI (second version)
const commander = require('commander');
const shelljs = require('shelljs');

const package = require('./package.json');

const program = new commander.Command();

program.version(package.version, '-v, --version');

program
    .command('create [projectname]')
    .option('-G, --no-git-config')
    .option('-S, --no-sqlite-config')
    .option('-L, --no-lint')
    .option('-B, --no-babel')
    .option('-N, --no-navigation')
    .option('-R, --no-redux')
    .option('--debug','show debug information and exit')
    .action(function(projectName, options) {
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
    .action(function(projectname, options) {
        const archive = require('./app/commands/archive');
        archive(projectname, options);
    });

program.parse(process.argv);