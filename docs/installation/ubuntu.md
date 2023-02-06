---
Title: Installation on Ubuntu
Description: A short installation guide on Ubuntu
Date: 2023-01-18
Cache: true
---
<section>
   <h1>Install Atheos on Ubuntu</h1>
   <p>This tutorial should demonstrate how to setup Atheos on a Ubuntu based system. Depending on your installation, some steps might not be required anymore.</p>
   <p>Open your configuration file, normally located at <code>/etc/apache2/sites-available/000-default.conf</code></p>
</section>
<section>
   <h2>HTTPD + PHP setup</h2>
   <h3>Versions below Ubuntu 16.04</h3>
<pre><code>sudo apt-get install apache2</br>
sudo apt-get install php5</br>
sudo service apache2 restart</br>
</code></pre>
   <h3>Versions above Ubuntu 16.04</h3>
<pre><code>sudo apt-get install php #(installs php7.0)</br>
sudo apt-get install php-zip php-mbstring</br>
sudo service apache2 restart</code></pre>

   <h2>GIT setup</h2>
   <pre><code>sudo apt-get install git</code></pre>
    <h2>Install Atheos</h2>
<pre><code>sudo rm -rfv /var/www/html/* #This will remove anything in the /var/www/html/ folder.
sudo git clone https://github.com/atheos/atheos /var/www/html/
sudo touch /var/www/html/config.php
sudo chown www-data:www-data -R /var/www/html/
</code></pre>
   <p>Enable write access to required paths and files for atheos</p>
   <p>Open your installation with http://your-ip-adress/ and finish the installation. </p>
</section>
