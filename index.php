<?php

if(!file_exists('config.php')) {
    include('demo/instance.index.php');
} else {
    $instance = str_replace('.','',$_SERVER['REMOTE_ADDR']);
    $basepath = rtrim(str_replace("index.php", "", $_SERVER['SCRIPT_FILENAME']),"/");
    if(!file_exists($basepath.'/i/'.$instance)) {
        $command = $basepath.'/demo/createinstance.sh "'.$basepath.'" "'.$basepath.'/i" "'.str_replace('index.php', '', $_SERVER['REQUEST_URI']).'i" "'.str_replace('.','',$_SERVER['REMOTE_ADDR']).'"';
        $instance = shell_exec(escapeshellcmd($command));
    }
    $instanceurl = "i/".trim($instance)."/";

    ?>
    <!doctype html>

    <head>
        <meta charset="utf-8">
        <title>CODIAD Demo</title>
        <?php
        // Load System CSS Files
        $stylesheets = array("jquery.toastmessage.css","reset.css","fonts.css","screen.css");
       
        foreach($stylesheets as $sheet){
            echo('<link rel="stylesheet" href="themes/default/'.$sheet.'">');
        }
        
        ?>
        <link rel="icon" href="favicon.ico" type="image/x-icon" />
    </head>

    <body>
        <div id="installer">
            <h1>Codiad Demo Instance</h1>
            <?php if($instance != '') { ?>
            <p style="padding: 10px 0;">Your instance has been prepared sucessfully.<br>This demo application has some security restrictions.</p>
            <div class="install_issues">
                <p>Username: demo</p>
                <p>Password: demo</p>
            </div>
            <p style="padding: 10px 0; color: #a8a6a8;">Note: Each instance will be deleted after 30 minutes.</p>
            <button onclick="window.open('<?php echo $instanceurl;?>', '_self');">Start Codiad Demo</button>
            <?php } else { ?>
            <p style="padding: 10px 0;"><font color=red>Error</font> - Unable to generate instance.</p>
            <p style="padding: 10px 0; color: #a8a6a8;">Command: <?php echo $command; ?></p>
            <p style="padding: 10px 0; color: #a8a6a8;">Message: <?php echo print_r($instance); ?></p>
            <?php } ?>
        </div>
    </body>
    </html>
    <?php
}
?>

