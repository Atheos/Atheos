---
Title: Workspace Pathing
Description: A guide to the main principles behind how Atheos handles the file management.
Date: 2020-07-10
Cache: true
---
<section>
	<h1>Workspace Pathing</h1>
	<p>Almost immediately after launch many people asked &#39;how do I point to live sites outside of the <code>workspace</code>?&#39; or similar questions. In order to address this, here are 2 official suggestions.</p>
</section>
<section>
	<h2>Absolute Path Projects</h2>
	<p>atheos supports having projects outside of the <code>workspace</code>. You just have to enter the absolute path to your desired folder during the project creation.</p>
<pre><code><span class="hljs-string">UNIX:</span> <span class="hljs-regexp">/var/</span>www<span class="hljs-regexp">/sites/</span>my_project
<span class="hljs-string">WIN:</span> <span class="hljs-string">E:</span><span class="hljs-regexp">/www/</span>sites/my_project
</code></pre>
	<p>Note: Absolute paths are restricted by whitelisting in the config.php. Only included paths are allowed to be used during project creation. To add other paths except your workspace, you have to modify</p> <pre><code><span class="hljs-class"><span class="hljs-keyword">define</span></span>(<span class="hljs-string">"WHITEPATHS"</span>, BASE_PATH . <span class="hljs-string">",/home"</span>);
</code></pre>
</section>
<section>
	<h2>Symlink Workspace Projects</h2>
	<p>Let&#39;s say you have a standard install of Apache where the webroot is <code>/var/www</code>. You install atheos to the root level at <code>/var/www/atheos</code>.</p>
	<p>If you started a project called <code>my_project</code> it&#39;s contents would reside at...</p> <pre><code><span class="hljs-regexp">/var/</span>www<span class="hljs-regexp">/atheos/</span>workspace<span class="hljs-regexp">/my_project</span>
</code></pre>
	<p>Now, let&#39;s say you have a Virtual Host pointing to a directory that houses the live version of this project at<code>/var/www/sites/my_project</code></p>
	<p>Your goal is to be able to edit the files on the live site. This can be achieved in several ways with the system, but the most successful (and recommended) method is with a link.</p>
</section>
<section>
	<h2 id="the-solution">The Solution</h2>
	<p>First, make sure you&#39;ve created the project in atheos, then using either the terminal built into atheos, or via SSH or another CLI access method simply recreate the project folder via the following:</p>
	<ol>
		<li>
			<p>Remove the existing folder:</p>
			<p> <code>rm -rf /var/www/atheos/workspace/my_project</code>
			</p>
		</li>
	</ol>
	<p>_Notice: Please make sure that <code>/var/www/atheos/workspace/my_project</code> does not contain any needed files._</p>
	<ol>
		<li>
			<p>Recreate the path as a link:</p>
			<p> <code>ln -s /var/www/sites/my_project /var/www/atheos/workspace/my_project</code>
			</p>
		</li>
	</ol>
	<p>Where the <code>ln -s</code> is followed by the path to the live site, then followed by the path where the project workspace resided.</p>
	<p>This will create a link so your server sees all of the contents of the live site in the workspace path where it expects to see it.</p>
	<p><strong>Important Note</strong>
	</p>
	<p>Keep in mind - this will point the folder, but you&#39;ll still need to make sure the system has permissions to write to the directory. If your server is running suPHP or elevated permissions on PHP processes this won&#39;t be an issue, however, adding write capabilities to a live site can be a security issue. The point of the <code>workspace</code> is giving the ability to isolate writing to a specific directory.</p>
	<p>rm -rf will delete any folder, subfolder and file that you put after it, so if you put rm -rf / it will delete all files on your system ( or at least all of them you have permission to delete ), so be very careful with this command</p>
</section>