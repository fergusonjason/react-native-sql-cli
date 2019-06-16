
const shelljs = require('shelljs');
const inquirer = require('inquirer');

const main = async function(globalOptions) {
//const main = async function(projectName, commanderOptions) {

    // if (commanderOptions.debug) {
    //     const util = require('util');
    //     shelljs.echo("commander options: " + util.inspect(commanderOptions));
    //     return;
    // }

    // const questions = [
    //     {type: 'confirm', name: 'confirmNuke', message: 'Are you sure? '},
    //     {type: 'input', name: 'username', message: 'Username: '}
    // ];

    shelljs.echo('You will NOT be able to undo this. If you meant to backup, run rnsc archive first');
    var answers = await inquirer.prompt(buildQuestions(globalOptions));

    if (answers.confirmNuke) {

        if (globalOptions.commandOptions.githubNuke) {
            shelljs.echo('Deleting GitHub repository ' + globalOptions.projectName);

            try {
                const GitHub = require('github-api');
                const gh = new GitHub({username: answers.username, password: answers.password});
                const remoteRepo = gh.getRepo(answers.username, globalOptions.projectName);
                await remoteRepo.deleteRepo();
            } catch (err) {
                shelljs.echo('Unable to delete repo: ' + err.message);
            }
        }

    
        if (globalOptions.commandOptions.fileNuke) {
         
            shelljs.echo('Deleting project directory');
            
            const currentPath = shelljs.pwd();
            if (currentPath.endsWith(globalOptions.projectName)) {
                shelljs.cd('..');
            }
            
            shelljs.exec('rm -rf ' + globalOptions.projectName); 
        }
    }

}

function buildQuestions(globalOptions) {

    var questions = [];
    questions.push({type: 'confirm', name: 'confirmNuke', message: 'Are you sure? '});
    
    if (globalOptions.commandOptions.githubNuke) {
        questions.push({type: 'input', name: 'username', message: 'Username: '});
        questions.push({type: 'password', name: 'password', message: 'Password: '});
    }
    return questions;

}

function authenticate(username, password) {

    const GitHub = require('github-api');

    // create unauthenticated client
    const auth = new GitHub(
        {
            username: username,
            password: password
        }
    );

    // get authenticated user based on unathenticated client (not a promise)
    const user = auth.getUser();

    return user;
}

module.exports = main;