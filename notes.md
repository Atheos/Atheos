## Notes, by Liam Siira

Looking though the javascript, I see a lot of triggers for h-size-init within the sidebars.js module. I originally thought it was a method for triggering a resize event, but removing it sometimes doesn't seem to have any affect and a quick google search with zero effort turned up nothing. Need to figure out what these are for, but for now, they are staying.

FrontEnd:
 * The direction of using bioflux, my own personal library of helper functions, is something I'm not really convinced is the best method. While I don't mind having a useful collection of helper functions built for Atheos, it feels like an unwanted step child currently. I think a better direction to go for is to merge it fully into Atheos as it's own module, to allow plugins to reliably take advantage of it in the future. Same about Chris Ferdendani's Events.js helper library.
 * I've forked FemtoJS and created my own PicoJS from it to be used as Atheos' own helper library. Currently the library situation is a little disjointed and there are some functions that I am not sure I'll be able to replicate from jQuery.

The element IDs aren't easily changable, css files have them littered throughout & vaious components use them all over the place. Needs condensing.

CSS in JS everywhere.... A lot of the moving, transitions, hide and show are inside jquery functions instead of CSS classes and objects and I don't approve. It makes the JS very complex as well as locking transition animations inside many JS files instead of in the themes. Cosmetics should be controllable by the theme chosen by the user.

Backend:
 * In components/update/class.update.php @ line 32/33, there is a reference to the update server pointing towards Kurim's server. Eventually I'll need to set up a backend for it.
 * I've created the backend and updated all references to it. I think I should find a better palce to host the JSON files as I don't want people pinging my server that often.
 * Seems promising: https://jsonbin.io/pricing