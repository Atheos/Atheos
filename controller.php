<?php

//////////////////////////////////////////////////////////////////////////////80
// Atheos Controller
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once('common.php');

$action = Common::data("action");
$target = Common::data("target");

//////////////////////////////////////////////////////////////////////////////80
// Verify Session or Key
//////////////////////////////////////////////////////////////////////////////80
if ($action !== 'authenticate') {
	Common::checkSession();
}

if (!$action || !$target) {
	Common::sendJSON("E401m"); die;
}

if (file_exists("components/$target/controller.php")) {
	require("components/$target/controller.php");
} elseif (file_exists("plugins/$target/controller.php")) {
	require("plugins/$target/controller.php");
} else {
	Common::sendJSON("E401m"); die;
}