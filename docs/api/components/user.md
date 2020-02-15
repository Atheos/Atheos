# Atheos User Manager
## [atheos.user](https://github.com/Atheos/Atheos/blob/master/components/user/init.js)

## Summary:

Controls all actions dealing with system users

## Methods:

**init**

    user.init()

Initializes listener for login form

**authenticate**

    user.authenticate()

Authenticates contents of login form against user data

**logout**

    user.logout()  

Logs out currently active user

**list**

    user.list()

Opens user management dialog and lists all system users

**create_new**

    user.create_new()

Opens the user creation dialog and handles processing of creation form

**delete**

    user.delete({username})

Processes confirmation and deletes user

**password**

    user.password({username})

Opens password change dialog and processes change form

**project**

    user.project({project})

Changes the current users active project