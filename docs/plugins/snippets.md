This page is intends to show you some examples how to handle different usecases.

## Displaying a dialog window in your plugin

Normally your plugin should do something. Therefore often a small dialog window is required. How do we get it? First we need to edit our ``` dialog.php``` to add a small html snippet like 

```php
<?php
    // For config related stuff, we need to include the common.php
    require_once('../../common.php');   
    // also we check for authenitification
    checkSession();

    // let as switch between our different actions if we want to display different dialogs
    switch($_GET['action']){
        case 'example':
            echo '<b>Hello World</b>';
            break;           
    }   
?>
```
Saving that, we are also editing our ```init.js``` like

```
(function (global, $) {

    // get the relative path of our plugin
    var atheos = global.atheos,
        scripts= document.getElementsByTagName('script'),
        path = scripts[scripts.length-1].src.split('?')[0],
        curpath = path.split('/').slice(0, -1).join('/')+'/';

    $(window)
        .load(function() {
            // start the plugin
            atheos.example.init();
        });

    atheos.example = {

        controller: curpath + 'controller.php',
        dialog: curpath + 'dialog.php',

        init: function () {
            // use atheos functions to load a dialog with 500px width and our example
            atheos.modal.load(500, this.dialog + '?action=example');
        };
})(this, jQuery);
```

## Hooking into an existing function to provide a new functionallity

To provide new functionally, you can also extend existing functions by hooking into their method and overwritting it.

- Example for overwritting rightbar menu entries: 

```javascript
init: function () {
    // look for entry with specific onclick and replace it's onclick function
    $('#sb-right a[onclick="atheos.update.check();"]').attr("onclick", "atheos.autoupdate.check();");
}
```

- Example for overwritting filemanager contextmenu entries

```
init: function() {
    // look for menu entry and replace it's onclick function
    $('#context-menu a[onclick="atheos.filemanager.uploadToNode($(\\'#context-menu\\').attr(\\'data-path\\'));"]').attr("onclick", "atheos.demo.denied();");
}
```

Advanced example for overwritting dialogs:

```javascript
init: function() {
    $('#modal-content').hover(function() {
        // look for a link and replace it's onclick function
        $('#modal-content a[onclick=\\'atheos.plugin_manager.install();\\']').attr("onclick", "atheos.demo.denied();");
        // look for a set of buttons and replace it's onclick function
        $('#modal-content button[onclick*=\\'atheos.plugin_manager.install\\']').each(function() {
            $(this).attr("onclick", "atheos.demo.denied();");
        });
        // look for a inputfield by name and replace it's onclick function
        $('#modal-content input[name="project_path"]').attr("readonly", true);
    },function() {});
}
```

More examples could be found at https://github.com/atheos/atheosDemo/blob/master/demo/instance.instance.js