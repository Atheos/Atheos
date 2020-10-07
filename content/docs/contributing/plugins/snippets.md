---
Title: Plugin Snippets
Description: A small sampling of various usecases a plugin developer might run into
Date: 2020-07-10
Cache: true
---
<section>
<h1>Plugin Snippets</h2>
<p>This page is intends to show you some examples how to handle different usecases.</p>
</section>
<section>
<h2 id="displaying-a-dialog-window-in-your-plugin">Displaying a dialog window in your plugin</h2>
<p>Normally your plugin should do something. Therefore often a small dialog window is required. How do we get it? First we need to edit our <code>dialog.php</code> to add a small html snippet like </p>
<pre><code class="lang-php"><span class="php">&lt;?php
    // For config related stuff, we need to include the common.php
    require_once('../../common.php');   
    // also we check for authenitification
    checkSession();

    // let as switch between our different actions if we want to display different dialogs
    switch($_GET['action']){
        case 'example':
            echo '<b>Hello World</b>';
            break;           
    }   
?&gt;
</code></pre>
<p>Saving that, we are also editing our <code>init.js</code> like</p>
<pre><code>(<span class="hljs-name">(function (global) {

    // get the relative path of our plugin
    var atheos = global.atheos,
        scripts= document.getElementsByTagName('script'),
        path = scripts[scripts.length-1].src.split('?')[0],
        curpath = path.split('/').slice(0, -1).join('/')+'/';

    $(window)
        .load(function() {
            // start the plugin
            atheos.example.init();
        });

    atheos.example = {

        controller: curpath + 'controller.php',
        dialog: curpath + 'dialog.php',

        init: function () {
            // use atheos functions to load a dialog with 500px width and our example
            atheos.modal.load(500, this.dialog + '?action=example');
        };
})(this);
</code></pre>
</section>
<section>
<h2>Hooking into an existing function to provide a new functionallity</h2>
<p>To provide new functionally, you can also extend existing functions by hooking into their method and overwritting it.</p>
<ul>
<li>Example for overwritting rightbar menu entries: </li>
</ul>
<pre><code>init: function () {
    // look for entry with specific onclick and replace it's onclick function
    $('#sb-right a[onclick="atheos.update.check();"]').attr("onclick", "atheos.autoupdate.check();");
}
</code></pre>
<ul>
<li>Example for overwritting filemanager contextmenu entries</li>
</ul>
<pre><code>init: function() {
    // look for menu entry and replace it's onclick function
    $('#context-menu a[onclick="atheos.filemanager.uploadToNode($(\\'#context-menu\\').attr(\\'data-path\\'));"]').attr("onclick", "atheos.demo.denied();");
}
</code></pre>
<p>Advanced example for overwritting dialogs:</p>
<pre><code>init: function() {
    $('#modal-content').hover(function() {
        // look for a link and replace it's onclick function
        $('#modal-content a[onclick=\\'atheos.plugin_manager.install();\\']').attr("onclick", "atheos.demo.denied();");
        // look for a set of buttons and replace it's onclick function
        $('#modal-content button[onclick*=\\'atheos.plugin_manager.install\\']').each(function() {
            $(this).attr("onclick", "atheos.demo.denied();");
        });
        // look for a inputfield by name and replace it's onclick function
        $('#modal-content input[name="project_path"]').attr("readonly", true);
    },function() {});
}
</code></pre>
</section>
