# Upcoming changes, features, or fixes for Atheos
================================================================================
Mainly for use by @hlsiira, this file also serves as transparency for anyone who
is curious, or looking for a place to help with the project.

## Global:
- [ ] Condense element IDs for easier changeability. Current CSS files have them scattered.
- [ ] Integrate complex return codes.
- [ ] Use JWTs for distributed installs.
- [ ] Consider integrating collaboration into the project.
- [ ] Evaluate SQLite3's fit.
- [ ] Rework theme setting using CSS variables.
- [ ] Streamline error codes: `status.file.function`.
- [ ] Draft an overview document for Atheos. Focus on a JSON marketplace.
- [ ] Review the security of Atheos, see how things flow and how things are stored vs what's available to the public, especially the username/passwords. It's been a while since reviewed. 
- [ ] Private home workspaces / leverage the demo? 
- [ ] Clean up homepage website 
- [ ] Need to move to new load order system. 
- [ ] Build Demo system for website 
- [ ] All the init functions might be out of order in regards to how they are instantiated. 
- [ ] Add the ability to enable or disable dev mode by typing in a specific phrase at any time 
- 
## FrontEnd:
- [ ] Need to implement a working crash log and global error system: Atheos should cache a global stack trace of sorts when an exception occurs to better suit bug reporting. While most of the issues that I've received are descriptive enough, it wuld be nice to be able to ask for them to grab a specific file from such and such location and upload it: A stack trace of what JS was trying to do, and potentially a list of the last X number of commands issued to the server [Reference](https://www.sitepoint.com/proper-error-handling-javascript/)

- [ ] Toast messages should be stored somewhere, not just lost forever.
- [ ] Implement FlexBox for frontend design, such as how Aura works, higher performance.
- [ ] Direct feedback button to allow people to send me messages directly from Atheos.

# Controller Uniformity:
- [ ] Change the return to utilize i18n "invalid_action", such as CodeGit

## Infrastructure:
- [ ] Find a reliable host for JSON files, instead of my server [Potential](https://jsonbin.io/pricing)
- [ ] Allow voting or suggesting core functions for Atheos.

## Backend:
- [ ] Secure/hide JSON data within a PHP file, such as how old Codiad did it.
- [ ] Remove project basepaths from File Paths while displaying, so not everything is displayed.

## Atheos Website:
- [ ] Complete Atheos Documentation site.
- [ ] Implement a contact form.

## Security:
- [ ] Integrate JWT token, allow an enterprise to set up distributed installs
- [ ] Detect unsecured connection attempts, such as non-https using secureJS

## Pull into Project:
- [Spacing in CSS](https://ishadeed.com/article/spacing-in-css/)
- [Peekobot Repo](https://github.com/peekobot/peekobot)
- [Gitpushub Repo](https://github.com/miconda/gitpushub)
- [Simple PHP Logger](https://github.com/advename/Simple-PHP-Logger)

## Components
- [ ] Fix file preview system 
- [ ] There is a new modal listener relationship style that looks a lot cleaner. 
- [ ] They need to be listener on instead of listener once I think from now on. 
- [ ] Modal can handle objects now and post to load dialogs, dialogs need to be caught up on new standards. 

### Active
- [ ] Add Tab Color Customizer / Selection by Extension 

### User
- [ ] Login and Installation Screens should be overlays 
- [ ] There is no brute force protection as far as I can tell 
- [ ] The admin should be able to set a temp password field for users in order to login and change their own passwords 

### Update
- [ ] Rebuild update check with new versioning system 
- [ ] All alerts need to move to new object key pair system, get rid of unnecessary positive negative system. 
- [ ] Modal needs to be unloaded on every successful interaction. 
### Marketplace
- [ ] The marketplace needs a review: There isn't a search feature, nor ratings. Might be worth adding a whole separate site for it and be done with it. 
### Installation
- [ ] During install, an option to set the mode to single user mode with no username required upon login would be nice 
- [ ] During install, you should be able to add a function send an alert email if certain conditions are met, like a brute force attempt 

### Settings
- [ ] Develop a custom KeyBinding menu in the settings window.
- [ ] Add an option to disable all animations, including the background.
- [ ] Option to disable the username box, such as on a single-user install
- [ ] Allow users to enable/disable plugins in settings.
- [ ] Reclassify the alert, Modal, and Toast for multiple window support.

### Codegit
- [ ] trait/execute: $result needs to be either imploded or exploded into an array
- [ ] Updating Codegit to use more well-rounded execute function
	- [ ] Update files to match new return
		- [?] Branches
		- [ ] Commit
		- [ ] Execute
		- [ ] History
		- [ ] Initialize
		- [ ] Remotes
		- [ ] Settings
		- [?] Status
		- [?] Transfer

### Project Management
- [ ] Add the ability to show/hide projects in the sidebar
- [ ] Show/hide projects in the project sidebar on a per user basis 
- [ ] loadChanges in traits/status won't render anything when viewing overlay if the status fails.

## Rewrite data exchange to use HTTP status codes
- [ ] Don't forget to update plugins
- [X] Atheos controller
- [X] Atheos language system?
- [ ] Change the user.keepAlive to failure function
- [?] Update toast to use numbers
- [?] components/active
- [?] components/analytics
- [?] components/codegit
- [ ] components/codegit init.js checkRepoStatus is strange
- [?] components/contextmenu
- [?] components/draft
- [?] components/filemanager
- [?] components/install
- [?] components/macro
- [X] components/market
- [?] components/project
- [X] components/scout
- [X] components/settings
- [X] components/sidebars
- [X] components/textmode
- [X] components/transfer
- [X] components/update
- [?] components/user
- [X] components/worker

## Maybe One Day
- [ ] Remove FontAwesome in favor of SVGs, either TinyIcons or something. 
- [ ] SVN Support, similar to Git but not as common 
- [ ] Cached project states, allowing someone to quickly switch projects, mainly file explorer. 
- [ ] Implement a .matches parameter, something like passing a function, in the contextmenu/filemanager to allow plugins to search based on their own parameters 

## i18n Language Review
- [ ] Actively maintain i18n. Allow plugins to include language files.

## InProgress

## Plugin Ideas
- [ ] ToDo Plugin: Set a time and a description and the toast will pop up to notify you, or even just a rolling list of things to do with a project 
- [ ] Disable / Enable plugins by adding a file inside the plugin folder called enable/disable. 
