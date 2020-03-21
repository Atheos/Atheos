<?php

/*
    *  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
    *  as-is and without warranty under the MIT License. See
    *  [root]/license.txt for more. This information must remain intact.
    */

require_once('../../common.php');
require_once('class.filemanager.php');

//////////////////////////////////////////////////////////////////
// Verify Session or Key
//////////////////////////////////////////////////////////////////

checkSession();

//////////////////////////////////////////////////////////////////
// Get Action
//////////////////////////////////////////////////////////////////

if (!empty($_GET['action'])) {
	$action = $_GET['action'];
} else {
	$action = Common::post('action');
	if (!$action) {
		exit('{"status":"error","message":"No Action Specified"}');
	}
}

//////////////////////////////////////////////////////////////////
// Ensure Project Has Been Loaded
//////////////////////////////////////////////////////////////////

if (!isset($_SESSION['project'])) {
	$_GET['action'] = 'get_current';
	$_GET['no_return'] = 'true';
	require_once('../project/controller.php');
}

//////////////////////////////////////////////////////////////////
// Security Check
//////////////////////////////////////////////////////////////////
$path = Common::get('path');
if(!$path) {
	Common::post('path');
}
if (!checkPath($path)) {
	die('{"status":"error","message":"Invalid Path"}');
}

//////////////////////////////////////////////////////////////////
// Define Root
//////////////////////////////////////////////////////////////////

$_GET['root'] = WORKSPACE;

//////////////////////////////////////////////////////////////////
// Handle Action
//////////////////////////////////////////////////////////////////

$Filemanager = new Filemanager($_GET, $_POST, $_FILES);
$Filemanager->project = @$_SESSION['project']['path'];

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