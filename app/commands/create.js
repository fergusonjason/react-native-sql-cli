const shelljs = require('shelljs');
const inquirer = require('inquirer');
const insertLine = require("insert-line");
const util = require('util');
const yarnUtils = require('../modules/yarn');

const main = async function(projectName, commanderOptions) {

    if (commanderOptions.showCommanderOptions || commanderOptions.debug) {
        shelljs.echo("commander options: " + util.inspect(commanderOptions));
        return;
    }

    if (!projectName) {
        shelljs.echo('You must provide the name of the project to create');
        return;
    }
    var config = {};
    config.action = 'create';
    config.projectName = projectName;
    
    var basePath = shelljs.pwd() + "/" + projectName;

    if (shelljs.test("-e",basePath)) {
        shelljs.echo("Directory is not empty! Exiting!");
        return;
    }
    try {
        precheck(commanderOptions);
    } catch (err) {
        shelljs.echo("Precheck failed: " + err.message);
    }

    const questions = buildQuestions(projectName, commanderOptions);
    const answers = await inquirer.prompt(questions);

    shelljs.echo("Creating project in " + basePath);

    createReactNativeProject(projectName);

    installReactNativeSqliteStorage();

    if (commanderOptions.lint) {
        if (answers.configureEsLint) {
            const eslint = require('../modules/eslint');
            await eslint(answers);
        }
    }

    if (commanderOptions.babel) {
        if (answers.configureBabel) {
            const babel = require('../modules/babel');
            babel();
        }
    }

    if (commanderOptions.navigation) {
        if (answers.reactNavigation) {
            installReactNavigation();
        }
    }

    if (commanderOptions.redux) {
        if (answers.redux) {
            installRedux();
        }

        if (answers.reduxThunk) {
            installReduxThunk();
        }
    }

    // TODO: allow non-MIT licenses
    setLicense();
    modifyRnssForIos();
    modifyRnssForAndroid(basePath, projectName);

    createAppDir();

    if (commanderOptions.gitConfig) {
        var options = {};
        options.projectname = projectName;
        options.description = answers.repoDesc;
        options.private = answers.repoType;
        options.username = answers.username;
        options.password = answers.password;

        const user = authenticate(answers.username, answers.password);

        // TODO: if create fails, we need to bail on everything after this point and roll back if possible
        var repo;
        try {
            repo = await user.createRepo({name:answers.repoName, description: answers.repoDesc, private: answers.repoType});
            if (commanderOptions.showCommanderOptions) {
                const util = require('util');
                shelljs.echo("commander options: " + util.inspect(repo));
            }
        } catch (err) {
            shelljs.echo("Unable to create repository (check if repository already exists): " + err.message);
        }

        if (!shelljs.pwd() === basePath) {
            shelljs.cd(basePath);
        }

        shelljs.echo('Initializing git repository');
        shelljs.exec('git init');

        shelljs.echo('Creating .gitignore');
        shelljs.exec('echo node_modules >> .gitignore');

        const remoteUrl = repo.data.clone_url;

        // TODO: reenable ability to use git/SSH

        // var remoteUrl;
        // switch (answers.repoProtocol) {
        //     case "git":
        //         remoteUrl = repo.data.git_url;
        //         break;
        //     case "git (SSH)":
        //         remoteUrl = repo.data.ssh_url;
        //         break;
        //     case "https":
        //         remoteUrl = repo.data.clone_url;
        //         break;
        // }
        if (remoteUrl) {
            shelljs.echo('WARNING: Using https for initial upload (FIXME)');
            shelljs.echo('Adding remote ' + remoteUrl);
            shelljs.exec('git remote add origin ' + remoteUrl);
            shelljs.exec('git add .');
            shelljs.exec('git commit -m "First commit"');
            shelljs.exec('git push origin master');
        }
    }
}

function precheck(commanderOptions) {

    if (shelljs == null || typeof shelljs === "undefined") {
        shelljs.echo("Error importing shelljs");
        throw new Error("Error importing shelljs");
    } 

    if (inquirer == null || typeof inquirer === "undefined") {
        shelljs.echo("Error importing inquirer");
        throw new Error("Error importing inquirer");

    }

    if (!shelljs.which("yarn")) {
        shelljs.echo("Sorry, you must have yarn installed");
        throw new Error("Yarn not found");
    }

    
    if (!shelljs.which("react-native")) {
        shelljs.echo("react-native-cli is not installed");
        throw new Error("react-native-cli not found");
    }
    
    if (!commanderOptions.noGit) {
        if (!shelljs.which("git")) {
            shelljs.echo("Sorry, you must have git installed");
            throw new Error("git not found");
        }
    }
    if (!commanderOptions.noSqliteConfig) {
        if (!shelljs.which("sqlite")) {
            shelljs.echo("Sorry, SQLite is not found");
            throw new Error("SQLite not found");
        }
    }

    // TODO: check for existence of user .ssh directory to know whether to allow git ssh

    shelljs.echo("Precheck complete");

}

function buildQuestions(projectName, commanderOptions) {
    const questions = [];
    if (commanderOptions.lint) {
        questions.push({type: 'confirm', name: 'configureEsLint', message:'Do you wish to install ESlint', default: true});
    }

    if (commanderOptions.babel) {
        questions.push({type: 'confirm', name: 'configureBabel', message: 'Do you wish to install Babel and the RN preset?', default: true});
    }

    if (commanderOptions.navigation) {
        questions.push({type: 'confirm', name: 'reactNavigation', message: 'Do you wish to install react-navigation', default: true});
    }

    if (commanderOptions.redux) {
        questions.push({type: 'confirm', name: 'redux', message: 'Do you wish to install react-redux?', default: true});
        questions.push({type: 'confirm', name: 'reduxThunk', message: 'Do you wish to install redux-thunk?', when: function(response) {return response.redux;}, default: true});
    }
    
    if (commanderOptions.gitConfig) {
        const repoTypes = [
            {name: "public"},
            {name: 'private'}
        ];

        const protocolTypes = [
            {name: "git"},
            {name: 'git (SSH)'},
            {name: "https"}
        ];

        questions.push({type: 'input', name: 'repoName', message: 'Repository name (' + projectName + '):', default: projectName});
        questions.push({type: 'list', name: 'repoType', message: 'Repository type: ', choices: repoTypes});
        questions.push({type: 'input', name: 'repoDesc', message: 'Github project description: '});
        questions.push({type: 'list', name: 'repoProtocol', message: 'Github protocol choice: ', choices: protocolTypes})
        questions.push({type: 'input', name: 'username', message: 'Username: ', validate: function(input) { 
            return input !== '';
        }});
        questions.push({type: 'password', name: 'password', message: 'Password: ', validate: function(input) {
            return input !== '';
        }});
    }

    if (!commanderOptions.noSqliteConfig) {

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

function createReactNativeProject(projectDir) {
    shelljs.echo("Initializing react-native project " + projectDir + " (this may take a bit).");
    shelljs.exec("react-native init " + projectDir + " > /dev/null 2>&1");
    shelljs.cd(projectDir);
    shelljs.echo("Project intialized");
}

function installReactNativeSqliteStorage() {
    shelljs.echo("Installing react-native-sqlite-storage");
    shelljs.exec("yarn add react-native-sqlite-storage --silent");
    shelljs.echo("Installed react-native-sql-storage");

}

function installReactNavigation() {
    shelljs.echo("Installing react-navigation");
    shelljs.exec("yarn add react-native-screens react-native-gesture-handler react-navigation --silent");
}

function installRedux() {
    shelljs.echo("Installing react-redux");
    shelljs.exec("yarn add redux react-redux --silent");
}

function installReduxThunk() {
    shelljs.echo("Installing redux-thunk");
    shelljs.exec("yarn add redux-thunk --silent");
}

function setLicense() {
    insertLine("./package.json").contentSync("  \"license\":\"MIT\",").at(5);
}

function modifyRnssForIos(basePath) {

}

function modifyRnssForAndroid(basePath, projectname) {

    if (shelljs.test('-e', basePath + '/android')) {
        shelljs.echo("Unable to find project android directory. Current path: " + shelljs.pwd());
        return;
    }

    shelljs.echo("changing directory to " + basePath + "/android");
    shelljs.cd(basePath + "/android");

    shelljs.echo("Modifying settings.gradle");
    insertLine("./settings.gradle").appendSync("include ':react-native-sqlite-storage'");
    insertLine("./settings.gradle").appendSync("project(':react-native-sqlite-storage').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-sqlite-storage/src/android')");
    
    shelljs.cd("app");
    shelljs.echo("Modifying build.gradle");
    insertLine("./build.gradle").contentSync("    implementation project(':react-native-sqlite-storage')").at(144);

    shelljs.cd("src/main/java/com/" + projectname + "/");
    shelljs.echo("Modifying MainApplication.java");
    insertLine("./MainApplication.java").contentSync("            new SQLitePluginPackage(),   // register SQLite Plugin here").at(25);
}    

function createAppDir() {
    shelljs.mkdir('app');
    shelljs.cd('app');
    shelljs.exec('echo // file template >> index.js');
    shelljs.cd('..');
}

module.exports = main;