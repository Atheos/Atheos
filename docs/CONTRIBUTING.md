How to Contribute
================================================================================

Your contributions are welcome and we're very open about how contributions are made, however, to keep order to things please take the following into consideration:

*   Check the issues to ensure that someone else isn't already working on the bug or feature
*   Submit an issue for bugs and feature additions before you start with it
*   Familiarize yourself with the [documentation](https://atheos.io/docs)

Git Messages
================================================================================

**Please write proper git commit messages**: Your git commit messages should be well thoughtout and complete. Please explain not only what you did, but why you did it / what was the goal you were trying to accomplish. For more information, please read: [My Favourite Commit](https://fatbusinessman.com/2019/my-favourite-git-commit).

There is an established format for `components` which utilizes one JS (`init.js`) and one CSS (`screen.css`) which is handled by the loader file. Any other resources used should be loaded or accessed from one of these.

**Don't Reinvent the Wheel!** There's an API and defined, easy-to-understand set of methods for a reason - use them.

Stick to the conventions defined in other components as closely as possible.

* Utilize the same commenting structure
* Use underscores in namespaces instead of interCaps
* Use indent with 4 spaces in your code
* Use single quotes for parameternames and double quotes for strings
* When working with the editor utilize the `active` object whenever possible instead of going direct to the `editor`

Overall Standards
================================================================================

* Early returns are preferred over nested statements
* Toast messages should end with punctuation
* All functions should begin with the standard 80CHAR comment block
  * The block is large and ugly in order to catch eyes when in larger files
  * Subtle reminder to keep line column length down
  * Changing all the code now to match a higher 120 count could take ages
* Selectors / Multiple Keys should be sent as Comma Delimited, such as Events, Amplifiy, and Identifiers


Javascript Formatting
================================================================================
JS prefer LET/CONST over VAR

In order to maintain a consistant code structure to the code across the application please run any changes through JSBeautifier ([http://jsbeautifier.org/](http://jsbeautifier.org/)) with the default settings.

The Events Library by Chris Ferdinandi is currently intended as only for permanent DOM nodes, and may potentially be removed in the future. If what you are modifying is always within the DOM upon intial load, please use events.js for event management. Otherwise, use document.(add/remove)EventListeners and clean up after yourself on unload.

If you have questions, please ask. Submit an issue or [contact me directly](mailto:liam@siira.us).

PHP Formatting
================================================================================
PHP files use double quotes, JS usess single quotes

In order to maintain a consistant code structure we follow PSR2 standards and using travis CI to validate a proper formatting.


CSS/SCSS Formatting
================================================================================

Everything should be pulled from a single CSS file in the end, plugins aside, in order to reduce overall fetch requests.


Standard File Header:
================================================================================
```
//////////////////////////////////////////////////////////////////////////////80
// Name
//////////////////////////////////////////////////////////////////////////////80
// Copyright
//////////////////////////////////////////////////////////////////////////////80
// Description: 
//	Description
//////////////////////////////////////////////////////////////////////////////80
// Suggestions:
//	- 
//////////////////////////////////////////////////////////////////////////////80
// Usage:
//	- 
//////////////////////////////////////////////////////////////////////////////80
```