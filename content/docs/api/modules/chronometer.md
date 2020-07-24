---
Title: Chronometer
Description: A summary of the Chronometer module
Date: 2020-07-10
Cache: true
---
# [The Chronometer Module](https://github.com/Atheos/Atheos/blob/master/modules/chronometer/init.js)
## Description
The Chronometer Module sets global intervals that are published through Amplify subscriptions; allowing the client browser to only have a select few Intervals running while providing plugins the ability to use timed events.

---
## Chronometer Methods:

### init()
This method sets three seperate interval timers in motion that publish named Amplify events at specific intervals that other modules can subscribe to using Amplify. 
* `kilo`: publishes an event every 1000 milliseconds (1 second)
* `mega`: publishes an event every 10000 milliseconds (10 seconds)
* `giga`: publishes an event every 100000 milliseconds (100 seconds)

```javascript
function example() {
    amplify.subscribe('chrono.kilo', function() {
        console.log("This will log every 1 second");
    }
    amplify.subscribe('chrono.mega', function() {
        console.log("This will log every 10 second");
    }
    amplify.subscribe('chrono.giga', function() {
        console.log("This will log every 100 second");
    }    
}
```
