---
Title: API
Description: The API explination for all Atheos components and modules
Date: 2020-07-10
Cache: true
---
<section>
	<h1>API &amp; System Interface</h1>
	<h2>Directory Structure</h2>
	<ul>
		<li><strong>Components</strong>: Complex, multi-file Atheos engine files.</li>
		<li><strong>Data</strong>: Configuration settings, user data</li>
		<li><strong>Docs</strong>: Small document folder for key documents used by Github and Licensing.</li>
		<li><strong>Favicons</strong>: Favicon (and logo) used by Atheos client-side.</li>
		<li><strong>Fonts</strong>: Font files used by Atheos client-side.</li>
		<li><strong>Languages</strong>: Multi-lang translations for Athoes.</li>
		<li><strong>Lib</strong>: Libraries used by Atheos.</li>
		<li><strong>Modules</strong>: Simple, single-file Atheos engine files.</li>
		<li><strong>Plugins</strong>: Plugins installed by users.</li>
		<li><strong>Public</strong>: Atheos stores most public facing CSS/JS in this folder in a compressed manner.</li>
		<li><strong>Themes</strong>: Atheos themes.</li>
		<li><strong>Workspace</strong>: Atheos workspace</li>
	</ul>
</section>
<section>
	<h2>Components and Modules</h2>
	<ul>
		<li><a href="/docs/api/components">More informaiton about components can be found here</a></li>
		<li><a href="/docs/api/modules">More information about modules can be found here</a></li>
	
	</ul>
	<p>The Atheos platform can best be defined as a core system Javascript object built by combining specifically tasked components and modules. Modules are stand alone Javascript files, while Components house other smaller component related files. Using these Modules and Components, Atheos hopes to create a fully Interactive Development Environment for programmers.</p>
	<p>Each Module and the main Javascript file for each Component are structured nearly identically, an Immiediatly Invoked Function containing objcts that act as containers for the methods, and variables associated with the component or module.</p>
	<p>Components have a few key differences that are noted on the Components page. Plugins should be built using the same struture as Components.</p>
	<p>As an example:</p>
<pre><code>//////////////////////////////////////////////////////////////////////////////80
// Comment block exceeding no more than 80 Characters/Line
//////////////////////////////////////////////////////////////////////////////80

(function(global){
	var atheos = global.atheos,
		amplify = global.amplify;
	var self = null;
	
	amplify.subscribe('system.loadExtra', () => atheos.module.init());

	atheos.module = {
		setting: 'value',
		
		init: function() {
			self = this;
			self.printToConsole(this.setting);
		},
		
		printToConsole: function(message) {
			console.log(message);
		}
	}
}(this));
</code></pre>
</section>
<section>
	<h2>Data</h2>
	<p>System data is stored in JSON formatted PHP files which are read and written to via the <code>common.php</code> file&#39;s JSON function (<code>readJSON</code> and <code>saveJSON</code>). This method protects the files from being publicly accessible through the browser.</p>
	<h2>Workspace</h2>
	<p>The <code>workspace</code> directory houses all projects and their files. The <code>filemanager</code> component acts upon these files via pathing to the root of the project.</p>
</section>
<section>
	<h2>Plugins</h2>
	<p>Plugins are quite similar then components, but stored in another location of the Atheos main directory. You can automatically download them from the plugin market or just put them manually in the <code>plugins</code> directory. Each plugin contains a metadata file, named <code>plugin.json</code>, containing author, version and description. Atheos looks on each start for a <code>init.js</code> and <code>screen.css</code> file and starts the plugin. All other scripts should be loaded by the <code>init.js</code> file via the global function <code>atheos.common.loadScript();</code> (see <a href="https://github.com/Atheos/Atheos-Plugin-Template">https://github.com/Atheos/Atheos-Plugin-Template</a>).</p>
</section>
<section>
	<h2>Themes</h2>
	<p>All layout related stuff is merged together as a theme. Atheos uses by default the <code>default</code> theme which is located in the <code>themes</code> directory. If the desired file is missing in a custom theme, Atheos has an included fallback to the <code>default</code> theme. More information about themes can be found at <a href="/docs/contributing/themes">Themes</a>
	</p>
</section>
<section>
