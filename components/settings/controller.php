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
$settings = Common::data("settings");
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
		if ($settings) {
			$Settings->username = $user;
			$Settings->settings = json_decode($settings, true);
			$Settings->Save();
		} else {
			Common::sendJSON("E403m", "Settings");

		}

		break;

	//////////////////////////////////////////////////////////////////
	// Load User Settings
	//////////////////////////////////////////////////////////////////
	case "load":
		$Settings->username = $user;
		$Settings->Load();

		break;
	default:
		Common::sendJSON("E401i");
		break;

}