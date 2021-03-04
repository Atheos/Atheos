---
Title: Installation on CentOS
Description: A short installation guide on CentOS
Date: 2020-07-10
Cache: true
---
<section>
   <h1>Install Atheos on CentOS</h1>
   <p>This tutorial should demonstrate how to setup Atheos on a CentOS based system. Depending on your installation, some steps might not be required anymore.</p>
   <p>Open your configuration file, normally located at <code>/etc/apache2/sites-available/000-default.conf</code></p>
</section>
<section>
   <h2>HTTPD + PHP setup</h2>
   <pre><code>    sudo yum install httpd
    sudo yum install php
    sudo yum install php-mbstring

    sudo systemctl start httpd.service
    sudo systemctl enable httpd.service
</code></pre>
   <p>To enable access to your httpd from your network, some adjustments to your firewall are required.
      Get your firewall zone and enable http port in that zone (default is public)
   </p>
   <pre><code>    firewall-cmd --list-all

    firewall-cmd --zone=public --add-service=http --permanent
    firewall-cmd --reload
</code></pre>
   <h2>GIT setup</h2>
   <pre><code>    sudo yum install git<pre><code>
    <h2>Install Atheos</h2>
</code></pre>    sudo rm -rfv /var/www/html/*
    sudo git clone https://github.com/atheos/atheos /var/www/html/
    sudo touch /var/www/html/config.php
    sudo chown apache:apache -R /var/www/html/  
</code></pre>
   <p><code>rm -rf</code> will delete any folder, subfolder and file that you put after it, so if you put <code>rm -rf /</code> or <code>rm -rf *</code> it will delete all files on your system ( or at least all of them you have permission to delete ), so be very careful with this command.</p>
   <p>Enable write access to required paths and files for atheos</p>
   <pre><code>    sudo chcon -t httpd_sys_rw_content_t /var/www/html/data/
    sudo chcon -t httpd_sys_rw_content_t /var/www/html/plugins/
    sudo chcon -t httpd_sys_rw_content_t /var/www/html/themes/
    sudo chcon -t httpd_sys_rw_content_t /var/www/html/workspace/
    sudo chcon -t httpd_sys_rw_content_t /var/www/html/config.php
</code></pre>
   <p>Open your installation with http://your-ip-adress/ and finish the installation. </p>
</section>