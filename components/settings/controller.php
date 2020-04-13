<?php

/*
    *  Copyright (c) Codiad & Andr3as, distributed
    *  as-is and without warranty under the MIT License. See
    *  [root]/license.txt for more. This information must remain intact.
    */

require_once('../../common.php');
require_once('class.settings.php');

//////////////////////////////////////////////////////////////////
// Verify Session or Key
//////////////////////////////////////////////////////////////////
checkSession();

$action = Common::data("action");

$key = Common::data("key");
$value = Common::data("value");

$user = Common::data("user", "session");


if (!$action) {
	Common::sendJSON("E401m");
	die;
}

$Settings = new Settings();

switch ($action) {

	//////////////////////////////////////////////////////////////////
	// Save User Settings
	//////////////////////////////////////////////////////////////////
	case "save":
		if ($key && $value) {
			$Settings->username = $user;

			$Settings->save($key, $value);
		} else {
			Common::sendJSON("E403g");

		}
		break;

	//////////////////////////////////////////////////////////////////
	// Load User Settings
	//////////////////////////////////////////////////////////////////
	case "load":
		$Settings->username = $user;
		$Settings->load();

		break;

	default:
		Common::sendJSON("E401i");
		break;
}