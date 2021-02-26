---
Title: Installation on Apache2
Description: A short installation guide on Apache2
Date: 2020-07-10
Cache: true
---
<section>
	<h1>Install Atheos on Apache2</h1>
	<p>This tutorial should demonstrate how to setup Atheos on an Apache based system. Depending on your installation, some steps might not be required anymore. </p>
	<ul>
		<li>Simply place the contents of the system in a web accessible folder</li>
		<li>Ensure that the system has write capabilities according to mentioned files and folders</li>
	</ul>
	<p>Open your configuration file, normally located at <code>/etc/apache2/sites-available/000-default.conf</code></p> <pre><code>&lt;VirtualHost *:80&gt;
        DocumentRoot /var/www/
        &lt;Directory /&gt;
               Options FollowSymLinks
                AllowOverride None
        &lt;/Directory&gt;
        &lt;Directory /var/www/&gt;
               Options Indexes FollowSymLinks MultiViews
                AllowOverride None
               Order allow,deny
               allow from all
        &lt;/Directory&gt;
&lt;/VirtualHost&gt;
</code></pre>
	<p>Open your installation with <a href="http://your-ip-adress/">http://your-ip-adress/</a> and finish the installation. </p>
</section>
