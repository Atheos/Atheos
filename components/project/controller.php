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
//////////////////////////////////////////////////////////////////
// Verify Session or Key
//////////////////////////////////////////////////////////////////
checkSession();

$action = Common::data("action");

$activeProject = Common::data("project", "session");
$projectName = Common::data("projectName");
$projectPath = Common::data("projectPath");

$gitRepo = Common::data("gitRepo");
$gitBranch = Common::data("gitBranch");

if (!$action) {
	Common::sendJSON("E401m");
	die;
}

$Project = new Project();



switch ($action) {
	//////////////////////////////////////////////////////////////////
	// Create Project
	//////////////////////////////////////////////////////////////////
	case 'create':
		if (checkAccess("configure")) {
			$Project->name = $projectName;
			$Project->path = $projectPath ?: $projectName;

			// Git Clone?
			if ($gitRepo) {
				$Project->gitRepo = $gitRepo;
				$Project->gitBranch = $gitBranch;
			}
			$Project->create();
		} else {
			Common::sendJSON("E430u");
		}
		break;

	//////////////////////////////////////////////////////////////////
	// Return Current
	//////////////////////////////////////////////////////////////////
	case 'current':
		if ($activeProject) {
			Common::sendJSON("success", array("path" => $activeProject));
		} else {
			Common::sendJSON("error", "No active project");
		}
		break;

	//////////////////////////////////////////////////////////////////
	// Delete Project
	//////////////////////////////////////////////////////////////////
	case 'delete':
		if (checkAccess("configure")) {
			$Project->path = $projectPath;
			$Project->delete();
		}
		break;

	//////////////////////////////////////////////////////////////////
	// Load Project
	//////////////////////////////////////////////////////////////////
	case 'load':
		if ($activeProject) {
			// Load current
			$Project->path = $activeProject;
			$projectName = $Project->getProjectName();
			Common::sendJSON("success", array("name" => $projectName, "path" => $activeProject));
		} else {
			// Load default/first project
			$default = $Project->getDefault();
			Common::sendJSON("success", $default);
		}
		break;

	//////////////////////////////////////////////////////////////////
	// Open Project
	//////////////////////////////////////////////////////////////////
	case 'open':
		if (Common::checkPath($projectPath)) {
			$Project->path = $projectPath;
			$Project->open();
		} else {
			Common::sendJSON("E430u");
		}

		break;


	//////////////////////////////////////////////////////////////////
	// Rename Project
	//////////////////////////////////////////////////////////////////
	case 'rename':
		if (Common::checkAccess("configure")) {
			$Project->name = $projectName;
			$Project->path = $projectPath;
			$Project->rename();
		} else {
			Common::sendJSON("E430u");
		}

		break;

	default:
		Common::sendJSON("E401i");
		break;
}