# How to Contribute

Your contributions are welcome and we're very open about how contributions are made, however, to keep order to things please take the following into consideration:

* Check the issues to ensure that someone else isn't already working on the bug or feature
* Submit an issue for bugs and feature additions before you start with it
* Familiarize yourself with the documentation in the [Wiki](https://github.com/Atheos/Atheos/wiki)

There is an established format for `components` which utilizes one JS (`init.js`) and one CSS (`screen.css`) which is handled by the loader file. Any other resources used should be loaded or accessed from one of these.

**Don't Reinvent the Wheel!** There's an API and defined, easy-to-understand set of methods for a reason - use them.

Stick to the conventions defined in other components as closely as possible. 

* Utilize the same commenting structure
* Camcase is preferred.
* Use indent with 4 spaces in your code
* Use single quotes wherever possible 
* When working with the editor utilize the `active` object whenever possible instead of going direct to the `editor`

**CSS/SCSS Formatting**

Everything should be pulled from a single CSS file in the end, preferably built from multiple SCSS files.

**Javascript Formatting**


In order to maintain a consistant code structure to the code across the application please run any changes through JSBeautifier (http://jsbeautifier.org/) with the default settings.

The Events Library by Chris Ferdinandi is currently intended as only for permanent DOM nodes, and may potentially be removed in the future. If what you are modifying is always within the DOM upon intial load, please use events.js for event management. Otherwise, use document.(add/remove)EventListeners and clean up after yourself on unload.

Any DOM manupulation needs to be passed through PicoJS if possible. The library is small and documentation is coming soon. It also des event handling, currently using Chris Ferdinandi's Events.js for event delegation.

All JS files should follow the standard file format/structure in modal.js, and linted to minimum warnings / errors using https://jshint.com/



If you have questions, please ask. Submit an issue or [contact me directly](mailto:liam@siira.us). 

**PHP Formatting**



In order to maintain a consistant code structure we follow PSR2 standards and using travis CI to validate a proper formatting.
