<?php

//////////////////////////////////////////////////////////////////////////////80
// User Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class User {

	//////////////////////////////////////////////////////////////////////////80
	// PROPERTIES
	//////////////////////////////////////////////////////////////////////////80

	public $username = '';
	public $password = '';
	private $activeUser = '';
	public $permissions = '';
	public $activeProject = '';
	public $userACL = '';
	public $users = '';
	public $activeFiles = '';
	public $lang = '';
	public $theme = '';

	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// ----------------------------------||---------------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Construct
	//////////////////////////////////////////////////////////////////////////80
	public function __construct() {
		$this->users = Common::readJSON('users');
		$this->activeFiles = Common::readJSON('active');

		$this->activeUser = Common::data("user", "session");

		// Check if array is Associative or Sequential. Sequential is
		// the old file format, so it needs to be pivoted.
		if (array_keys($this->users) === range(0, count($this->users) - 1)) {
			$this->pivotUsers();
		}

		// Check if array is Associative or Sequential. Sequential is
		// the old file format, so it needs to be pivoted.
		if (array_keys($this->activeFiles) === range(0, count($this->activeFiles) - 1)) {
			$this->pivotActives();
		}

	}

	//////////////////////////////////////////////////////////////////////////80
	// Authenticate
	//////////////////////////////////////////////////////////////////////////80
	public function authenticate() {
		if (array_key_exists($this->username, $this->users)) {
			$user = $this->users[$this->username];

			if (password_verify($this->password, $user["password"])) {
				$_SESSION['user'] = $this->username;
				$_SESSION['lang'] = $this->lang;
				$_SESSION['theme'] = $this->theme;
				if ($user['activeProject'] !== '') {
					$_SESSION['project'] = $user['activeProject'];
				}
				$reply = array(
					"username" => $this->username,
					"lastLogin" => $user["lastLogin"]
				);

				$this->users[$this->username]["lastLogin"] = date("Y-m-d H:i:s");
				Common::saveJSON('users', $this->users);

				Common::sendJSON("success", $reply);
				// Log Action
				Common::log($this->username, "Logged in", "access");
			} else {
				Common::sendJSON("error", "Invalid Password.");
				// Log Action
				Common::log($this->username, "Log in attempt", "access");
			}

		} else {
			Common::sendJSON("error", "Username not found.");
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Change Password
	//////////////////////////////////////////////////////////////////////////80
	public function changePassword() {
		$this->password = password_hash($this->password, PASSWORD_DEFAULT);
		$this->users[$this->username]["password"] = $this->password;

		// Save array back to JSON
		Common::saveJSON('users', $this->users);
		// Response
		Common::sendJSON("S2000");
		// Log
		Common::log($this->activeUser, "Changed password of {" . $this->username . "}", "access");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Change Permissions
	//////////////////////////////////////////////////////////////////////////80
	public function changePermissions() {
		$this->users[$this->username]["permissions"] = $this->permissions;
		// Save array back to JSON
		Common::saveJSON('users', $this->users);
		// Response
		Common::sendJSON("S2000");
		// Log
		Common::log($this->activeUser, "Changed permissions of {" . $this->username . "}", "access");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Clean Username
	//////////////////////////////////////////////////////////////////////////80
	public static function cleanUsername($username) {
		return strtolower(preg_replace('#[^A-Za-z0-9\-\_\@\.]#', '', $username));
	}

	//////////////////////////////////////////////////////////////////////////80
	// Create Account
	//////////////////////////////////////////////////////////////////////////80
	public function create() {
		$this->password = password_hash($this->password, PASSWORD_DEFAULT);

		if (!array_key_exists($this->username, $this->users)) {
			$this->users[$this->username] = array(
				"password" => $this->password,
				"creationDate" => date("Y-m-d H:i:s"),
				"activeProject" => "",
				"lastLogin" => false,
				"permissions" => ["read", "write"],
				"userACL" => "full"
			);

			Common::saveJSON('users', $this->users);
			Common::sendJSON("success", array("username" => $this->username));
			// Log
		Common::log($this->activeUser, "Created account {" . $this->username . "}", "access");
		} else {
			Common::sendJSON("error", "That username is already taken.");
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Delete Account
	//////////////////////////////////////////////////////////////////////////80
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
		
		// Log
		Common::log($this->activeUser, "Deleted account {" . $this->username . "}", "access");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Pivot the Users from the old file format to the new file format
	// ALERT: Pivot functions will be removed on 01/01/2022
	//////////////////////////////////////////////////////////////////////////80
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

	//////////////////////////////////////////////////////////////////////////80
	// Pivot ActiveFiles from the old format to the new file format
	// ALERT: Pivot functions will be removed on 01/01/2022
	//////////////////////////////////////////////////////////////////////////80
	private function pivotActives() {
		$revisedArray = array();
		foreach ($this->actives as $active => $data) {
			if (isset($data["username"])) {
				$focus = $data["focused"] ? "focus" : "active";
				$revisedArray[$data["username"]] = array($data["path"] => $focus);
			}
		}
		if (count($revisedArray) > 0) {
			Common::saveJSON('actives', $revisedArray);
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Set Current Project
	//////////////////////////////////////////////////////////////////////////80
	public function saveActiveProject() {
		$this->users[$this->username]["activeProject"] = $this->activeProject;

		// Save array back to JSON
		Common::saveJSON('users', $this->users);
		// Response
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Update Project ACL
	//////////////////////////////////////////////////////////////////////////80
	public function updateACL() {
		// Access set to all projects
		if ($this->userACL !== "full") {
			$this->userACL = explode(",", $this->userACL);
		}
		$this->users[$this->username]["userACL"] = $this->userACL;
		// Save array back to JSON
		Common::saveJSON('users', $this->users);
		// Response
		Common::sendJSON("S2000");
		// Log
		Common::log($this->activeUser, "Changed ACL of {" . $this->username . "}", "access");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Verify Account Exists
	//////////////////////////////////////////////////////////////////////////80
	public function verify() {
		if (array_key_exists($this->username, $this->users)) {
			Common::sendJSON("S2000");
		} else {
			Common::sendJSON("E404g");
		}
	}
}