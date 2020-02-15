Newer versions of Atheos (starting with 2.x) allow to use a custom auth scheme to access Atheos. 

**Preconditions** 

- Each user who should have access over an external auth bridge has to be configured in Atheos as well. 
- The knowledge of the password in Atheos is not required.

**Setup**

- Create or install an external auth bridge to your local Atheos installation. A template containing the minium amount of information is ```$_SESSION['user']```. Additional parameters are for language, template and project.

        <?php 
                $_SESSION['user'] = 'test';

                $_SESSION['lang'] = 'en';
                $_SESSION['theme'] = 'default';
                $_SESSION['project'] = 'test';
        ?>

- To enable external auth bridge, open your config.php and enable external auth with the path to your local bridge

     ```define("AUTH_PATH", "/path/to/AuthTemplate.php");```

**Examples**

[Codiad-SQLExternalAuth](https://github.com/QMXTech/Codiad-SQLExternalAuth) : An SQL External Auth bridge for Codiad using PHP Data Objects (PDO) (see tutorial at destination for setup instructions).

[Codiad-LDAPExternalAuth](https://github.com/QMXTech/Codiad-LDAPExternalAuth) : An LDAP External Auth bridge for Codiad (see tutorial at destination for setup instructions).

[Codiad-HTTP External Auth](https://gist.github.com/basteln3rk/4cab14ebd990e46efaef): shows how to integrate HTTP Basic authentication with Codiad, and create users in Codiad configuration if required

[Codiad-Auth-NTLM](https://github.com/daeks/Codiad-Auth-NTLM) provides a way to authenticate with NTLM or against SMB

[Codiad-IMAP_Auth](https://github.com/dugite-code/codiad-imap_auth) provides a way to authenticate against an IMAP server