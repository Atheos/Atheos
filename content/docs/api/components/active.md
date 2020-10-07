---
Title: Active
Description: A summary of the Active component
Date: 2020-07-10
Cache: true
---
<section>
   <h1>Active Component</h1>
   <p>
      The active component is used to track and manage all active editor sessions within an Atheos window.
   </p>
   <a href="https://github.com/Atheos/Atheos/blob/master/components/active/init.js" class="btn download">View source on Github</a>
</section>
<section>
   <h2>Memory</h2>
   <div class="argTable">
      <table>
         <tr>
            <th>Memory</th>
            <th>Description</th>
            <th>Type</th>
         </tr>
         <tr>
            <td>tabList</td>
            <td><code>Tab list of active files</code></td>
            <td><code>Onyx object</code></td>
         </tr>
          <tr>
            <td>dropDownMenu</td>
            <td><code>Drop down list of active files</code></td>
            <td><code>Onyx object</code></td>
         </tr>
          <tr>
            <td>sessions</td>
            <td><code>File paths of active tabs</code></td>
            <td><code>object</code></td>
         </tr>
          <tr>
            <td>loopBehavior</td>
            <td><code>Loop through active files or dropdown menu</code></td>
            <td><code>string</code></td>
         </tr>
         <tr>
            <td>dropDownOpen</td>
            <td><code>Current status of dropdown menu</code></td>
            <td><code>["true" || "false"]</code></td>
         </tr>
      </table>
   </div>
</section>
<section>
   <h2>Methods</h2>
	<pre><code>atheos.active = {

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
};</code></pre>
  
</section>