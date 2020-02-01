## Summary:

Plugins are extensions to Codiad's core functions. Each plugin is stored in the plugins folder and can be enabled/disabled individually. They are stored in the plugins folder and loaded automatically to the system. By default, the plugin is not enabled and has to be enabled by an administrator.

## How to add a new plugin to Codiad

Put the folder of your plugin into the plugins folder. Enable it in the "Plugins" menu

## How to get your own plugin into the marketplace

If you would like to submit a plugin, please email the GitHub repository and information about your plugin to dev[at]codiad.com. Please note: While we test plugins before adding them to this list we cannot guarantee quality or provide any warranty. If you have any issues please address them directly with the plugin author. All plugins are also listed on http://market.codiad.com/

## How to write own plugins

Each plugin needs at least 2 files to have in its directory. There is also a template available at https://github.com/Codiad/Codiad-Plugin-Template

**Meta Data File**

    plugin.json

Plugin file contains information about the plugin, like name or author. It is formatted in JSON:

    [{ "author" : "Your Name",
        "version": "Your Version",
        "name" : "Your Plugin Name",
        "url" : "Your Repositry Url",
        "exclude" : "",
        "rightbar" : [{
            "action" : "codiad.yourplugin.doSomething();",
            "icon" : "icon-info-circled",
            "admin" : false,
            "title" : "This will be displayed in the rightbar"
            }],
        "bottombar" : [{
            "action" : "codiad.yourplugin.doSomething();",
            "icon" : "icon-info-circled",
            "admin" : false,
            "title" : "This will be displayed in the bottombar"
            }],
        "contextmenu" : [{
            "action" : "codiad.yourplugin.doSomething();",
            "icon" : "icon-info-circled",
            "admin" : false,
            "applies-to" : "both",
            "title" : "This will be displayed in the contextmenu"
            }]
        }]

A list of all icons can be found in style_guide.php of your installation. The ```rightbar``` section, the ```contextmenu``` section, the ```admin``` flag and the ```exclude``` is optional and not required. 

**How to assign a preview to the market**

Just attach a screenshot, named ```screen.png```, to your repository.

**Include to Settings dialog** 

See [Settings & Plugins](https://github.com/Codiad/Codiad/wiki/Settings-and-plugins)

**Using the exclude function**

The ```exlude``` defines files or directories which are not changed during an automated update through the plugin manager. 

`"exlude" : "data,config.json"` will not modify the directory `data` and `config.json` from automatic updates

**Javascript File**

    init.js
    
Loaded on startup, calls any other functions if required

    (function(global, $){

        var codiad = global.codiad;

        $(function() {
            codiad.yourplugin.init();
        });

        codiad.yourplugin = {

            init: function() {
            },

            doSomething: function() {
                alert('Hello World');
            }
        };
    })(this, jQuery);
    

**(Optional) CSS File**

    screen.css
    
Used for adding your custom style classes. Can be stored in your plugins folder or assigned to a theme.

## Quality Guideline

Depending of your functionally, we suggest you to use a three tier model, having a class, a controller and a dialog for your plugin.

``` 
/class.yourplugin.php
/controller.php
/dialog.php
```

The javascript part of your plugin should communicate with the controller for non-gui actions and with the dialog for gui-actions.