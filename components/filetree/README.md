# Atheos File Tree

## Description
The File Tree is the sidebar interface for a project’s folder structure that provides users the ability to interact with the directory similar to common to most folder explorers, supporting actions like creating, opening, renaming, and deletiing.

It does NOT handle file content directly, instead it relies on the Session Manager to load and save file content to/from the server.

## Methods
 - **init**: Initializes additional script and event listeners for the filetree
 - **toggleHidden**: Allows quick toggling of hidden files in the file tree
 - **nodeListener**: Listens for double-click and right-click events performed on objects in the filetree
 - **handleDrag**: Event handler for dragging items around within the file tree
 - **handleDrop**: Event handler for dropping/moving items within the file tree
 - **openDir**: Indexes a folder path into file tree. Rescan (T/F) is optional parameter, see `rescan` below
 - **createDirectoryItem**: Creates an html element for a directory item, either folder or file
 - **openFile**: Opens a file into the editor display

## Suggestions
 - Sort parent folder on renaming a file
 - DragNDrop is overly complex and hard to read
 - A few of the alert dialog boxes need to be rewritten