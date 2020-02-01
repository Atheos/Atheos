This tutorial should demonstrate how to setup Codiad on an Apache based system. Depending on your installation, some steps might not be required anymore. 

### Install Codiad

- Simply place the contents of the system in a web accessible folder
- Ensure that the system has write capabilities according to mentioned files and folders

### Apache 2 

Open your configuration file, normally located at ```/etc/apache2/sites-available/000-default.conf```

```
<VirtualHost *:80>
        DocumentRoot /var/www/
        <Directory />
                Options FollowSymLinks
                AllowOverride None
        </Directory>
        <Directory /var/www/>
                Options Indexes FollowSymLinks MultiViews
                AllowOverride None
                Order allow,deny
                allow from all
        </Directory>
</VirtualHost>
```

Open your installation with http://your-ip-adress/ and finish the installation. 