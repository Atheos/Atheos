---
Title: Plugin Creation
Description: A simple introduction guide to creating a plugin for the Atheos IDE
Date: 2020-07-10
Cache: true
---
<section>
	<h1>Creating a Plugin</h1>
	<p>The Atheos FrontEnd at it&#39;s core is a JavaScript Object, and as such, it is easy to add your own module as a key to the Atheos Object. Most of the components and modules that are built into Atheos by default publish Amplify events during actions, allowing a plugin to subscribe and modify them. In fact, a module can be completely rewritten as plugins are loaded last.</p>
	<p>In order to have your plugin added to the official list, please email the Atheos dev team (info@atheos.io). If you have any questions or are planning on creating a plugin and simply want to talk about your idea, we highly encourage you to send an email. Sadly many of the plugins on the market today try to reinvent existing functions within Atheos because they didn&#39;t know that Atheos already had built in, and if your plugin requires something that Atheos doesn&#39;t provide natively, it&#39;s possible we can add it as well.</p>
	<p>Snippets can be found at <a href="/docs/contributing/plugins/snippets">here</a></p>
</section>
<section>
	<h2>How to add your plugin to the settings</h2>
	<p>Expand your <code>plugin.json</code>:</p>
	<pre><code class="lang-json">[{ "author" : "Your Name",
  "version": "Your Version",
  "name" : "Your Plugin Name",
  "url" : "Your Repositry Url",
  "exclude" : "",
  "rightbar" : [{
    "action" : "atheos.yourplugin.doSomething();",
    "icon" : "icon-info-circled",
    "title" : "This will be displayed in the rightbar"
  }],
  "contextmenu" : [{
    "action" : "atheos.yourplugin.doSomething();",
    "icon" : "icon-info-circled",
    "applies-to" : "both",
    "title" : "This will be displayed in the contextmenu"
  }],
  "config": [{
    "file": "dialog.php",
    "icon": "icon-info-circled",
    "title": "This will be displayed in the sidebar of the settings dialog"
  }]
}]
</code>
</pre>
	<p>Your <code>file</code> provides your configs as html file. You can expand this entry with GET parameters.</p>
</section>
<section>	
	<h2>Saving logic</h2>
	<p>Each input field with the html class <code>setting</code> are automaticly saved in the localStorage with the key which has to be provided as <code>data-setting</code> attribute. For an example see: <a href="https://github.com/Atheos/Atheos/tree/master/components/settings/settings.system.php#L12">settings.system.php</a>.</p>
	<p>If you want to implement a more complex logic like preprocessing your configs use the amplify publication <code>settings.dialog.save</code>.</p>
	<h3 id="syncing-logic">Syncing logic</h3>
	<p>The user decides whether the settings of plugins are synced or not. Please respect that. In order to grant this save your configs with a key that starts with <code>Atheos.plugin.</code> in the localStorage.</p>
	<p>If you want to modify (change, add or delete) your configs before the synchronisation listen to the amplify publication <code>settings.save</code>.</p>
	<h3 id="react-on-changes">React on changes</h3>
	<p>To react on changed settings listen to the amplify publication <code>settings.changed</code>.</p> <pre><code class="lang-js">amplify.subscribe('settings.changed',function(){
    //React here on changed settings
});
</code></pre> </section>