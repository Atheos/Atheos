---
Title: Editor
Description: A summary of the Editor component
Date: 2020-07-10
Cache: true
---
# Editor Component for Atheos
## [atheos.editor](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js)

---------------------------

Manage the lifecycle of Editor instances


---




### Methods:


-  **[getSettings](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L53)**


   Retrieve editor settings from localStorage


-  **[addInstance](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L86)**


   Create a new editor instance attached to given session

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>session</td><td>EditSession</td><td> Session to be used for new Editor instance</td></tr>

   </table>


-  **[exterminate](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L114)**


   Remove all Editor instances and clean up the DOM


-  **[removeSession](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L129)**


   Detach EditSession session from all Editor instances replacing

   them with replacementSession


-  **[forEach](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L149)**


   Convenience function to iterate over Editor instances

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>fn</td><td>Function</td><td> callback called with each member as an argument</td></tr>

   </table>


-  **[getActive](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L164)**


   Get the currently active Editor instance

   In a multi-pane setup this would correspond to the

   editor pane user is currently working on.


-  **[setActive](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L177)**


   Set an editor instance as active

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>i</td><td>Editor</td><td></td></tr>

   </table>


-  **[setSession](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L193)**


   Change the EditSession of Editor instance

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>session</td><td>EditSession</td><td></td></tr>

   <tr><td>i</td><td>Editor</td><td></td></tr>

   </table>


-  **[selectMode](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L211)**


   Select file mode by extension

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>e</td><td>String</td><td> File extension</td></tr>

   </table>


-  **[setMode](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L252)**


   Set the editor mode

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>m</td><td>TextMode</td><td> mode</td></tr>

   <tr><td>i</td><td>Editor</td><td> Editor (Defaults to active editor)</td></tr>

   </table>


-  **[setTheme](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L290)**


   Set the editor theme

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>t</td><td>String</td><td> theme eg. twilight, cobalt etc.</td></tr>

   <tr><td>i</td><td>Editor</td><td> Editor instance (If omitted, Defaults to all editors)</td></tr>

   </table>

   For a list of themes supported by Ace - refer :

   **https** : //github.com/ajaxorg/ace/tree/master/lib/ace/theme

   **TODO** :  Provide support for custom themes


-  **[setContent](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L317)**


   Set contents of the editor

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>c</td><td>String</td><td> content</td></tr>

   <tr><td>i</td><td>Editor</td><td> (Defaults to active editor)</td></tr>

   </table>


-  **[setFontSize](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L336)**


   Set Font Size

   Set the font for all Editor instances and remember

   the value for Editor instances to be created in

   future

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>s</td><td>Number</td><td> font size</td></tr>

   <tr><td>i</td><td>Editor</td><td> Editor instance  (If omitted, Defaults to all editors)</td></tr>

   </table>


-  **[setHighlightLine](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L361)**


   Enable/disable Highlighting of active line

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>h</td><td>Boolean</td><td></td></tr>

   <tr><td>i</td><td>Editor</td><td> Editor instance ( If left out, setting is</td></tr>

   </table>

   applied to all editors )


-  **[setPrintMargin](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L384)**


   Show/Hide print margin indicator

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>p</td><td>Number</td><td> print margin column</td></tr>

   <tr><td>i</td><td>Editor</td><td>  (If omitted, Defaults to all editors)</td></tr>

   </table>


-  **[setIndentGuides](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L407)**


   Show/Hide indent guides

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>g</td><td>Boolean</td><td></td></tr>

   <tr><td>i</td><td>Editor</td><td>  (If omitted, Defaults to all editors)</td></tr>

   </table>


-  **[setCodeFolding](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L430)**


   Enable/Disable Code Folding

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>f</td><td>Boolean</td><td></td></tr>

   <tr><td>i</td><td>Editor</td><td>  (If omitted, Defaults to all editors)</td></tr>

   </table>


-  **[setWrapMode](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L450)**


   Enable/Disable Line Wrapping

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>w</td><td>Boolean</td><td></td></tr>

   <tr><td>i</td><td>Editor</td><td>  (If omitted, Defaults to all editors)</td></tr>

   </table>


-  **[getContent](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L471)**


   Get content from editor

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>i</td><td>Editor</td><td> (Defaults to active editor)</td></tr>

   </table>


-  **[resize](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L491)**


   Resize the editor - Trigger the editor to readjust its layout

   esp if the container has been resized manually.

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>i</td><td>Editor</td><td> (Defaults to active editor)</td></tr>

   </table>


-  **[changeListener](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L507)**


   Mark the instance as changed (in the user interface)

   upon change in the document content.

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>i</td><td>Editor</td><td></td></tr>

   </table>


-  **[getSelectedText](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L523)**


   Get Selected Text

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>i</td><td>Editor</td><td> (Defaults to active editor)</td></tr>

   </table>


-  **[insertText](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L539)**


   Insert text

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>val</td><td>String</td><td> Text to be inserted</td></tr>

   <tr><td>i</td><td>Editor</td><td> (Defaults to active editor)</td></tr>

   </table>


-  **[gotoLine](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L555)**


   Move the cursor to a particular line

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>line</td><td>Number</td><td> Line number</td></tr>

   <tr><td>i</td><td>Editor</td><td> Editor instance</td></tr>

   </table>


-  **[focus](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L570)**


   Focus an editor

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>i</td><td>Editor</td><td> Editor instance (Defaults to current editor)</td></tr>

   </table>


-  **[cursorTracking](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L586)**


   Setup Cursor Tracking

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>i</td><td>Editor</td><td> (Defaults to active editor)</td></tr>

   </table>


-  **[bindKeys](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L609)**


   Setup Key bindings

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>i</td><td>Editor</td><td></td></tr>

   </table>


-  **[openSearch](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L670)**


   Present the Search (Find + Replace) dialog box

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>type</td><td>String</td><td> Optional, defaults to find. Provide 'replace' for replace dialog.</td></tr>

   </table>


-  **[search](https://github.com/Atheos/Atheos/blob/master/components/editor/init.js#L691)**


   Perform Search (Find + Replace) operation

   

   **Parameters:**

   <table>

   <tr><th>Parameter</th><th>Type</th><th>Details</th></tr>

   <tr><td>action</td><td>String</td><td> find | replace | replaceAll</td></tr>

   <tr><td>i</td><td>Editor</td><td> Defaults to active Editor instance</td></tr>

   </table>


