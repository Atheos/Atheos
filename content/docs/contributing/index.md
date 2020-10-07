---
Title: Contibution Guide
Description: Contibution guide for the Atheos IDE
Date: 2020-07-10
Cache: true
---
<section>
	<h1>How to Contribute</h1>
	<p>Your contributions are welcome and we&#39;re very open about how contributions are made, however, to keep order to things please take the following into consideration:</p>
	<ul>
		<li>Check the issues to ensure that someone else isn&#39;t already working on the bug or feature</li>
		<li>Submit an issue for bugs and feature additions before you start with it</li>
		<li>Familiarize yourself with the <a href="https://atheos.io/docs">documentation</a></li>
	</ul>
</section>
<section>
	<h2>Git Messages</h2>

	<p><strong>Please write proper git commit messages</strong>: Your git commit messages should be well thoughtout and complete. Please explain not only what you did, but why you did it / what was the goal you were trying to accomplish. For more information, please read: <a href="https://fatbusinessman.com/2019/my-favourite-git-commit">My Favourite Commit</a>.</p>
	<p>There is an established format for <code>components</code> which utilizes one JS (<code>init.js</code>) and one CSS (<code>screen.css</code>) which is handled by the loader file. Any other resources used should be loaded or accessed from one of these.</p>
	<p><strong>Don&#39;t Reinvent the Wheel!</strong> There&#39;s an API and defined, easy-to-understand set of methods for a reason - use them.</p>
	<p>Stick to the conventions defined in other components as closely as possible. </p>
	<ul>
		<li>Utilize the same commenting structure</li>
		<li>Use underscores in namespaces instead of interCaps</li>
		<li>Use indent with 4 spaces in your code</li>
		<li>Use single quotes for parameternames and double quotes for strings </li>
		<li>When working with the editor utilize the <code>active</code> object whenever possible instead of going direct to the <code>editor</code></li>
	</ul>
</section>
<section>
	<h2>CSS/SCSS Formatting</h2>
	<p>Everything should be pulled from a single CSS file in the end, plugins aside, in order to reduce overall fetch requests.</p>
</section>
<section>
	<h2>Javascript Formatting</h2>
	<p>In order to maintain a consistant code structure to the code across the application please run any changes through JSBeautifier (<a href="http://jsbeautifier.org/">http://jsbeautifier.org/</a>) with the default settings.</p>
	<p>The Events Library by Chris Ferdinandi is currently intended as only for permanent DOM nodes, and may potentially be removed in the future. If what you are modifying is always within the DOM upon intial load, please use events.js for event management. Otherwise, use document.(add/remove)EventListeners and clean up after yourself on unload.</p>
	<p>If you have questions, please ask. Submit an issue or <a href="mailto:liam@siira.us">contact me directly</a>. </p>
</section>
<section>
	<h2>PHP Formatting</h2>
	<p>In order to maintain a consistant code structure we follow PSR2 standards and using travis CI to validate a proper formatting.</p>
</section>