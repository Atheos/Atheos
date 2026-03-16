<?php

//////////////////////////////////////////////////////////////////////////////80
// Atheos Controller
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

set_error_handler(function($severity, $message, $file, $line) {
    if (error_reporting() & $severity) {
        throw new ErrorException($message, 0, $severity, $file, $line);
    }
});

require_once("common.php");

//////////////////////////////////////////////////////////////////////////////80
// Process Individual Requests
//////////////////////////////////////////////////////////////////////////////80
function processRequest() {
    global $i18n;


    $action = POST("action");
    $target = POST("target");
    $target = Common::cleanPath($target);

    try {

        //////////////////////////////////////////////////////////////////////////////80
        // Verify Session or Key
        //////////////////////////////////////////////////////////////////////////////80
        if ($action !== "authenticate") {
            Common::checkSession();
        }

        if (!$action) return Common::send(415, "missing_action");
        if (!$target) return Common::send(415, "missing_target");

        if ($target === "i18n" && $action === "init") {
            $cache = array("cache" => $i18n->getCache());
            Common::send(200, $cache);

        } elseif ($target === "core" && $action === "loadState") {
            $state = Common::loadState();
            Common::send(200, $state);

        } else {

            if (file_exists("components/$target/controller.php")) {
                require("components/$target/controller.php");
            } elseif (file_exists("plugins/$target/controller.php")) {
                require("plugins/$target/controller.php");
            } else {
                Common::send(416, "invalid_target");
            }
        }

    } catch (Exception $e) {
        Common::send(501, array(
            "target" => $target,
            "action" => $action,
            "error" => $e->getMessage()
        ));
    }
}

//////////////////////////////////////////////////////////////////////////////80
// Check for single vs batch request
//////////////////////////////////////////////////////////////////////////////80
if (POST("multiRequest")) {
    Common::$responseType = "batch";
    $requests = POST('requests') ?? [];

    foreach ($requests as $i => $req) {
        Common::$responseIndex = $i;
        Common::$debugStack = [];

        $_POST = $req;
        processRequest();
    }
    Common::$debugStack = [];
    Common::$responseType = "single";
    Common::send(200, Common::$responseStack);

} else {
    processRequest();
}