<?php

//////////////////////////////////////////////////////////////////////////////80
// Project Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once('../../common.php');

class Project {

	//////////////////////////////////////////////////////////////////////////80
	// PROPERTIES
	//////////////////////////////////////////////////////////////////////////80

	public $name = '';
	public $path = '';
	public $gitRepo = false;
	public $gitBranch = '';
	private $projects = '';
	private $activeUser = '';
	private $userData = false;

	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// ----------------------------------||---------------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Construct
	//////////////////////////////////////////////////////////////////////////80
	public function __construct() {
		$this->projects = Common::readJSON('projects');
		$this->activeUser = Common::data("user", "session");
		$this->userData = Common::readJSON("users")[$this->activeUser];

		// Check if array is Associative or Sequential. Sequential is
		// the old file format, so it needs to be pivoted.
		if (array_keys($this->projects) === range(0, count($this->projects) - 1)) {
			$this->pivotProjects();
		}

	}

	//////////////////////////////////////////////////////////////////////////80
	// Create
	//////////////////////////////////////////////////////////////////////////80
	public function create($projectName, $projectPath, $gitRepo, $gitBranch) {

		$projectPath = Common::cleanPath($projectPath);
		$projectName = htmlspecialchars($projectName);

		if (!Common::isAbsPath($projectPath)) {
			$projectPath = $this->sanitizePath($projectPath);
		}

		if (array_key_exists($projectPath, $this->projects)) {
			Common::sendJSON("error", "A project with that path exists."); die;
		} elseif (in_array($projectName, $this->projects)) {
			Common::sendJSON("error", "A Project with that name exists."); die;
		}


		if (!Common::isAbsPath($projectPath)) {
			mkdir(WORKSPACE . '/' . $projectPath);
		} else {
			if (!file_exists($projectPath)) {
				if (!mkdir($projectPath . '/', 0755, true)) {
					Common::sendJSON("E5001", "Unable to create Absolute Path."); die;
				}
			} else {
				if (!is_writable($projectPath) || !is_readable($projectPath)) {
					Common::sendJSON("E5001", "No Read/Write Permission."); die;
				}
			}
		}

		$this->projects[$projectPath] = $projectName;
		Common::saveJSON('projects', $this->projects);

		// Pull from Git Repo?
		if ($gitRepo && filter_var($gitRepo, FILTER_VALIDATE_URL) !== false) {
			$gitBranch = $this->sanitizeGitBranch($gitBranch);
			$cmd = Common::isAbsPath($projectPath) ? "cd " . escapeshellarg($projectPath) : "cd " . escapeshellarg(WORKSPACE . '/' . $projectPath);
			$cmd .= " && git init && git remote add origin " . escapeshellarg($gitRepo) . " && git pull origin " . escapeshellarg($gitBranch);
			Common::executeCommand($cmd);
		}

		Common::sendJSON("success", array("name" => $projectName, "path" => $projectPath));
		// Log Action
		Common::log($this->activeUser, "Created project {" . $projectName . "}", "access");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Delete Project
	//////////////////////////////////////////////////////////////////////////80
	public function delete($projectPath) {
		// Remove Project
		unset($this->projects[$projectPath]);

		// Save array back to JSON
		Common::saveJSON('projects', $this->projects);

		// Response
		Common::sendJSON("S2000");
		// Log Action
		Common::log($this->activeUser, "Deleted project {" . $projectName . "}", "access");		
	}

	//////////////////////////////////////////////////////////////////////////80
	// Load Active Project, or Default
	//////////////////////////////////////////////////////////////////////////80
	public function load($active) {
		if ($active) {
			// Load currently active project
			$projectPath = $active;
			$projectName = $this->projects[$projectPath];
		} else {
			// Load default/first project
			if ($this->userData["userACL"] !== "full") {
				$projectPath = reset($this->userData["userACL"]);
			} else {
				$projectPath = reset($projectPath);
			}
			$projectName = $this->projects[$projectPath];

			// Set Session Project
			$_SESSION['project'] = $projectPath;

		}

		Common::sendJSON("success", array(
			"name" => $projectName,
			"path" => $projectPath,
			"text" => $projectName . " Loaded.",
			// While I don't approve of user information being passed thoguh the
			// project class, it seems significantly mroe effective to do so as
			// opposed to creating an entire process to pass lastLogin data to
			// the client when I can accomplish it by adding this line here.
			//			- Liam Siira
			"lastLogin" => $this->userData["lastLogin"]
		));
	}

	//////////////////////////////////////////////////////////////////////////80
	// Open Project
	//////////////////////////////////////////////////////////////////////////80
	public function open($projectPath) {
		if (isset($this->projects[$projectPath])) {
			$projectName = $this->projects[$projectPath];
			$_SESSION['project'] = $projectPath;
			Common::sendJSON("success", array(
				"name" => $projectName,
				"path" => $projectPath,
				"text" => $projectName . " Loaded."
			));
		} else {
			Common::sendJSON("error", "Project Not Found");
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Pivot the Projects from the old file format to the new file format
	// ALERT: Pivot functions will be removed on 01/01/2022
	//////////////////////////////////////////////////////////////////////////80
	private function pivotProjects() {
		$revisedArray = array();
		foreach ($this->projects as $project => $data) {
			if (isset($data["path"])) {
				$revisedArray[$data["path"]] = $data["name"];
			}
		}
		if (count($revisedArray) > 0) {
			Common::saveJSON('projects', $revisedArray);
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Rename
	//////////////////////////////////////////////////////////////////////////80
	public function rename($projectName, $projectPath) {
		// Change project name
		$this->projects[$projectPath] = $projectName;

		// Save array back to JSON
		Common::saveJSON('projects', $this->projects);

		// Response
		Common::sendJSON("S2000");
		// Log Action
		Common::log($this->activeUser, "Renamed project {" . $projectName . "}", "access");		
	}

	//////////////////////////////////////////////////////////////////////////80
	// Sanitize Path
	//////////////////////////////////////////////////////////////////////////80
	public function sanitizePath($projectPath) {
		$projectPath = str_replace(" ", "_", $projectPath);
		return preg_replace('/[^\w-]/', '', $projectPath);
	}

	//////////////////////////////////////////////////////////////////////////80
	// Sanitize gitBranch
	//////////////////////////////////////////////////////////////////////////80
	public function sanitizeGitBranch($gitBranch) {
		return str_replace(array(
			"..",
			chr(40),
			chr(177),
			"~",
			"^",
			":",
			"?",
			"*",
			"[",
			"@{",
			"\\"
		), array(""), $gitBranch);
	}
}