---
Title: Installation on Ubuntu
Description: A short installation guide on Ubuntu
Date: 2020-07-10
Cache: true
---
<section>
   <h1>Install Atheos on Ubuntu</h1>
   <p>This tutorial should demonstrate how to setup Atheos on a Ubuntu based system. Depending on your installation, some steps might not be required anymore.</p>
   <p>Open your configuration file, normally located at <code>/etc/apache2/sites-available/000-default.conf</code></p>
</section>
<section>
   <h2>HTTPD + PHP setup</h2>
   <pre><code>    sudo apt-get install apache2
    sudo apt-get install php5
    
    # Note: On Ubuntu 16.04 use:
    sudo apt-get install php (installs php7.0)
    sudo apt-get install php-zip php-mbstring

    sudo service apache2 restart
</code></pre>
   <h2>GIT setup</h2>
   <pre><code>    sudo apt-get install git</code></pre>
    <h2>Install Atheos</h2>
</code></pre>     sudo rm -rfv /var/www/html/*
    sudo git clone https://github.com/atheos/atheos /var/www/html/
    sudo touch /var/www/html/config.php
    sudo chown www-data:www-data -R /var/www/html/
</code></pre>
   <p><code>rm -rf</code> will delete any folder, subfolder and file that you put after it, so if you put <code>rm -rf /</code> or <code>rm -rf *</code> it will delete all files on your system ( or at least all of them you have permission to delete ), so be very careful with this command.</p>
   <p>Enable write access to required paths and files for atheos</p>
   <p>Open your installation with http://your-ip-adress/ and finish the installation. </p>
</section>