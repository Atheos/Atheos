# Atheos File Manager

## Description
Controls all actions within the file system as well as rending the sidebar filemanager.

## Methods
 - **init**: Initializes additional script and event listeners for the filemanager
 - **toggleHidden**: Allows quick toggling of hidden files in the file tree
 - **nodeListener**: Listens for double-click and right-click events performed on objects in the filemanager
 - **handleDrag**: Event handler for dragging items around within the file tree
 - **handleDrop**: Event handler for dropping/moving items within the file tree
 - **openDir**: Indexes a folder path into file tree. Rescan (T/F) is optional parameter, see `rescan` below
 - **createDirectoryItem**: Creates an html element for a directory item, either folder or file
 - **openFile**: Opens a file into the editor display

## Suggestions
 - Sort parent folder on renaming a file
 - DragNDrop is overly complex and hard to read
 - A few of the alert dialog boxes need to be rewritten