<!doctype html>

<head>
    <meta charset="utf-8">
    <title>Atheos Style Guide</title>
    <link rel="stylesheet" href="themes/atheos/main.css">
    <style type="text/css">
        html { overflow: scroll; }
        body { width: 100%; margin: 0 auto; overflow: scroll; }
        td .icon { font-size: 30px; display: inline; padding-top: 0; margin-top: 0; }
        p { padding: 15px 0; margin: 0; font-weight: bold; }
        label { margin-top: 25px; }
        #container { width: 600px; margin: 50px auto; }
        .item-icon { float: right; }
    </style>
</head>

<body>

    <div id="container">

    <label>Form Fields</label>
    
    <p>Code:</p>
    
    <pre>&lt;input type=&quot;text&quot;&gt;
    
&lt;select&gt;
    &lt;option value=&quot;one&quot;&lt;Option One&lt;/option&gt;
    &lt;option value=&quot;two&quot;&lt;Option Two&lt;/option&gt;
    &lt;option value=&quot;three&quot;&lt;Option Three&lt;/option&gt;
&lt;/select&gt;


&lt;textarea&gt;&lt;/textarea&gt;</pre>

    <p>Output:</p>
    
    <input type="text">
    
    <select>
        <option value="one">Option One</option>
        <option value="two">Option Two</option>
        <option value="three">Option Three</option>
    </select>
    
    <textarea></textarea>

    <label>Buttons</label>
    
    <p>Code:</p>
    
    <pre>&lt;button class=&quot;btn-left&quot;&gt;Left Button&lt;/button&gt;&lt;button class=&quot;btn-mid&quot;&gt;Mid Button&lt;/button&gt;&lt;button class=&quot;btn-right&quot;&gt;Right Button&lt;/button&gt;</pre>
    
    <p>Output:</p>
    
    <button class="btn-left">Left Button</button><button class="btn-mid">Mid Button</button><button class="btn-right">Right Button</button>
    
    
    <br><br>
    <label>Icons</label>
    <p>
    	Icons are pulled from <a href="https://fontawesome.com/">Font-Awesome</a> for almost all interactive icons.
    	The only icons not pulled completely from Font Awesome is the file manager icons. Those are created by <a href="https://github.com/file-icons">File-Icos</a> using webfont.
    </p>

    </div>

</body>
</html>
