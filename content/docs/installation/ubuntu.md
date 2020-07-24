---
Title: Installation on Ubuntu
Description: A short installation guide on Ubuntu
Date: 2020-07-10
Cache: true
---
This tutorial should demonstrate how to setup Atheos on an Ubuntu based system. Depending on your installation, some steps might not be required anymore. 

### HTTPD + PHP setup

    sudo apt-get install apache2
    sudo apt-get install php5
    
    Note: On Ubuntu 16.04 use:
    sudo apt-get install php (installs php7.0)
    sudo apt-get install php-zip php-mbstring

    sudo service apache2 restart
    
### GIT setup

    sudo apt-get install git

### Install Atheos

Note: On Ubuntu 13.04 or below the default path is ```/var/www/```

    sudo rm -rfv /var/www/html/*
    sudo git clone https://github.com/atheos/atheos /var/www/html/
    sudo touch /var/www/html/config.php
    sudo chown www-data:www-data -R /var/www/html/

```rm -rf``` will delete any folder, subfolder and file that you put after it, so if you put ```rm -rf /``` or ```rm -rf *``` it will delete all files on your system ( or at least all of them you have permission to delete ), so be very careful with this command.

Open your installation with http://your-ip-adress/ and finish the installation. 