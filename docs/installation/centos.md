This tutorial should demonstrate how to setup Atheos on a CentOS based system. Depending on your installation, some steps might not be required anymore. 

### HTTPD + PHP setup

    sudo yum install httpd
    sudo yum install php
    sudo yum install php-mbstring

    sudo systemctl start httpd.service
    sudo systemctl enable httpd.service

To enable access to your httpd from your network, some adjustments to your firewall are required.
Get your firewall zone and enable http port in that zone (default is public)

    firewall-cmd --list-all

    firewall-cmd --zone=public --add-service=http --permanent
    firewall-cmd --reload
    
### GIT setup

    sudo yum install git

### Install atheos

    sudo rm -rfv /var/www/html/*
    sudo git clone https://github.com/atheos/atheos /var/www/html/
    sudo touch /var/www/html/config.php
    sudo chown apache:apache -R /var/www/html/

```rm -rf``` will delete any folder, subfolder and file that you put after it, so if you put ```rm -rf /``` or ```rm -rf *``` it will delete all files on your system ( or at least all of them you have permission to delete ), so be very careful with this command.

Enable write access to required paths and files for atheos

    sudo chcon -t httpd_sys_rw_content_t /var/www/html/data/
    sudo chcon -t httpd_sys_rw_content_t /var/www/html/plugins/
    sudo chcon -t httpd_sys_rw_content_t /var/www/html/themes/
    sudo chcon -t httpd_sys_rw_content_t /var/www/html/workspace/
    sudo chcon -t httpd_sys_rw_content_t /var/www/html/config.php

Open your installation with http://your-ip-adress/ and finish the installation. 