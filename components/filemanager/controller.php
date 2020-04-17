<?php

//////////////////////////////////////////////////////////////////////////////80
// FileManager Controller
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80
require_once("../../common.php");
require_once("class.filemanager.php");

//////////////////////////////////////////////////////////////////////////////80
// Verify Session or Key
//////////////////////////////////////////////////////////////////////////////80
Common::checkSession();

$action = Common::data("action");
$path = Common::data('path');
$project = Common::data("project", "session");
$noReturn = Common::data("no_return");

if (!$action) {
	Common::sendJSON("E401m");
	die;
}

if (!$project) {
	$action = "get_current";
	$noReturn = 'true';
	require_once('../project/controller.php');
}

//////////////////////////////////////////////////////////////////
// Security Check
//////////////////////////////////////////////////////////////////

if (!checkPath($path)) {
	Common::sendJSON("E430u");
	die;
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
	case 'open':
		Common::debug($path);
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