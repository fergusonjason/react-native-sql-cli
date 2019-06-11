
const shelljs = require('shelljs');
const inquirer = require('inquirer');

const main = async function(projectName, commanderOptions) {

    if (commanderOptions.showCommanderOptions) {
        const util = require('util');
        shelljs.echo("commander options: " + util.inspect(commanderOptions));
    }

    const questions = [
        {type: 'confirm', name: 'confirmNuke', message: 'Are you sure? '},
        {type: 'input', name: 'username', message: 'Username: '}
    ];

    shelljs.echo("You will NOT be able to undo this. If you meant to backup, run rnsc archive first");
    var answers = await inquirer.prompt(questions);

    if (answers.confirmNuke) {

        if (commanderOptions.githubNuke) {
            shelljs.echo('Deleting GitHub repository ' + projectName);

            try {
                const GitHub = require('github-api');
                const gh = new GitHub({username: answers.username, password: answers.password});
                const remoteRepo = gh.getRepo(answers.username, projectName);
                await remoteRepo.deleteRepo();
            } catch (err) {
                shelljs.echo("Unable to delete repo: " + err.message);
            }
        }

    
        if (commanderOptions.fileNuke) {
         
            shelljs.echo('Deleting project directory');
            
            const currentPath = shelljs.pwd();
            if (currentPath.endsWith(projectName)) {
                shelljs.cd('..');
            }
            
            shelljs.exec('rm -rf ' + projectName); 
        }
    }


    if (commanderOptions.fileNuke) {

    }

}

function buildQuestions(commanderOptions) {

    var questions = [];
    questions.push({type: 'confirm', name: 'confirmNuke', message: 'Are you sure? '});
    
    if (commanderOptions.githubNuke) {
        questions.push({type: 'input', name: 'username', message: 'Username: '});
        questions.push({type: 'password', name: 'password', message: 'Password: '});
    }
    return questions;

}

function authenticate(username, password) {

    const GitHub = require("github-api");

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