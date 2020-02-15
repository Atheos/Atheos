## Summary

The Atheos platform is built as a core system built by combining specifically tasked components. The structure includes `data`, a `workspace` and `components`. The main `js` and `css` directories house the globally available functions and style definitions for the system.

### Data

System data is stored in JSON formatted PHP files which are read and written to via the `common.php` file's JSON function (`getJSON` and `saveJSON`). This method protects the files from being publicly accessible through the browser.

### Workspace

The `workspace` directory houses all projects and their files. The `filemanager` component acts upon these files via pathing to the root of the project.

### Components

Every action performed on the system utilizes one or more of the components. Components are housed in the `components` directory and loaded into the system at run-time via the `components/load.json` file which looks specifically for a `init.js` and `screen.css` file. All other scripts should be loaded by the `init.js` file via the global function `core.helpers.loadScript()' (see `/api/system`).

Any server side functions are handled by a `controller.php` file which interfaces with the `class.{component}.php` file to handle processing.

To add an entry to the right-hand panel see `components/right_bar.json`. For a list of icon-codes go to `Atheos-url/style_guide.php`.

### Plugins

Plugins are quite similar then components, but stored in another location of the Atheos main directory. You can automatically download them from the plugin market or just put them manually in the `plugins` directory. Each plugin contains a metadata file, named `plugin.json`, containing author, version and description. Atheos looks on each start for a `init.js` and `screen.css` file and starts the plugin. All other scripts should be loaded by the `init.js` file via the global function `$.loadScript()' (see https://github.com/Atheos/Atheos-Plugin-Template).

### Themes

All layout related stuff is merged together as a theme. Atheos uses by default the `default` theme which is located in the `themes` directory. As already mentioned in the components section of this article, each component is using a `screen.css` which is automatically loaded on startup. If the desired file is missing in a custom theme, Atheos has an included fallback to the `default` theme. More information about themes can be found at https://github.com/Atheos/Atheos/wiki/Themes