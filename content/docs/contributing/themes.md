---
Title: Theme Creation
Description: A simple introduction guide to creating a theme for the Atheos IDE
Date: 2020-07-10
Cache: true
---
<section>
	<h1>Theme Creation</h1>
	<p>Themes are design extensions for Atheos to give your personal style to your users. </p>
</section>
<section>
	<h2>How do I add a new theme to Atheos</h2>
	<p>All themes are located in <code>themes</code>. Put your new theme in this folder and replace the default theme in your configuration with the folder-name of your theme: <a href="https://github.com/Atheos/Atheos/blob/master/config.example.php#L20">https://github.com/Atheos/Atheos/blob/master/config.example.php#L20</a></p>
</section>
<section>
	<h2>How to get your own theme into the marketplace</h2>
	<p>If you would like to submit a theme , please email the GitHub repository and information about your theme to dev[at]Atheos.com. Please note: While we test themes before adding them to this list we cannot guarantee quality or provide any warranty. If you have any issues please address them directly with the theme author.</p>
</section>
<section>
	<h2>How to create a new theme for Atheos</h2>
	<p>Generally spoken, the easiest way is to copy the <code>default</code> folder and edit it to your needs. For public using of your theme, we would prefer to create a new repository on github containing all your changes. This repository should have at least one <code>readme.md</code> and <code>theme.json</code>, such as the ones found in the default Atheos Theme.</p>
	<p>As custom themes are not maintained by Atheos itself, we prefer to copy only components you want to modify as Atheos has a built-in functionality to take the <code>default</code> components if your theme does not have them. Looking at the example above, that would mean that only the filemanager would be modified and the other components loaded from the <code>default</code> theme. </p>
	<p><strong>Meta Data File</strong></p> <pre><code><span class="hljs-selector-tag">theme</span><span class="hljs-selector-class">.json</span>
</code></pre>
	<p>Theme file contains information about the theme, like name or author. It is formatted in JSON:</p> <pre><code class="lang-json">{
    <span class="hljs-attr">"author"</span> : <span class="hljs-string">"Your Name"</span>,
    <span class="hljs-attr">"version"</span>: <span class="hljs-string">"Your Version"</span>,
    <span class="hljs-attr">"url"</span> : <span class="hljs-string">"Your Repository URL"</span>
}
</code></pre> </section>