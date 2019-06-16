const shelljs = require('shelljs');

const installPackage = function(packageName) {
    if (Array.isArray(packageName)) {
        packageName.forEach(ip => {
            shelljs.echo('Installing package ' + ip);
            shelljs.exec('yarn add ' + ip + ' --silent');
        })
    } else {
        shelljs.echo('Installing package ' + packageName);
        shelljs.exec('yarn add ' + packageName + ' --silent');
    }
}

const installDevPackage = function(packageName) {
    if (Array.isArray(packageName)) {
        packageName.forEach(ip => {
            shelljs.echo('Installing package ' + ip);
            shelljs.exec('yarn add ' + ip + ' --dev --silent');
        })
    } else {
        shelljs.echo('Installing package ' + packageName);
        shelljs.exec('yarn add ' + packageName + ' --dev --silent');
    }

}

module.exports = {
    installPackage,
    installDevPackage
}