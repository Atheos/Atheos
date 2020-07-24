---
Title: Depndency Libraries
Description: A list of the various libraries used by Atheos IDE
Date: 2020-07-10
Cache: true
---
## Libraries used by Atheos:

Atheos makes use of a few libraries throughout it's codebase. While these are the links to the original Repos/Sources of these libraries, many of them have been modified to meet best pracitices, or for various reasons. It's recommended that if you want to learn more about the libraries used in Atheos, start with the source listed below, and then refer to the code itself packaged with Atheos itself.

## FrontEnd:
- [Ace Editor](https://ace.c9.io/): The Ace Editor is the fundemental Code Editor which Atheos wraps around. Without Ace, Atheos would be fundementally different if it existed at all.
- [Amplify](http://amplifyjs.com/): A custom event library, very useful. Seriously, check this library out if you're creating something with multiple modules.
- [Events.js](https://github.com/cferdinandi/events): Chris Ferdinandi's Event Delegation library is embedded in a slightly modifed form inside of Onyx.js.- 
- [File-Icons](https://github.com/websemantics/file-icons-js): WebFont for File Icons. Allows Atheos themes to extend color scheming into the file manager itself.
- [Synthetic](https://github.com/HLSiira/Synthetic): A mini script to create a really neat login/install screen.


## BackEnd:
- Minifier
- diff_match_patch
- mb_functions



## Misc:
There are a few other libraries built into Atheos that soon will be their own Repos and pages, but since they are still in development, they're own pages will have to wait.
- Onyx.js: A concentrated dom helper library
- Echo.js: An Ajax Library