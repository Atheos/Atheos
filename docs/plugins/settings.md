## Summary:
Plugins are able to hook into the settings of Atheos since v2.5.0 to provide their own config on a common place.

### How to add your plugin to the settings
Expand your ``plugin.json``:
``` json
[{ "author" : "Your Name",
  "version": "Your Version",
  "name" : "Your Plugin Name",
  "url" : "Your Repositry Url",
  "exclude" : "",
  "rightbar" : [{
    "action" : "atheos.yourplugin.doSomething();",
    "icon" : "icon-info-circled",
    "title" : "This will be displayed in the rightbar"
  }],
  "contextmenu" : [{
    "action" : "atheos.yourplugin.doSomething();",
    "icon" : "icon-info-circled",
    "applies-to" : "both",
    "title" : "This will be displayed in the contextmenu"
  }],
  "config": [{
    "file": "dialog.php",
    "icon": "icon-info-circled",
    "title": "This will be displayed in the sidebar of the settings dialog"
  }]
}]
```
Your ``file`` provides your configs as html file. You can expand this entry with GET parameters.

### Saving logic
Each input field with the html class ``setting`` are automaticly saved in the localStorage with the key which has to be provided as ``data-setting`` attribute. For an example see: [settings.system.php](https://github.com/Atheos/Atheos/tree/master/components/settings/settings.system.php#L12).

If you want to implement a more complex logic like preprocessing your configs use the amplify publication ``settings.dialog.save``.

### Syncing logic
The user decides whether the settings of plugins are synced or not. Please respect that. In order to grant this save your configs with a key that starts with ``atheos.plugin.`` in the localStorage.

If you want to modify (change, add or delete) your configs before the synchronisation listen to the amplify publication ``settings.save``.

### React on changes
To react on changed settings listen to the amplify publication ``settings.changed``.
```js
amplify.subscribe('settings.changed', function(){
    //React here on changed settings
});
```