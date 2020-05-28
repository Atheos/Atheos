<?php

//////////////////////////////////////////////////////////////////////////////80
// Project Controller
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once('../../common.php');
require_once('class.project.php');

//////////////////////////////////////////////////////////////////////////////80
// Verify Session or Key
//////////////////////////////////////////////////////////////////////////////80
Common::checkSession();

$action = Common::data("action");

$activeProject = Common::data("project", "session");
$projectName = Common::data("projectName");
$projectPath = Common::data("projectPath");

$gitRepo = Common::data("gitRepo");
$gitBranch = Common::data("gitBranch");

if (!$action) {
	Common::sendJSON("E401m"); die;
}

$Project = new Project();



switch ($action) {
	//////////////////////////////////////////////////////////////////////////80
	// Create Project
	//////////////////////////////////////////////////////////////////////////80
	case 'create':
		if (!Common::checkAccess("configure")) {
			Common::sendJSON("E430u");
		} elseif (!$projectName) {
			Common::sendJSON("E403m");
		} else {
			$projectPath = $projectPath ?: $projectName;
			$Project->create($projectName, $projectPath, $gitRepo, $gitBranch);
		}

		break;

	//////////////////////////////////////////////////////////////////////////80
	// Return Current
	//////////////////////////////////////////////////////////////////////////80
	case 'current':
		if ($activeProject) {
			Common::sendJSON("success", array("path" => $activeProject));
		} else {
			Common::sendJSON("error", "No active project");
		}
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Delete Project
	//////////////////////////////////////////////////////////////////////////80
	case 'delete':
		if (!Common::checkAccess("configure")) {
			Common::sendJSON("E430u");
		} elseif (!$projectPath) {
			Common::sendJSON("E403m");
		} else {
			$Project->delete($projectPath);
		}

		break;

	//////////////////////////////////////////////////////////////////////////80
	// Load Project
	//////////////////////////////////////////////////////////////////////////80
	case 'load':
		// Load default/first project
		$Project->load($activeProject);
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Open Project
	//////////////////////////////////////////////////////////////////////////80
	case 'open':
		if (!Common::checkPath($projectPath)) {
			Common::sendJSON("E430u");
		} elseif (!$projectPath) {
			Common::sendJSON("E403m");
		} else {
			$Project->open($projectPath);
		}

		break;

	//////////////////////////////////////////////////////////////////////////80
	// Rename Project
	//////////////////////////////////////////////////////////////////////////80
	case 'rename':
		if (!Common::checkAccess("configure")) {
			Common::sendJSON("E430u");
		} elseif (!$projectName || !$projectPath) {
			Common::sendJSON("E403m");
		} else {
			$Project->rename($projectName, $projectPath);
		}

		break;

	default:
		Common::sendJSON("E401i");
		break;
}