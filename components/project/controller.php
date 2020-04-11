<?php

/*
    *  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
    *  as-is and without warranty under the MIT License. See
    *  [root]/license.txt for more. This information must remain intact.
    */


require_once('../../common.php');
require_once('class.project.php');
//////////////////////////////////////////////////////////////////
// Verify Session or Key
//////////////////////////////////////////////////////////////////
checkSession();

$action = Common::data("action");

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
		if (checkAccess()) {
			$Project->name = $projectName;
			if ($projectPath) {
				$Project->path = $projectPath;
			} else {
				$Project->path = $projectName;
			}
			// Git Clone?
			if ($gitRepo) {
				$Project->gitrepo = $gitRepo;
				$Project->gitbranch = $gitBranch;
			}
			$Project->Create();
		}
		break;

	//////////////////////////////////////////////////////////////////
	// Return Current
	//////////////////////////////////////////////////////////////////
	case 'current':
		if (isset($_SESSION["project"])) {
			echo json_encode(array(
				"status" => "success",
				"path" => $_SESSION["project"]
			));
		} else {
			echo json_encode(array(
				"status" => "error",
				"message" => "no project loaded"
			));
		}
		break;

	//////////////////////////////////////////////////////////////////
	// Delete Project
	//////////////////////////////////////////////////////////////////
	case 'delete':
		if (checkAccess()) {
			$Project->path = $_GET['project_path'];
			$Project->Delete();
		}
		break;

	//////////////////////////////////////////////////////////////////
	// Load Project
	//////////////////////////////////////////////////////////////////
	case 'load':
		if (!isset($_SESSION['project'])) {
			// Load default/first project
			$Project->GetFirst();
		} else {
			// Load current
			$Project->path = $_SESSION['project'];
			$project_name = $Project->GetName();
			echo json_encode(array("status" => "success", "name" => $project_name, "path" => $_SESSION['project']));

		}
		break;

	//////////////////////////////////////////////////////////////////
	// Open Project
	//////////////////////////////////////////////////////////////////
	case 'open':
		if (!checkPath($_GET['path'])) {
			die(formatJSEND("error", "No Access"));
		}
		$Project->path = $_GET['path'];
		$Project->Open();
		break;


	//////////////////////////////////////////////////////////////////
	// Rename Project
	//////////////////////////////////////////////////////////////////
	case 'rename':
		if (!checkPath($projectPath)) {
			die(formatJSEND("error", "No Access"));
		}
		$Project->name = $projectName;
		$Project->path = $projectPath;
		$Project->Rename();
		break;
	default:
		exit(json_encode(array(
			"status" => "error",
			"message" => "unkown action"
		)));
	}