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

$dest = Common::data('dest');
$name = Common::data('name');
$path = Common::data('path');
$type = Common::data('type');

$modifyTime = Common::data('modifyTime');
$content = Common::data('content');
$patch = Common::data('patch');
$type = Common::data('type');

//////////////////////////////////////////////////////////////////
// Security Check
//////////////////////////////////////////////////////////////////
$path = Common::getWorkspacePath($path);
$dest = Common::getWorkspacePath($dest);

$project = Common::data("project", "session");
$noReturn = Common::data("no_return");

if (!$action) {
	Common::sendJSON("E401m"); die;
}

if (!$project) {
	$action = "get_current";
	$noReturn = 'true';
	require_once('../project/controller.php');
}

//////////////////////////////////////////////////////////////////
// Handle Action
//////////////////////////////////////////////////////////////////
$Filemanager = new Filemanager();

switch ($action) {
	case 'index':
		$Filemanager->index(Common::data('path'));
		break;
	case 'open':
		$Filemanager->open($path);
		break;
	case 'create':
		$Filemanager->create($path, $type);
		break;
	case 'delete':
		$Filemanager->delete($path);
		break;
	case 'rename':
		$Filemanager->rename($path, $name);
		break;
	case 'save':
		$Filemanager->save($path, $modifyTime, $patch, $content);
		break;
	case 'modify':
		$Filemanager->modify();
		break;
	case 'duplicate':
		$Filemanager->duplicate($path, $dest);
		break;
	//////////////////////////////////////////////////////////////////////////80
	// Default: Invalid Action
	//////////////////////////////////////////////////////////////////////////80
	default:
		Common::sendJSON("E401i");
		break;
}