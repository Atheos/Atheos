---
Title: Workspace Pathing
Description: A guide to the main principles behind how Atheos handles the file management.
Date: 2020-07-10
Cache: true
---
Almost immediately after launch many people asked 'how do I point to live sites outside of the `workspace`?' or similar questions. In order to address this, here are 2 official suggestions.

## Absolute Path Projects

atheos supports having projects outside of the `workspace`. You just have to enter the absolute path to your desired folder during the project creation.

    UNIX: /var/www/sites/my_project
    WIN: E:/www/sites/my_project

Note: Absolute paths are restricted by whitelisting in the config.php. Only included paths are allowed to be used during project creation. To add other paths except your workspace, you have to modify

    define("WHITEPATHS", BASE_PATH . ",/home");

## Symlink Workspace Projects

Let's say you have a standard install of Apache where the webroot is `/var/www`. You install atheos to the root level at `/var/www/atheos`.

If you started a project called `my_project` it's contents would reside at...

    /var/www/atheos/workspace/my_project

Now, let's say you have a Virtual Host pointing to a directory that houses the live version of this project at...

    /var/www/sites/my_project

Your goal is to be able to edit the files on the live site. This can be achieved in several ways with the system, but the most successful (and recommended) method is with a link.

## The Solution

First, make sure you've created the project in atheos, then using either the terminal built into atheos, or via SSH or another CLI access method simply recreate the project folder via the following:

1. Remove the existing folder:

    `rm -rf /var/www/atheos/workspace/my_project`

_Notice: Please make sure that `/var/www/atheos/workspace/my_project` does not contain any needed files._

2. Recreate the path as a link:

    `ln -s /var/www/sites/my_project /var/www/atheos/workspace/my_project`

Where the `ln -s` is followed by the path to the live site, then followed by the path where the project workspace resided.

This will create a link so your server sees all of the contents of the live site in the workspace path where it expects to see it.

**Important Note**

Keep in mind - this will point the folder, but you'll still need to make sure the system has permissions to write to the directory. If your server is running suPHP or elevated permissions on PHP processes this won't be an issue, however, adding write capabilities to a live site can be a security issue. The point of the `workspace` is giving the ability to isolate writing to a specific directory.

rm -rf will delete any folder, subfolder and file that you put after it, so if you put rm -rf / it will delete all files on your system ( or at least all of them you have permission to delete ), so be very careful with this command
