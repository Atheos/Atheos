---
Title: Updating Atheos
Description: Summary of how updating Atheos functions.
Date: 2020-07-10
Cache: true
---
# Updating Atheos

Atheos has a built in Update Check System, however does not have a system for actually updating the system itself, instead it relies on the admin to copy over the files itself. More information will be provided later as the update system is currently being rewrote.

## Manual Upgrade Guide

To upgrade simply delete everything except the following or move these folders to a new directory:

    /config.php
    /data
    /workspace
    /plugins
    /themes
    
Navigate to ```/themes``` and delete the ```default``` folder. Download the neweset verson from the Github repo and extract its content to the root directory of your Atheos installation.

Ensure that the files and folder mentioned above still have write capabilities.

## Future Plans
In the near future, Atheos will have an auto updating feature to allow admins a single click action to update their installations.