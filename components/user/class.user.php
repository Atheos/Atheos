<?php

//////////////////////////////////////////////////////////////////////////////80
// User
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class User {

	//////////////////////////////////////////////////////////////////
	// PROPERTIES
	//////////////////////////////////////////////////////////////////

	public $username = '';
	public $password = '';
	public $permissions = '';
	public $activeProject = '';
	public $userACL = '';
	public $users = '';
	public $activeFiles = '';
	public $lang = '';
	public $theme = '';

	//////////////////////////////////////////////////////////////////
	// METHODS
	//////////////////////////////////////////////////////////////////

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////
	// Construct
	//////////////////////////////////////////////////////////////////

	public function __construct() {
		$this->users = Common::readJSON('users');
		$this->activeFiles = Common::readJSON('active');
		
		// Check if array is Associative or Sequential. Sequential is
		// the old file format, so it needs to be pivoted.
		if(array_keys($this->users) === range(0, count($this->users) - 1)) {
			$this->pivotUsers();
		}

		// Check if array is Associative or Sequential. Sequential is
		// the old file format, so it needs to be pivoted.
		if(array_keys($this->activeFiles) === range(0, count($this->activeFiles) - 1)) {
			$this->pivotActives();
		}

	}

	//////////////////////////////////////////////////////////////////
	// Authenticate
	//////////////////////////////////////////////////////////////////
	public function authenticate() {
		if (array_key_exists($this->username, $this->users)) {
			$user = $this->users[$this->username];

			if (password_verify($this->password, $user["password"])) {
				$_SESSION['user'] = $this->username;
				$_SESSION['lang'] = $this->lang;
				$_SESSION['theme'] = $this->theme;
				if ($user['activeProject'] != '') {
					$_SESSION['project'] = $user['activeProject'];
				}

				Common::sendJSON("success", array("username" => $this->username));
			} else {
				Common::sendJSON("error", "Invalid Password.");
			}

		} else {
			Common::sendJSON("error", "Username not found.");
		}
	}

	//////////////////////////////////////////////////////////////////
	// Create Account
	//////////////////////////////////////////////////////////////////
	public function create() {
		$this->password = password_hash($this->password, PASSWORD_DEFAULT);

		if (!array_key_exists($this->username, $this->users)) {
			$this->users[$this->username] = array("password" => $this->password, "activeProject" => "", "permissions" => ["read", "write"], "userACL" => "full");

			Common::saveJSON('users', $this->users);
			Common::sendJSON("success", array("username" => $this->username));
		} else {
			Common::sendJSON("error", "That username is already taken.");
		}
	}

	//////////////////////////////////////////////////////////////////
	// Delete Account
	//////////////////////////////////////////////////////////////////
	public function delete() {
		// Remove User
		unset($this->users[$this->username]);

		// Save array back to JSON
		Common::saveJSON('users', $this->users);

		// Remove any active files
		unset($this->activeFiles[$this->username]);

		// Save array back to JSON
		Common::saveJSON('active', $this->actives);

		// Response
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////
	// Change Password
	//////////////////////////////////////////////////////////////////
	public function changePassword() {
		$this->password = password_hash($this->password, PASSWORD_DEFAULT);
		$this->users[$this->username]["password"] = $this->password;

		// Save array back to JSON
		Common::saveJSON('users', $this->users);
		// Response
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////
	// Change Permissions
	//////////////////////////////////////////////////////////////////
	public function changePermissions() {
		$this->users[$this->username]["permissions"] = $this->permissions;
		// Save array back to JSON
		Common::saveJSON('users', $this->users);
		// Response
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////
	// Set Project Access
	//////////////////////////////////////////////////////////////////

	public function changeUserACL() {
		// Access set to all projects
		if ($this->userACL !== "full") {
			$this->userACL = explode(",", $this->userACL);
		}
		$this->users[$this->username]["userACL"] = $this->userACL;

		// Save array back to JSON
		Common::saveJSON('users', $this->users);
		// Response
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////
	// Set Current Project
	//////////////////////////////////////////////////////////////////
	public function saveActiveProject() {
		$this->users[$this->username]["activeProject"] = $this->activeProject;

		// Save array back to JSON
		Common::saveJSON('users', $this->users);
		// Response
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////
	// Verify Account Exists
	//////////////////////////////////////////////////////////////////
	public function verify() {
		if (array_key_exists($this->username, $this->users)) {
			Common::sendJSON("S2000");
		} else {
			Common::sendJSON("E404g");
		}
	}

	//////////////////////////////////////////////////////////////////
	// Clean username
	//////////////////////////////////////////////////////////////////
	public static function cleanUsername($username) {
		return strtolower(preg_replace('#[^A-Za-z0-9\-\_\@\.]#', '', $username));
	}

	//////////////////////////////////////////////////////////////////
	// Pivot the Users from the old file format to the new file format
	//////////////////////////////////////////////////////////////////
	private function pivotUsers() {
		$revisedArray = array();
		foreach ($this->users as $user => $data) {
			if (isset($data["username"])) {
				$revisedArray[$data["username"]] = array("password" => $data["password"], "activeProject" => $data["activeProject"], "permissions" => $data["permissions"], "userACL" => $data["userACL"]);
			}
		}
		if (count($revisedArray) > 0) {
			Common::saveJSON('users', $revisedArray);
		}
	}
	//////////////////////////////////////////////////////////////////
	// Pivot ActiveFiles from the old format to the new file format
	//////////////////////////////////////////////////////////////////
	private function pivotActives() {
		// return strtolower(preg_replace('#[^A-Za-z0-9\-\_\@\.]#', '', $username));
	}
}