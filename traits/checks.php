<?php

//////////////////////////////////////////////////////////////////////////////80
// Check trait
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

trait Check {

	//////////////////////////////////////////////////////////////////////////80
	// Check if user can configure Atheos
	//////////////////////////////////////////////////////////////////////////80
	public static function checkAccess($permission = "configure") {
		$users = Common::readJSON("users");
		$username = Common::data("user", "session");

		if (array_key_exists($username, $users)) {
			$permissions = $users[$username]["permissions"];
			return in_array($permission, $permissions);
		} else {
			return false;
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Check Path
	//////////////////////////////////////////////////////////////////////////80
	public static function checkPath($path) {
		$users = Common::readJSON("users");
		$username = Common::data("user", "session");
		$projects = Common::readJSON('projects');

		if (!array_key_exists($username, $users)) {
			return false;
		}

		$userACL = $users[$username]["userACL"];

		if ($userACL === "full") {
			return true;
		} else {
			foreach ($projects as $projectPath => $projectName) {
				if (!in_array($projectPath, $userACL)) {
					continue;
				}

				if (strpos($path, $projectPath) === 0 || strpos($path, WORKSPACE . "/$projectPath") === 0) {
					return true;
				}
			}
		}
		return false;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Check Session / Key
	//////////////////////////////////////////////////////////////////////////80
	public static function checkSession() {
		// Set any API keys
		$api_keys = array();
		// Check API Key or Session Authentication
		$key = "";
		if (isset($_GET['key'])) {
			$key = $_GET['key'];
		}
		if (!isset($_SESSION['user']) && !in_array($key, $api_keys)) {
			exit('{"status":"error","message":"Authentication Error"}');
		}
	}



}