<?php

//////////////////////////////////////////////////////////////////////////////80
// User Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class User {

	//////////////////////////////////////////////////////////////////////////80
	// PROPERTIES
	//////////////////////////////////////////////////////////////////////////80
	private $activeUser = "";
	private $users = "";

	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// ----------------------------------||---------------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Construct
	//////////////////////////////////////////////////////////////////////////80
	public function __construct($activeUser) {
		$this->users = Common::load("users");
		$this->activeUser = $activeUser;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Authenticate
	//////////////////////////////////////////////////////////////////////////80
	public function authenticate($username, $password, $language, $theme) {
		if (array_key_exists($username, $this->users)) {
			$user = $this->users[$username];

			if (password_verify($password, $user["password"])) {
				SESSION("user", $username);
				SESSION("lang", $language);
				SESSION("theme", $theme);

				if (isset($user["activePath"]) && $user["activePath"] !== "" && isset($user["activeName"]) && $user["activeName"] !== "") {
					SESSION("projectPath", $user["activePath"]);
					SESSION("projectName", $user["activeName"]);
				}

				$reply = array(
					"username" => $username,
					"lastLogin" => $user["lastLogin"]
				);

				$this->users[$username]["lastLogin"] = date("Y-m-d H:i:s");
				Common::save("users", $this->users);

				// Log Action
				Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $username . "} logged in", "access");
				Common::send("success", $reply);
			} else {
				// Log Action
				Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $username . "} attempted log in", "access");
				Common::send("error", "Invalid password.");
			}

		} else {
			Common::send("error", "Username not found.");
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Change Password
	//////////////////////////////////////////////////////////////////////////80
	public function changePassword($username, $password) {
		$password = password_hash($password, PASSWORD_DEFAULT);
		$this->users[$username]["password"] = $password;

		// Save array back to JSON
		Common::save("users", $this->users);
		// Log
		Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $this->activeUser . "} changed password of {" . $username . "}", "access");
		Common::send("success");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Change Permissions
	//////////////////////////////////////////////////////////////////////////80
	public function changePermissions($username, $permissions) {
		$this->users[$username]["permissions"] = $permissions;
		// Save array back to JSON
		Common::save("users", $this->users);
		// Log
		Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $this->activeUser . "} changed permissions of {" . $username . "}", "access");
		Common::send("success");
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

			Common::save("users", $this->users);
			// Log
			Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $this->activeUser . "} created account {" . $username . "}", "access");
			Common::send("success", array("username" => $username));

		} else {
			Common::send("error", "That username is already taken.");
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Delete Account
	//////////////////////////////////////////////////////////////////////////80
	public function delete($username) {
		// Remove User
		unset($this->users[$this->username]);

		// Save array back to JSON
		Common::save("users", $this->users);

		$db = Common::getScroll("active");
		$where = array("user" => $username);
		$db->delete($where);

		// Log
		Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $this->activeUser . "} deleted account {" . $username . "}", "access");
		Common::send("success");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Set Current Project
	//////////////////////////////////////////////////////////////////////////80
	public function saveActiveProject($activeName, $activePath) {
		$this->users[$this->activeUser]["activeName"] = $activeName;
		$this->users[$this->activeUser]["activePath"] = $activePath;

		// Save array back to JSON
		Common::save("users", $this->users);
		// Response
		Common::send("success");
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
		Common::save("users", $this->users);
		// Log
		Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $this->activeUser . "} changed ACL of {" . $username . "}", "access");
		Common::send("success");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Verify Account Exists
	//////////////////////////////////////////////////////////////////////////80
	public function verify($username) {
		if (array_key_exists($username, $this->users)) {
			Common::send("success");
		} else {
			Common::send("error", "Invalid account.");
		}
	}
}