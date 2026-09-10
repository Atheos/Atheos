---
Title: Installation on Easypanel
Description: A short installation guide for deploying Atheos on Easypanel
Date: 2026-09-10
Cache: true
---
<section>
	<h1>Install Atheos on Easypanel</h1>
	<p><a href="https://easypanel.io/">Easypanel</a> is a modern server control panel that can deploy Atheos with one click using its official template, without needing to manually run Docker commands or configure a web server.</p>
	<ul>
		<li>Open your Easypanel dashboard and create a new project</li>
		<li>Click <strong>+ Add Service</strong> and choose <strong>Templates</strong></li>
		<li>Search for <strong>Atheos</strong> and select it</li>
		<li>Click <strong>Create</strong> to deploy the service</li>
	</ul>
	<p>Easypanel runs <a href="https://hub.docker.com/r/hlsiira/atheos">HLSiira's Docker image</a> for you and exposes it through a domain, so no manual Apache/Nginx configuration is required.</p>
	<p>Once deployed, open the assigned domain in your browser to finish the installation screen as described in the <a href="/docs/installation/index.md">general installation guide</a>.</p>
	<p>See the <a href="https://easypanel.io/templates/atheos">official Atheos template on Easypanel</a> for more details.</p>
</section>
