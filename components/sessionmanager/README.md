\--- Title: Active Description: A summary of the Active component Date: 2020-07-10 Cache: true ---

Active Component
================

The active component is used to track and manage all active editor sessions within an Atheos window.

[View source on Github](https://github.com/Atheos/Atheos/blob/master/components/active/init.js)

Memory
------

Memory

Description

Type

tabList

`Tab list of active files`

`Onyx object`

dropDownMenu

`Drop down list of active files`

`Onyx object`

sessions

`File paths of active tabs`

`object`

loopBehavior

`Loop through active files or dropdown menu`

`string`

dropDownOpen

`Current status of dropdown menu`

`["true" || "false"]`

Methods
-------

    atheos.active = {
    
    	init: function() {
    		// Establishes the session object
    	},
    
    	hasUnsavedChanges() {
    		// Identifies and returns paths for open files with unsaved changes
    	},
    
    	initTabListeners: function() {
    		// Initializes event listeners for the drop down menu and tab list
    	},
    
    	open: function(path, content, modifyTime, focus) {
    		// Opens selected file and establishes session settings
    	},
    
    	isOpen: function(path) {
    		// Determines if requested file is already open and returns respective session
    	},
    
    	getPath: function() {
    		// Gets the file path of the file currently being edited
    	},
    
    	check: function(path) {
    		// Check if opened by another user
    	},
    
    	add: function(path, session, focus) {
    		// Adds newly opened files to tab list 
    		// Checks if tab list is overflowed
    		// Adds path to server history
    	},
    
    	focus: function(path, direction) {
    		// Brings session into editors active focus
    	},
    
    	highlightEntry: function(path, direction) {
    		// Highlights active tab and moves it to the tab list if it was in the dropdown menu
    	},
    
    	markChanged: function(path) {
    		// Changes status to "changed"
    		// Registers change in tab list
    	},
    
    	save: function(path) {
    		// Saves the selected file
    	},
    
    	saveAll: function() {
    		// Saves all changed files
    	},
    
    	close: function(path) {
    		// Checks for unsaved changes
    		// Closes the selected file
    	},
    
    	closeAll: function() {
    		// Checks for unsaved changes
    		// Closes all sessions
    	},
    
    	remove: function(path) {
    		// Closes selected file without checking for unsaved changes
    	},
    
    	removeAll: function() {
    		// Closes all files without checking for unsaved changes
    	},
    
    	reload: function(path, focus) {
    		// Closes and reopens selected file
    	},
    
    	rename: function(oldPath, newPath) {
    		// Renames selected tab to new name
    	},
    
    	move: function(direction) {
    		// Changes the order of the selected tab in the tabList and drop down menu
    	},
    
    	moveTab: function(destination, listItem, direction) {
    		// Moves tab between the active tablist and the dropdown menu 
    	},
    
    	isTabListOverflowed: function(includeFictiveTab) {
    		// Checks if there is room to add another tab to the active tablist
    	},
    
    	updateTabDropdownVisibility: function() {
    		// Checks if tab needs to be moved to or from dropdown menu
    	},
    
    	createListItem: function(path) {
    		// Creates a new list item 
    	}
    };