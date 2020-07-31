<?php


trait Path {

	//////////////////////////////////////////////////////////////////////////80
	// Check If Path is absolute
	//////////////////////////////////////////////////////////////////////////80
	public static function isAbsPath($path) {
		return ($path[0] === '/' || $path[1] === ':')?true:false;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Clean a path
	//////////////////////////////////////////////////////////////////////////80
	public static function cleanPath($path) {

		// replace backslash with slash
		$path = str_replace('\\', '/', $path);

		// allow only valid chars in paths$
		$path = preg_replace('/[^A-Za-z0-9 :\-\._\/]/', '', $path);
		// maybe this is not needed anymore
		// prevent Poison Null Byte injections
		$path = str_replace(chr(0), '', $path);

		// prevent go out of the workspace
		while (strpos($path, '../') !== false) {
			$path = str_replace('../', '', $path);
		}
		return $path;
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
	// Return full workspace path
	//////////////////////////////////////////////////////////////////////////80
	public static function getWorkspacePath($path) {
		if (!$path) {
			return false;
		}
		//Security check
		if (!Common::checkPath($path)) {
			Common::sendJSON("E430c"); die;
		}
		if (strpos($path, "/") === 0) {
			//Unix absolute path
			return $path;
		}
		if (strpos($path, ":/") !== false) {
			//Windows absolute path
			return $path;
		}
		if (strpos($path, ":\\") !== false) {
			//Windows absolute path
			return $path;
		}
		return WORKSPACE . "/" . $path;
	}

}