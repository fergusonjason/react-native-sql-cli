const shelljs = require('shelljs');
const util = require('util');

// decorator to build a global options object from input and pass it to the called function so I don't have
// to do it repeatedly

const wrappedFunction = async function(projectName, options, fn) {

    if (options.debug) {
        shelljs.echo("commander options: " + util.inspect(commanderOptions));
        return;
    }

    var globalOptions = {};
    globalOptions.projectName = projectName;
    globalOptions.parentDirectory = shelljs.pwd();
    globalOptions.projectDirectory = shelljs.pwd() + '/' + projectName;
    globalOptions.currentDirectory = shelljs.pwd();

    globalOptions.dryRun = options.dryRun;

    globalOptions.command = options._name;

    // TODO: If there's a way to get command specific option values in a way that doesn't check the command name, do it
    if (globalOptions.command === 'create') {
        globalOptions.commandOptions = {};
        if (options.gitConfig) {
            globalOptions.commandOptions.gitConfig = options.gitConfig;
        }

        if (options.sqliteConfig) {
            globalOptions.commandOptions.sqliteConfig = options.sqliteConfig;
        }

        if (options.lint) {
            globalOptions.commandOptions.lint = options.lint;
        }

        if (options.babel) {
            globalOptions.commandOptions.babel = options.babel;
        }

        if (options.navigation) {
            globalOptions.commandOptions.navigation = options.navigation;
        }

        if (options.redux) {
            globalOptions.commandOptions.redux = options.redux;
        }
    }

    if (globalOptions.command === 'archive') {
        // currently no special options for this command
    }

    if (globalOptions.command === 'nuke') {

        globalOptions.commandOptions = {};

        if (options.githubNuke) {
            globalOptions.commandOptions.githubNuke = options.githubNuke;
        }

        if (options.fileNuke) {
            globalOptions.commandOptions.fileNuke = options.fileNuke;
        }

    }
    await fn(globalOptions);
}

module.exports = wrappedFunction;