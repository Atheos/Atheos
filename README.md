# Installation Guide for Demo Application 

- Install GIT on your system
- Install Webserver like Apache2 with PHP
- Go to your webroot directory and execute 

(Please use your webserver user for the chown command, example is for Apache2's user www-data)

```
git clone https://github.com/Codiad/CodiadDemo.git
chown www-data:www-data -R *
chmod 744 demo/createinstance.sh
```

- Open your browser and install Codiad. Please use `demo` as username, password, projectname and projectpath.

# webserver Configuration

Additional security should be applied to your webserver as well. Please disable direct access to your workspace directory and PHP execution.
Example Configuration for Apache2:

```
<DirectoryMatch "^.+/workspace">
          AllowOverride None
          Options -Execcgi -Indexes -FollowSymLinks -MultiViews
          RemoveHandler .php .phtml .php3 .php4 .php5 .cgi .htaccess
          Addhandler text/plain .php .phtml .php3 .php4 .php5 .cgi .htaccess
          php_admin_flag engine off
          Deny from all
  </DirectoryMatch>
```

# Manual Update

- For a manual update of your demo system, you could use the prepared ```upgrade.sh``` in your Codiad root directory.
- Assign execution permission to it first

```
chmod 744 upgrade.sh
./upgrade.sh <installation directory> <webserver user>
```

Example Apache2:
```
./upgrade.sh /var/www/ www-data
```

# Automatic Update

- Use crontab for this. Updates are applied automatically to the system and will be checked at midnight once a day.

```
chmod 744 upgrade.sh
crontab -e
```

and add

```
0 0 * * * <installation directory>/upgrade.sh <installation directory> <webserver user>
```

Example Apache2:
```
0 0 * * * /var/www/upgrade.sh /var/www/ www-data
```

# Codiad Web IDE

Codiad is a web-based IDE framework with a small footprint and minimal requirements. The system is still early in development, and while it has been proven extremely stable please be sure have a backup system if you use it in any production work.

Keep up to date with the latest changes and news on **[Twitter](http://twitter.com/codiadide)** or **[Facebook](http://www.facebook.com/Codiad)**

For more information on the project please check out the **[check out the Wiki](https://github.com/Codiad/Codiad/wiki)** or **[the Codiad Website](http://www.codiad.com)**

Distributed under the MIT-Style License. See `LICENSE.txt` file for more information.
