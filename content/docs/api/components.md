---
Title: Components
Description: List of all component pages for Atheos
Date: 2020-07-10
Cache: true
---
<section>
	<h1>Components</h1>
	<p>Every action performed on the system utilizes one or more of the components. Components are housed in the <code>components</code> directory and loaded into the system at run-time via the index file which looks specifically for a <code>init.js</code> in each folder. All other scripts should be loaded by the <code>init.js</code> file via the global function <code>atheos.helpers.loadScript()</code>.</p>
	<p>Any server side functions are handled by a <code>controller.php</code> file which interfaces with the <code>class.{component}.php</code> file to handle processing.</p>
	<p>To add an entry to the right-hand panel see <code>components/right_bar.json</code>.</p>
	<p>Originally, Atheos had a limited set of Icons to use. Moving forward, any icon provided by free tier of Font Awesome is available for use; currently the font icons can be hard coded into each file, however in future, a module might be created that will handle icon creation to help facilliate users being able to easily change out font files, and customize their Atheos expierence.</p>
</section>
<section>
	<ul>
		<li><strong><a href="/docs/api/components/active">Active Files</a></strong> - Working with the <code>active</code> object</li>
		<li><strong><a href="/docs/api/components/contextMenu">Context Menu</a></strong> - Working with the <code>contextMenu</code> object</li>
		<li><strong><a href="/docs/api/components/editor">Editor</a></strong> - Working with the <code>editor</code> object</li>
		<li><strong><a href="/docs/api/components/filemanager">File Manager</a></strong> - Working with the <code>filemanager</code> object</li>
		<li><strong><a href="/docs/api/components/finder">Finder</a></strong> - Working with the <code>finder</code> object</li>
		<li><strong><a href="/docs/api/components/install">Install</a></strong> - Working with the <code>install</code> object</li>
		<li><strong><a href="/docs/api/components/market">Market</a></strong> - Working with the <code>market</code> object</li>
		<li><strong><a href="/docs/api/components/project">Projects</a></strong> - Working with the <code>project</code> object</li>
		<li><strong><a href="/docs/api/components/settings">Settings</a></strong> - Working with the <code>settings</code> object</li>
		<li><strong><a href="/docs/api/components/update">Update</a></strong> - Working with the <code>update</code> object</li>
		<li><strong><a href="/docs/api/components/textmode">TextMode</a></strong> - Working with the <code>textMode</code> object</li>
		<li><strong><a href="/docs/api/components/user">Users</a></strong> - Working with the <code>user</code> object</li>
		<li><strong><a href="/docs/api/components/worker">Worker</a></strong> - Working with the <code>worker</code> object</li>
	</ul>
</section>