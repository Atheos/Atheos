<?php

/*
    *  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
    *  as-is and without warranty under the MIT License. See
    *  [root]/license.txt for more. This information must remain intact.
    */

require_once("../../common.php");
require_once("class.filemanager.php");

//////////////////////////////////////////////////////////////////
// Verify Session or Key
//////////////////////////////////////////////////////////////////

checkSession();

//////////////////////////////////////////////////////////////////
// Get Action
//////////////////////////////////////////////////////////////////
$action = Common::data("action");
if (!$action) {
	Common::sendJSON("error", "No Action Specified");
	exit;
}

//////////////////////////////////////////////////////////////////
// Ensure Project Has Been Loaded
//////////////////////////////////////////////////////////////////
$project = Common::data("project", "session");
$noReturn = Common::data("no_return");
if (!$project) {
	$action = "get_current";
	$noReturn = 'true';
	require_once('../project/controller.php');
}

//////////////////////////////////////////////////////////////////
// Security Check
//////////////////////////////////////////////////////////////////
$path = Common::data('path');

if (!checkPath($path)) {
	Common::sendJSON("error", "Invalid Path");
	exit;
}

//////////////////////////////////////////////////////////////////
// Handle Action
//////////////////////////////////////////////////////////////////
$Filemanager = new Filemanager($_GET, $_POST);
// $Filemanager->project = @$_SESSION['project']['path'];

$Filemanager->root = WORKSPACE;

switch ($action) {
	case 'index':
		$Filemanager->index();
		break;
	case 'find':
		$Filemanager->find();
		break;
	case 'open':
		$Filemanager->open();
		break;
	case 'open_in_browser':
		$Filemanager->openinbrowser();
		break;
	case 'create':
		$Filemanager->create();
		break;
	case 'delete':
		$Filemanager->delete();
		break;
	case 'modify':
		$Filemanager->modify();
		break;
	case 'duplicate':
		$Filemanager->duplicate();
		break;
	case 'upload':
		$Filemanager->upload();
		break;
	default:
		exit('{"status":"fail","data":{"error":"Unknown Action"}}');
	}