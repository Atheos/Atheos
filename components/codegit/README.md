#CodeGit

Git integration for Atheos

##Requirements
- Git version: ≥1.7.2
- Either one of the following for clone, push and pull
  - Expect (Shell) (`sudo apt-get install expect` or [http://expect.sourceforge.net/](http://expect.sourceforge.net/))
  - pexpect (Python) (`pip install pexpect`, [More details](https://github.com/pexpect/pexpect))

##Installation

- Download the zip file and unzip it to your plugin folder.
- Change if necessary the config in `config.php`, f.e. if you use pexpect

###Lock Git User to Login User
By default, the username for the commit is the same as the login to Codiad. However, codegit does let the user override the username and commit as a different name. 

If you wish to prevent the user overriding the username, forcing the name for all commits to be identical to the Codiad login, update the settings file `data/config/git.settings.php` to have the json value `lockuser` to `true`. For example, contents:

````php
<?php/*|{"lockuser":"true"}|*/?>
```` 

###Suppress diff on commit

For large changes it may be better to suppress a further diff on commit. Just activate the option in the settings.

## Contributing

Contributions are always welcome.  

####Formatting
- Indentation: 4 Spaces