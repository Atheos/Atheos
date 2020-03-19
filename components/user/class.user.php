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

class User
{

	//////////////////////////////////////////////////////////////////
	// PROPERTIES
	//////////////////////////////////////////////////////////////////

	public $username = '';
	public $password = '';
	public $permissions = '';
	public $activeProject = '';
	public $userACL = '';
	public $users = '';
	public $actives = '';
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
		$this->actives = Common::readJSON('active');
	}

	//////////////////////////////////////////////////////////////////
	// Authenticate
	//////////////////////////////////////////////////////////////////

	public function authenticate() {

		$pass = false;
		$users = getJSON('users');
		foreach ($users as $user) {
			if ($user['username'] == $this->username && password_verify($this->password, $user['password'])) {
				$pass = true;
				$_SESSION['user'] = $this->username;
				$_SESSION['lang'] = $this->lang;
				$_SESSION['theme'] = $this->theme;
				if ($user['activeProject'] != '') {
					$_SESSION['project'] = $user['activeProject'];
				}
			}
		}

		if ($pass) {
			echo formatJSEND("success", array("username" => $this->username));
		} else {
			echo formatJSEND("error", "Incorrect Username or Password");
		}
	}

	//////////////////////////////////////////////////////////////////
	// Create Account
	//////////////////////////////////////////////////////////////////

	public function create() {
		$this->password = password_hash($this->password, PASSWORD_DEFAULT);
		$pass = $this->checkDuplicate();
		if ($pass) {
			$this->users[] = array("username" => $this->username, "password" => $this->password, "activeProject" => "", "permissions" => ["read", "write"], "userACL" => "full");
			saveJSON('users', $this->users);
			echo formatJSEND("success", array("username" => $this->username));
		} else {
			echo formatJSEND("error", "The Username is Already Taken");
		}
	}

	//////////////////////////////////////////////////////////////////
	// Delete Account
	//////////////////////////////////////////////////////////////////

	public function delete() {
		// Remove User
		$revised_array = array();
		foreach ($this->users as $user => $data) {
			if ($data['username'] !== $this->username) {
				$revised_array[] = $data;
			}
		}
		// Save array back to JSON
		saveJSON('users', $revised_array);

		// Remove any active files
		foreach ($this->actives as $active => $data) {
			if ($this->username == $data['username']) {
				unset($this->actives[$active]);
			}
		}
		saveJSON('active', $this->actives);

		// Response
		echo formatJSEND("success", null);
	}

	//////////////////////////////////////////////////////////////////
	// Change Password
	//////////////////////////////////////////////////////////////////

	public function changePassword() {
		$this->password = password_hash($this->password, PASSWORD_DEFAULT);
		$revised_array = array();
		foreach ($this->users as $user => $data) {
			if ($this->username === $data['username']) {
				$data['password'] = $this->password;
				$revised_array[] = $data;
			} else {
				$revised_array[] = $data;
			}
		}
		// Save array back to JSON
		Common::saveJSON('users', $revised_array);
		// Response
		echo formatJSEND("success", null);
	}

	//////////////////////////////////////////////////////////////////
	// Change Permissions
	//////////////////////////////////////////////////////////////////

	public function changePermissions() {
		$revised_array = array();
		foreach ($this->users as $user => $data) {
			if ($this->username === $data['username']) {
				$data['permissions'] = $this->permissions;
				$revised_array[] = $data;
			} else {
				$revised_array[] = $data;
			}
		}
		// Save array back to JSON
		Common::saveJSON('users', $revised_array);
		// Response
		echo formatJSEND("success", null);
	}

	//////////////////////////////////////////////////////////////////
	// Set Project Access
	//////////////////////////////////////////////////////////////////

	public function changeUserACL() {
		// Access set to all projects
		if ($this->userACL !== "full") {
			$this->userACL = explode(",", $this->userACL);
		}
		$revised_array = array();
		foreach ($this->users as $user => $data) {
			if ($this->username === $data['username']) {
				$data['userACL'] = $this->userACL;
				$revised_array[] = $data;
			} else {
				$revised_array[] = $data;
			}
		}
		// Save array back to JSON
		Common::saveJSON('users', $revised_array);
		// Response
		echo formatJSEND("success", null);
	}

	//////////////////////////////////////////////////////////////////
	// Set Current Project
	//////////////////////////////////////////////////////////////////

	public function saveActiveProject() {
		$revised_array = array();
		foreach ($this->users as $user => $data) {
			if ($this->username === $data['username']) {
				$data['activeProject'] = $this->activeProject;
				$revised_array[] = $data;
			} else {
				$revised_array[] = $data;
			}
		}
		// Save array back to JSON
		saveJSON('users', $revised_array);
		// Response
		echo formatJSEND("success", null);
	}

	//////////////////////////////////////////////////////////////////
	// Check Duplicate
	//////////////////////////////////////////////////////////////////

	public function checkDuplicate() {
		$pass = true;
		foreach ($this->users as $user => $data) {
			if ($data['username'] === $this->username) {
				$pass = false;
			}
		}
		return $pass;
	}

	//////////////////////////////////////////////////////////////////
	// Verify Account Exists
	//////////////////////////////////////////////////////////////////
	public function verify() {
		$pass = 'false';
		foreach ($this->users as $user => $data) {
			if ($this->username == $data['username']) {
				$pass = 'true';
			}
		}

		if ($pass) {
			Common::sendJSON('success', $pass);
		} else {
			Common::sendJSON('error', $pass);

		}
	}

	//////////////////////////////////////////////////////////////////
	// Clean username
	//////////////////////////////////////////////////////////////////
	public static function cleanUsername($username) {
		return strtolower(preg_replace('#[^A-Za-z0-9\-\_\@\.]#', '', $username));
	}
}