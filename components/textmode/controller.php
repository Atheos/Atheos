<?php

//////////////////////////////////////////////////////////////////////////////80
// TextMode
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @ccvca, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once('../../common.php');
require_once 'class.textmode.php';

Common::checkSession();

$action = Common::post('action');

if ($action) {
	
	$TextMode = new TextMode();

	switch ($action) {
		case 'setTextModes':
			if (Common::checkAccess()) {
				$TextMode->setTextModes();
			} else {
				die(Common::sendJSON("error", "You are not allowed to edit the file extensions."));
			}
			break;
		case 'getTextModes':
			$TextMode->getTextModes();
			break;
		default:
			die(Common::sendJSON("error", "invalid action"));
			break;
	}

} else {
	die(Common::sendJSON("error", "missing action"));
}