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

class Project
{

	//////////////////////////////////////////////////////////////////
	// PROPERTIES
	//////////////////////////////////////////////////////////////////

	public $name = '';
	public $path = '';
	public $gitRepo = false;
	public $gitBranch = '';
	private $projects = '';
	public $no_return = false;
	private $activeUser = '';
	private $userACL = false;
	public $command_exec = '';

	//////////////////////////////////////////////////////////////////
	// METHODS
	//////////////////////////////////////////////////////////////////

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////
	// Construct
	//////////////////////////////////////////////////////////////////

	public function __construct() {
		$this->projects = Common::readJSON('projects');
		$this->activeUser = Common::data("user", "session");
		$this->userACL = Common::readJSON("users")[$this->activeUser];

		// Check if array is Associative or Sequential. Sequential is
		// the old file format, so it needs to be pivoted.
		if (array_keys($this->projects) === range(0, count($this->projects) - 1)) {
			$this->pivotProjects();
		}

	}

	//////////////////////////////////////////////////////////////////
	// Get First (Default, none selected)
	//////////////////////////////////////////////////////////////////
	public function getDefault() {

		if ($this->userACL !== "full") {
			$this->path = reset($this->userACL);
			$this->name = $this->projects[$this->path];
		} else {
			$this->path = reset($this->projects);
			$this->name = $this->projects[$this->path];
		}
		// Set Sessions
		$_SESSION['project'] = $this->path;
		return  array(
			"name" => $this->name,
			"path" => $this->path
		);

	}

	//////////////////////////////////////////////////////////////////
	// Get Name From Path
	//////////////////////////////////////////////////////////////////
	public function getProjectName() {
		$this->name = $this->projects[$this->path];
		return $this->name;
	}

	//////////////////////////////////////////////////////////////////
	// Open Project
	//////////////////////////////////////////////////////////////////
	public function open() {
		if (isset($this->projects[$this->path])) {
			$this->name = $this->projects[$this->path];
			$_SESSION['project'] = $this->path;
			Common::sendJSON("success", array("name" => $this->name, "path" => $this->path));
		} else {
			Common::sendJSON("error", "Project Not Found");
		}
	}

	//////////////////////////////////////////////////////////////////
	// Create
	//////////////////////////////////////////////////////////////////

	public function create() {
		if (!$this->name && !$this->path) {
			Common::sendJSON("E403m", "Name & Path");
			die;
		}
		$this->path = $this->cleanPath();
		$this->name = htmlspecialchars($this->name);
		if (!Common::isAbsPath($this->path)) {
			$this->path = $this->sanitizePath();
		}

		if ($this->checkDuplicate()) {
			Common::sendJSON("W490s", "A Project With the Same Name or Path Exists.");
			die;
		}

		if (!Common::isAbsPath($this->path)) {
			mkdir(WORKSPACE . '/' . $this->path);
		} else {
			if (!file_exists($this->path)) {
				if (!mkdir($this->path . '/', 0755, true)) {
					Common::sendJSON("E5001", "Unable to create Absolute Path.");
					die;
				}
			} else {
				if (!is_writable($this->path) || !is_readable($this->path)) {
					Common::sendJSON("E5001", "No Read/Write Permission.");
					die;
				}
			}
		}

		$this->projects[$this->path] = $this->name;

		Common::saveJSON('projects', $this->projects);

		// Pull from Git Repo?
		if ($this->gitRepo && filter_var($this->gitRepo, FILTER_VALIDATE_URL) !== false) {
			$this->gitBranch = $this->sanitizeGitBranch();
			if (!Common::isAbsPath($this->path)) {
				$this->command_exec = "cd " . escapeshellarg(WORKSPACE . '/' . $this->path) . " && git init && git remote add origin " . escapeshellarg($this->gitRepo) . " && git pull origin " . escapeshellarg($this->gitBranch);
			} else {
				$this->command_exec = "cd " . escapeshellarg($this->path) . " && git init && git remote add origin " . escapeshellarg($this->gitRepo) . " && git pull origin " . escapeshellarg($this->gitBranch);
			}
			$this->ExecuteCMD();
		}

		Common::sendJSON("success", array("name" => $this->name, "path" => $this->path));

	}

	//////////////////////////////////////////////////////////////////
	// Rename
	//////////////////////////////////////////////////////////////////
	public function rename() {
		// Change project name
		$this->projects[$this->path] = $this->name;

		// Save array back to JSON
		Common::saveJSON('projects', $this->projects);

		// Response
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////
	// Delete Project
	//////////////////////////////////////////////////////////////////
	public function delete() {
		// Remove Project
		unset($this->projects[$this->path]);

		// Save array back to JSON
		Common::saveJSON('projects', $this->projects);

		// Response
		Common::sendJSON("S2000");
	}


	//////////////////////////////////////////////////////////////////
	// Check Duplicate
	//////////////////////////////////////////////////////////////////
	public function checkDuplicate() {
		if (array_key_exists($this->path, $this->projects)) {
			return true;
		}
		foreach ($this->projects as $path => $name) {
			if ($name === $this->name) return true;
		}
		return false;
	}

	//////////////////////////////////////////////////////////////////
	// Sanitize Path
	//////////////////////////////////////////////////////////////////
	public function sanitizePath() {
		$sanitized = str_replace(" ", "_", $this->path);
		return preg_replace('/[^\w-]/', '', $sanitized);
	}

	//////////////////////////////////////////////////////////////////
	// Sanitize gitBranch
	//////////////////////////////////////////////////////////////////
	public function sanitizeGitBranch() {
		$sanitized = str_replace(array(
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
		), array(
			""
		), $this->gitBranch);
		return $sanitized;
	}

	//////////////////////////////////////////////////////////////////
	// Clean Path
	//////////////////////////////////////////////////////////////////
	public function cleanPath() {

		// prevent Poison Null Byte injections
		$path = str_replace(chr(0), '', $this->path);

		// prevent go out of the workspace
		while (strpos($path, '../') !== false) {
			$path = str_replace('../', '', $path);
		}

		return $path;
	}

	//////////////////////////////////////////////////////////////////
	// Execute Command
	//////////////////////////////////////////////////////////////////
	public function ExecuteCMD() {
		if (function_exists('system')) {
			ob_start();
			system($this->command_exec);
			ob_end_clean();
		} elseif (function_exists('exec')) {
			exec($this->command_exec, $this->output);
		} elseif (function_exists('shell_exec')) {
			shell_exec($this->command_exec);
		}
	}

	//////////////////////////////////////////////////////////////////
	// Pivot the Users from the old file format to the new file format
	//////////////////////////////////////////////////////////////////
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
}