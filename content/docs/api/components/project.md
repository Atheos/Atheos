---
Title: Project Manager
Description: A summary of the Project Manager component
Date: 2020-07-10
Cache: true
---
# Atheos Project Manager
## [atheos.project](https://github.com/Atheos/Atheos/blob/master/components/project/init.js)

## Summary:

Projects are the core containers for all files and folders and are created at the root level of the `workspace` directory. The `project` object is used to interact with the projects on the system.

## Methods:

**init**

    project.init()

Loaded on startup, calls any other functions tied to projects

**load_current**

    project.load_current()

Accesses the users session and loads currently active project

**open**

    project.open({path})

Opens project based on path (from workspace/)

**list**

    project.list()

Opens project manager dialog and lists all projects

**create**

    project.create()

Opens the New Project dialog and handles response

**delete**

    project.delete({name},{path})

Opens the Project Delete dialog and handles response

**get_current**

    project.get_current();

Returns the currently opened project