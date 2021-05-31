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

require_once('common.php');

$action = POST("action");
$target = POST("target");

//////////////////////////////////////////////////////////////////////////////80
// Verify Session or Key
//////////////////////////////////////////////////////////////////////////////80
if ($action !== 'authenticate') {
	Common::checkSession();
}

if (!$action || !$target) {
	Common::send("error", "Missing target or action.");
}

if ($target === "i18n" && $action === "init") {
	$cache = array("cache" => $i18n->getCache());
	Common::send("success", $cache);
}

if (file_exists("components/$target/controller.php")) {
	require("components/$target/controller.php");
} elseif (file_exists("plugins/$target/controller.php")) {
	require("plugins/$target/controller.php");
} else {
	Common::send("error", "Bad target destination");
}