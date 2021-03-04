Components
==========

Every action performed on the system utilizes one or more of the components. Components are housed in the `components` directory and loaded into the system at run-time via the index file which looks specifically for a `init.js` in each folder. All other scripts should be loaded by the `init.js` file via the global function `atheos.helpers.loadScript()`.

Any server side functions are handled by a `controller.php` file which interfaces with the `class.{component}.php` file to handle processing.

To add an entry to the right-hand panel see `components/right_bar.json`.

Originally, Atheos had a limited set of Icons to use. Moving forward, any icon provided by free tier of Font Awesome is available for use; currently the font icons can be hard coded into each file, however in future, a module might be created that will handle icon creation to help facilliate users being able to easily change out font files, and customize their Atheos expierence.