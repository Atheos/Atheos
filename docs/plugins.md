## Creating a Plugin
The Atheos FrontEnd at it's core is a JavaScript Object, and as such, it is easy to add your own module as a key to the Atheos Object. Most of the components and modules that are built into Atheos by default publish Amplify events during actions, allowing a plugin to subscribe and modify them. In fact, a module can be completely rewritten as plugins are loaded last.

In order to have your plugin added to the official list, please email the Atheos dev team (info@atheos.io). If you have any questions or are planning on creating a plugin and simply want to talk about your idea, we highly encourage you to send an email. Sadly many of the plugins on the market today try to reinvent existing functions within Atheos because they didn't know that Atheos already had built in, and if your plugin requires something that Atheos doesn't provide natively, it's possible we can add it as well.

Snippets can be found at [here](/docs/plugins/snippets)

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
The user decides whether the settings of plugins are synced or not. Please respect that. In order to grant this save your configs with a key that starts with ``Atheos.plugin.`` in the localStorage.

If you want to modify (change, add or delete) your configs before the synchronisation listen to the amplify publication ``settings.save``.

### React on changes
To react on changed settings listen to the amplify publication ``settings.changed``.
```js
amplify.subscribe('settings.changed', function(){
    //React here on changed settings
});
```