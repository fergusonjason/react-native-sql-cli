# react-native-sqlite-cli
CLI To Quickly Create React-Native Projects With SQLite

# WARNING
Many of the functions may work on IOS, but I can't guarantee it. If you know what changes need to be made on IOS and want to submit a pull request, please feel free.

# Purpose
This is a project I created because I was annoyed at the work to create a React Native project with SQLite 
functionality enabled. If you want to help out, submit fixes, etc, feel free.

# Usage

When the project is created, npm will use either default values or values you have set via the `npm config set <key> <value>` command. You
may wish to customize your name, email, and license before using this tool:

```console
yarn config set init-author-name "John Smith"
yarn config set init-author-email "smithjohn999@gmail.com"
yarn config set init-license "MIT"
```

(I'm currently using yarn as the required package manager, I may make npm an option later).

There are currently three main commands: 

- create
- nuke
- archive

# Creating a project

To create a project, use the following command:

```console
rnsc create <projectname>
```

You will be asked a series of questions needed in order to create the project, create a github repository, etc.

Options:

(To Be Added)

# Nuking a project

To delete a project and destroy the github repository, use the following command:

```console
rnsc nuke <projectname>
```

YOU WILL NOT BE ABLE TO RECOVER YOUR PROJECT AFTER YOU NUKE IT, EITHER LOCALLY OR VIA GITHUB. I may add an option
to archive the github repository instead of deleting it.

Options:

(To Be Added)

# Archiving a project

To create a zip archive of the project, use the following command:

```console
rnsc archive <projectname>
```

This will NOT back up the node_modules directory, so you will have to run `npm install` if you restore the archive.

Options:

(To Be Added)

# Roadmap

0.4.0 - (Current) Create, Nuke, and Archive execute. Create needs to be tested.
0.5.0 - Bugfixes and file templates
0.6.0 - Add a database init command to create a basic SQLite database

Planned but not scheduled: 

- select and download license
- Use file templates instead of trying to modify certain files in-place
- Support other repositories than GitHub
- Code cleanup (javascript string templates, etc)
- Suggestions?
