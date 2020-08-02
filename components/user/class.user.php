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
	private $activeUser = '';
	private $users = '';

	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// ----------------------------------||---------------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Construct
	//////////////////////////////////////////////////////////////////////////80
	public function __construct($activeUser) {
		$this->users = Common::readJSON('users');
		$this->activeUser = $activeUser;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Authenticate
	//////////////////////////////////////////////////////////////////////////80
	public function authenticate($username, $password, $language, $theme) {
		if (array_key_exists($username, $this->users)) {
			$user = $this->users[$username];

			if (password_verify($password, $user["password"])) {
				$_SESSION['user'] = $username;
				$_SESSION['lang'] = $language;
				$_SESSION['theme'] = $theme;
				if ($user['activeProject'] !== '') {
					$_SESSION['project'] = $user['activeProject'];
				}
				$reply = array(
					"username" => $username,
					"lastLogin" => $user["lastLogin"]
				);

				$this->users[$username]["lastLogin"] = date("Y-m-d H:i:s");
				Common::saveJSON('users', $this->users);

				Common::sendJSON("success", $reply);
				// Log Action
				Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $username . "} logged in", "access");

			} else {
				Common::sendJSON("error", "Invalid Password.");
				// Log Action
				Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $username . "} attempted log in", "access");

			}

		} else {
			Common::sendJSON("error", "Username not found.");
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Change Password
	//////////////////////////////////////////////////////////////////////////80
	public function changePassword($username, $password) {
		$password = password_hash($password, PASSWORD_DEFAULT);
		$this->users[$username]["password"] = $password;

		// Save array back to JSON
		Common::saveJSON('users', $this->users);
		// Response
		Common::sendJSON("S2000");
		// Log
		Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $this->activeUser . "} changed password of {" . $username . "}", "access");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Change Permissions
	//////////////////////////////////////////////////////////////////////////80
	public function changePermissions($permissions) {
		$this->users[$username]["permissions"] = $permissions;
		// Save array back to JSON
		Common::saveJSON('users', $this->users);
		// Response
		Common::sendJSON("S2000");
		// Log
		Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $this->activeUser . "} changed permissions of {" . $username . "}", "access");
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
	public function create($username, $password) {
		$password = password_hash($password, PASSWORD_DEFAULT);

		if (!array_key_exists($username, $this->users)) {
			$this->users[$username] = array(
				"password" => $password,
				"creationDate" => date("Y-m-d H:i:s"),
				"activeProject" => "",
				"lastLogin" => false,
				"permissions" => ["read", "write"],
				"userACL" => "full"
			);

			Common::saveJSON('users', $this->users);
			Common::sendJSON("success", array("username" => $username));
			// Log
			Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $this->activeUser . "} created account {" . $username . "}", "access");

		} else {
			Common::sendJSON("error", "That username is already taken.");
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Delete Account
	//////////////////////////////////////////////////////////////////////////80
	public function delete($username) {
		// Remove User
		unset($this->users[$this->username]);

		// Save array back to JSON
		Common::saveJSON('users', $this->users);

		$db = Common::getDB('active');
		$where = array("user" => $username);
		$db->delete($where);

		// Response
		Common::sendJSON("S2000");

		// Log
		Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $this->activeUser . "} deleted account {" . $username . "}", "access");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Set Current Project
	//////////////////////////////////////////////////////////////////////////80
	public function saveActiveProject($activeProject) {
		$this->users[$this->activeUser]["activeProject"] = $activeProject;

		// Save array back to JSON
		Common::saveJSON('users', $this->users);
		// Response
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Update Project ACL
	//////////////////////////////////////////////////////////////////////////80
	public function updateACL($username, $userACL) {
		// Access set to all projects
		if ($userACL !== "full") {
			$userACL = explode(",", $userACL);
		}
		$this->users[$username]["userACL"] = $userACL;
		// Save array back to JSON
		Common::saveJSON('users', $this->users);
		// Response
		Common::sendJSON("S2000");
		// Log
		Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $this->activeUser . "} changed ACL of {" . $username . "}", "access");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Verify Account Exists
	//////////////////////////////////////////////////////////////////////////80
	public function verify($username) {
		if (array_key_exists($username, $this->users)) {
			Common::sendJSON("S2000");
		} else {
			Common::sendJSON("E404g");
		}
	}
}