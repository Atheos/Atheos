<?php

//////////////////////////////////////////////////////////////////////////////80
// Transfer Dialog
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

$path = POST("path");


function bytes(string $size) {
    $size = trim($size);
    $matches = [];
    preg_match("/([0-9]+)[\s]*([a-zA-Z]+)/", $size, $matches);

    $value = (isset($matches[1])) ? $matches[1] : 0;
    $metric = (isset($matches[2])) ? strtolower($matches[2]) : "b";

    switch ($metric) {
        case "b" : return (int)$value;
        case "k" :
        case "kb" : return (int)$value * 1024;
        case "m" :
        case "mb" : return (int)$value * (1024 ** 2);
        case "g" :
        case "gb" : return (int)$value * (1024 ** 3);
        case "t" :
        case "tb" : return (int)$value * (1024 ** 4);
        default : return 0;
    };
}

function human($bytes) {
    if ($bytes >= 1024 ** 4) {
        return round($bytes / (1024 ** 4), 2) . ' TB';
    } elseif ($bytes >= 1024 ** 3) {
        return round($bytes / (1024 ** 3), 2) . ' GB';
    } elseif ($bytes >= 1024 ** 2) {
        return round($bytes / (1024 ** 2), 2) . ' MB';
    } elseif ($bytes >= 1024) {
        return round($bytes / 1024, 2) . ' KB';
    } else {
        return $bytes . ' B';
    }
}

function maxUpload() {
    $max_upload = bytes(ini_get("upload_max_filesize"));
    $max_post = bytes(ini_get("post_max_size"));
    $memory_limit = bytes(ini_get("memory_limit"));
    
    $max = min($max_upload, $max_post, $memory_limit);

    return [
        "b" => $max,
        "h" => " (Max: " . human($max). ")"
    ];
}

switch ($action) {

    //////////////////////////////////////////////////////////////////////////80
    // Upload
    //////////////////////////////////////////////////////////////////////////80
case "upload":
    if (!Common::isAbsPath($path)) {
        $path .= "/";
    }

    $max = maxUpload();

    ?>
    <label class="title"><i class="fas fa-upload"></i><?php echo i18n("filesUpload") . $max["h"]; ?></label>
    <form class="transfer" enctype="multipart/form-data">
        <pre><?php echo($path); ?></pre>
        <label id="upload_wrapper">
            <?php echo i18n("dragFilesOrClickHereToUpload"); ?>
            <input type="hidden" name="MAX_FILE_SIZE" value="<?php echo $max["b"]; ?>">
            <input class="hidden" type="file" name="upload[]" multiple>
        </label>
        <div id="progress_wrapper">
        </div>
    </form>


    <?php
    break;

    //////////////////////////////////////////////////////////////////////////80
    // Default: Invalid Action
    //////////////////////////////////////////////////////////////////////////80
default:
    Common::send(416, "Invalid action.");
    break;
}