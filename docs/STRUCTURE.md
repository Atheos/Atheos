API & System Interface
======================

Directory Structure
-------------------

*   **Components**: Complex, multi-file Atheos engine files.
*   **Data**: Configuration settings, user data
*   **Docs**: Small document folder for key documents used by Github and Licensing.
*   **Favicons**: Favicon (and logo) used by Atheos client-side.
*   **Fonts**: Font files used by Atheos client-side.
*   **Languages**: Multi-lang translations for Athoes.
*   **Libraries**: Libraries used by Atheos.
*   **Modules**: Simple, single-file Atheos engine files.
*   **Plugins**: Plugins installed by users.
*   **Public**: Atheos stores most public facing CSS/JS in this folder in a compressed manner.
*   **Themes**: Atheos themes.
*   **Workspace**: Atheos workspace

Components and Modules
----------------------

*   [More informaiton about components can be found here](/docs/api/components)
*   [More information about modules can be found here](/docs/api/modules)

The Atheos platform can best be defined as a core system Javascript object built by combining specifically tasked components and modules. Modules are stand alone Javascript files, while Components house other smaller component related files. Using these Modules and Components, Atheos hopes to create a fully Interactive Development Environment for programmers.

Each Module and the main Javascript file for each Component are structured nearly identically, an Immiediatly Invoked Function containing objcts that act as containers for the methods, and variables associated with the component or module.

Components have a few key differences that are noted on the Components page. Plugins should be built using the same struture as Components.

As an example:

    //////////////////////////////////////////////////////////////////////////////80
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
    

Data
----

System data is stored in JSON formatted PHP files which are read and written to via the `common.php` file's JSON function (`readJSON` and `saveJSON`). This method protects the files from being publicly accessible through the browser.

Workspace
---------

The `workspace` directory houses all projects and their files. The `filemanager` component acts upon these files via pathing to the root of the project.

Plugins
-------

Plugins are quite similar then components, but stored in another location of the Atheos main directory. You can automatically download them from the plugin market or just put them manually in the `plugins` directory. Each plugin contains a metadata file, named `plugin.json`, containing author, version and description. Atheos looks on each start for a `init.js` and `screen.css` file and starts the plugin. All other scripts should be loaded by the `init.js` file via the global function `atheos.common.loadScript();` (see [https://github.com/Atheos/Atheos-Plugin-Template](https://github.com/Atheos/Atheos-Plugin-Template)).

Themes
------

All layout related stuff is merged together as a theme. Atheos uses by default the `default` theme which is located in the `themes` directory. If the desired file is missing in a custom theme, Atheos has an included fallback to the `default` theme. More information about themes can be found at [Themes](/docs/contributing/themes)