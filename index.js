#! /usr/bin/env node

// React-Native SQLite CLI (second version)
const commander = require('commander');
const shelljs = require('shelljs');

const package = require('./package.json');

const program = new commander.Command();

program.version(package.version, '-v, --version');

program
    .command('create <projectname>')
    // TODO: change this to --debug
    .option('-C, --show-commander-options')
    .option('-G, --no-git-config')
    .option('-S, --no-sqlite-config')
    .option('-L, --no-lint')
    .option('-B, --no-babel')
    .option('-N, --no-navigation')
    .option('-R, --no-redux')
    .action(function(projectName, options) {
        const create = require('./lib/create');
        create(projectName, options);
    });

program
    .command('nuke <projectname>')
    // TODO: change this to --debug
    .option('-C, --show-commander-options')
    .option('-G, --no-github-nuke')
    .option('-F, --no-file-nuke')
    .action(function(projectname, options) {
        const nuke = require('./lib/nuke');
        nuke(projectname, options);
    });

program
    .command('archive <projectname>')
    .option('-C, --show-commander-options')
    .action(function(projectname, options) {
        const archive = require('./lib/archive');
        archive(projectname, options);
    });

program.parse(process.argv);