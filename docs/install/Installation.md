### Tutorials

- [Quick Installation on Ubuntu](https://github.com/Codiad/Codiad/wiki/Quick-install-on-Ubuntu)
- [Quick Installation on CentOS](https://github.com/Codiad/Codiad/wiki/Quick-install-on-CentOS)
- [[Quick installation using Docker]]

### General Installation Guide

To install simply place the contents of the system in a web accessible
folder.

Note: _Currently the system is only tested on real servers based on Unix or WinNT filesystem._
_Use on a local WAMP package will most likely cause pathing issues._

**Ensure that the following have write capabilities:**

    /config.php
    /data
    /workspace
    /plugins
    /themes
    
Navigate in your browser to the URL where the system is placed and the
installer screen will appear. If any dependencies have not been met the
system will alert you.

Enter the requested information to create a user account, project, and
set your timezone and submit the form. If everything goes as planned 
you will be greeted with a login screen.

**(Optional Installation Settings)**

For a proper usage of the marketplace you need to set the following parameter

    allow_url_fopen On
    newrelic.enabled Off (only for newrelic users)

and the following extensions to be loaded

    ZIP
    OPENSSL
    MBSTRING

Note: Codiad will also work without these enabled.

- [Configuration example on Apache 2](https://github.com/Codiad/Codiad/wiki/Install-on-Apache-2)
- [Configuration example on Nginx](https://github.com/Codiad/Codiad/wiki/Install-on-Nginx)