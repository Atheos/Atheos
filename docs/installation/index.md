---
Title: Installation
Description: The installation guides for accomplishing a typical install of the Atheos IDE
Date: 2020-07-10
Cache: true
---
<section>
	<h1>Installing Atheos</h1>
	<ul>
		<li><a href="/docs/installation/apache2">Configuration example on Apache</a></li>
		<li><a href="/docs/installation/nginx">Configuration example on Nginx</a></li>
		<li><a href="/docs/installation/centos">Quick Installation on CentOS</a></li>
		<li><a href="/docs/installation/ubuntu">Quick Installation on Ubuntu</a></li>
	</ul>
</section>
<section>
	<h2>General Installation Guide</h2>
	<p>To install simply place the contents of the system in a web accessible folder.</p>
	<p>Note: <em>Currently the system is only tested on real servers based on a Unix filesystem.</em> <em>Use on a local WAMP package will most likely cause pathing issues.</em></p>
	<p><strong>Ensure that the following folders have write capabilities:</strong></p> <pre><code>    /config.php
    /data
    /workspace
    /plugins
    /themes
</code></pre>
	<p>Navigate in your browser to the URL where the system is placed and the installer screen will appear. If any dependencies have not been met the system will alert you.</p>
	<p>Enter the requested information to create a user account, project, and set your timezone and submit the form. If everything goes as planned you will be greeted with a login screen.</p>
	<h3>(Optional Installation Settings)</h3>
	<p>For a proper usage of the marketplace you need to set the following parameter</p>
	<pre><code>    allow_url_fopen On
    newrelic.enabled Off (only for newrelic users)
</code></pre>
	<p>and the following extensions to be loaded</p> <pre><code>    ZIP -- needed for downloading plugins (not needed if manually downloading/installing plugins)
    OPENSSL
    MBSTRING
</code></pre>
	<p>Note: Atheos will also work without these enabled.</p>
</section>
<section>
	<h2>Installing with Docker</h2>
	<p>Once you've installed [Docker](http://docker.com/), you can start *atheos* using [HLSiira's Docker Image](https://hub.docker.com/r/hlsiira/atheos/) image: </p>
	<pre><code>$ docker run --rm -p 8080:80 -d hlsiira/atheos:latest</code></pre>
	<p>And open your browser at <code>http://localhost:8080</code>. See that image's README for further details and data persistence.</p>
</section>
