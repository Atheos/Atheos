This tutorial should demonstrate how to setup Atheos on a Nginx based system. Depending on your installation, some steps might not be required anymore. 

### Install Atheos

- Simply place the contents of the system in a web accessible folder
- Ensure that the system has write capabilities according to mentioned files and folders
- Ensure that php is setup correctly

### Nginx

The following nginx configuration file might not follow all the nginx best practices, but can be a good starting point to set up a atheos instance. Copy it in ```/etc/nginx/sites-available``` and symlink it from ```/etc/nginx/sites-enabled``` to enable it:
```
cd /etc/nginx/sites-enabled
ln -s /etc/nginx/sites-available .
```
Finally restart your nginx server, usually with ```sudo service nginx restart```.
```nginx
server {
	#listen   80; ## listen for ipv4; this line is default and implied
	#listen   [::]:80 default ipv6only=on; ## listen for ipv6

	root /var/www/html;
	index index.php index.html;

	# Make site accessible from http://localhost/
	server_name localhost atheos.my_domain_name.org;

	location / {
		# First attempt to serve request as file, then
		# as directory, then fall back to index.html
		try_files $uri $uri/ /index.html;
	}

	error_page 404 /404.html;

	# redirect server error pages to the static page /50x.html
	error_page 500 502 503 504 /50x.html;
	location = /50x.html {
		root /usr/share/nginx/www;
	}

	# pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
	location ~ \.php$ {
		fastcgi_split_path_info ^(.+\.php)(/.+)$;
		# NOTE: You should have "cgi.fix_pathinfo = 0;" in php.ini
	
		# With php5-cgi alone:
		fastcgi_pass 127.0.0.1:9000;
		# With php5-fpm (or php7-fpm, ie on Ubuntu 16.04):
		#fastcgi_pass unix:/var/run/php5-fpm.sock;
                fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
		fastcgi_index index.php;
		include fastcgi_params;
	}
}
```
### Troubleshooting
- 502 error likely means php is not setup correctly
 
Open your installation with http://your-ip-adress/ and finish the installation. 