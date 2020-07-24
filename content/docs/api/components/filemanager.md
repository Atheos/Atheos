---
Title: Editor
Description: A summary of the Editor component
Date: 2020-07-10
Cache: true
---
# Atheos File Manager
## [atheos.filemanager](https://github.com/Atheos/Atheos/blob/master/components/file-manager/init.js)

## Summary:

Controls all actions with the file system and file manager dialog

## Methods:

**Pending Changes to Documentation**

    All underscores in function names are replaced by generic java naming convention.

Eg: filemanager.get_type({path}) becomes filemanager.getType({path})

**init**

    filemanager.init()

Initializes additional script and event listeners for the filemanager

**node_listener**

    filemanager.node_listener()

Listens for double-click and right-click events performed on objects in the filemanager

**context_menu_show**

    filemanager.context_menu_show({event},{path},{type})

Displays the context menu for objects in the filemanager and controls options available based on object type

**context_menu_hide**

    filemanager.context_menu_hides

Hides the instance of the context menu

**context_menu_event_listener**

    filemanager.context_menu_event_listener()

Listens for any events initiated from the context menu

**get_short_name**

    filemanager.get_short_name({path})

Returns the name of the file/directory without the full path

**get_extension**

    filemanager.get_extension({path})

Returns the extension of a file

**get_type**

    filemanager.get_type({path})

Returns `file`, `directory`, or `root`

**create_object**

    filemanager.create_object({parent},{path},{type})

Creates a new object based on parameters passed in

**index**

    filemanager.index({path},{rescan})

Outputs all contents from path into file tree. Rescan (T/F) is optional parameter, see `rescan` below

**rescan**

    filemanager.rescan({path})

Rescans and loads contents of folder at path supplied and any open children directories

**open_file**

    filemanager.open({path})

Retrieves contents of file and call new editor instance

**open_in_browser**

    filemanager.open_in_browser({path})

Opens file in new browser window

**save_file**

    filemanager.save_file({path},{content})

Saves the current file back to the file system

**create_node**

    filemanager.create_node({path},{type})

Creates a node for an object in the filemanager window

**copy_node**

    filemanager.copy_node({path})

Adds the path of the node to the clipboard object

**paste_node**

    filemanager.past_node({path})

Pastes content from the clipboard (via `path`) to the node supplied

**process_paste_node**

    filemanager.process_paste_node({path})

Helper function for `filemanager.paste_node()`

**rename_node**

    filemanager.rename_node({path})

Brings up rename dialog and processes rename request

**repath_subs**

    filemanager.repath_subs({path})

Repaths any open sub-nodes after a rename of a directory

**delete_node**

    filemanager.delete_node({path})

Deletes node element based on supplied path

**search**

    filemanager.search({path})

Opens file search (grep) dialog and process search at supplied path

**upload_to_node**

    filemanager.upload_to_node({path})

Calls upload dialog to allow uploading of files from local system

**download**

    filemanager.download({path})

Calls `download.php` handler to download copy of file or directory (tarball) to local system