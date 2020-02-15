# Atheos Chronometer
## [atheos.chrono](https://github.com/Atheos/Atheos/blob/master/components/poller/init.js)

## Summary:

The poller system runs a continual (interval) check of the system. It can be used to check authentication, file interaction, etc

## Methods:

**init**

    poller.init()

Starts the poller interval and calls any startup functions

**check_auth**

    poller.check_auth()

Checks to ensure user session exists (and as a keep-alive). Also checks to ensure the user account has not been deleted from the system.

**save_drafts**

    poller.save_drafts()

Runs on interval to save draft of edits to local storage, allowing for recovery should browser crash or session timeout