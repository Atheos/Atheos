<?php

/*
    *  Copyright (c) Codiad & daeks (codiad.com), distributed
    *  as-is and without warranty under the MIT License. See
    *  [root]/license.txt for more. This information must remain intact.
    */


require_once('../../common.php');
require_once('class.update.php');

//////////////////////////////////////////////////////////////////
// Get Action
//////////////////////////////////////////////////////////////////

if (!empty($_GET['action'])) {
	$action = $_GET['action'];
} else {
	exit('{"status":"error","data":{"error":"No Action Specified"}}');
}

//////////////////////////////////////////////////////////////////
// Verify Session or Key
//////////////////////////////////////////////////////////////////

checkSession();

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
		exit('{"status":"fail","data":{"error":"Unknown Action"}}');
	}