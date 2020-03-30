<?php

/*
    *  Copyright (c) Codiad & daeks (codiad.com), distributed
    *  as-is and without warranty under the MIT License. See
    *  [root]/license.txt for more. This information must remain intact.
    */


require_once('../../common.php');
require_once('class.update.php');

//////////////////////////////////////////////////////////////////
// Verify Session or Key
//////////////////////////////////////////////////////////////////
checkSession();

//////////////////////////////////////////////////////////////////
// Get Action
//////////////////////////////////////////////////////////////////
$action = Common::data("action");
if (!$action) {
	Common::sendJSON("error", "Missing Action");
	die;
}

$update = new Update();

//////////////////////////////////////////////////////////////////
// Handle Action
//////////////////////////////////////////////////////////////////
switch ($action) {
	case 'init':
		$update->init();
		break;
	case 'check':
		$update->check();
		break;
	case 'get':
		$update->getLocalData();
		break;
	case 'set':
		$update->setLocalData();
		break;
	case 'optout':
		if (checkAccess()) {
			$update->optOut();
		}
		break;
	case 'optin':
		if (checkAccess()) {
			$update->optIn();
		}
		break;
	default:
		Common::sendJSON("E401i");
		die;
		break;
}