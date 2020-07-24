---
Title: Updating Ace Editor
Description: Instructions on updating the Ace Editor built inside of Atheos
Date: 2020-07-10
Cache: true
---

**How to manually upgrade to latest ACE version**

- Download latest package from https://github.com/ajaxorg/ace-builds
- Extract javascript-files from ```src-min-noconflict``` to ```components\editor\ace-editor```
- Open ```components\editor\ace-editor\ace.js``` and replace ```.ace_editor {position: relative;``` to ```.ace_editor {position: absolute;```

**(Optional) If new modes are included**

- Open ```components\editor\init.js``` and add new modes to the javascript array ```availableTextModes```
- Open ```components/fileext_textmode/class.fileextension_textmode.php``` and add them to array ```availableTextModes```

*(Optional) Add new modes for file extensions by default*

Open ```components/fileext_textmode/class.fileextension_textmode.php``` and add them to array ```defaultExtensions```

**(Optional) If new themes are included**

Open ```components\editor\dialog.php``` and add new themes to selectlist