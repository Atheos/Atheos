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

$Project = new Project();

//////////////////////////////////////////////////////////////////
// Get Current Project
//////////////////////////////////////////////////////////////////

$action = false;
if (isset($_POST["action"])) {
	$action = $_POST["action"];
} elseif (isset($_GET["action"])) {
	$action = $_GET["action"];
}


switch ($action) {
	//////////////////////////////////////////////////////////////////
	// Create Project
	//////////////////////////////////////////////////////////////////
	case 'create':
		if (checkAccess()) {
			$Project->name = $_GET['project_name'];
			if ($_GET['project_path'] != '') {
				$Project->path = $_GET['project_path'];
			} else {
				$Project->path = $_GET['project_name'];
			}
			// Git Clone?
			if (!empty($_GET['git_repo'])) {
				$Project->gitrepo = $_GET['git_repo'];
				$Project->gitbranch = $_GET['git_branch'];
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
			if (!$no_return) {
				echo json_encode(array("status" => "success", "name" => $project_name, "path" => $_SESSION['project']));
			}
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
		if (!checkPath($_GET['project_path'])) {
			die(formatJSEND("error", "No Access"));
		}
		$Project->path = $_GET['project_path'];
		$Project->Rename();
		break;
	default:
		exit(json_encode(array(
			"status" => "error",
			"message" => "unkown action"
		)));
	}