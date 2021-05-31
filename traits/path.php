<?php

//////////////////////////////////////////////////////////////////////////////80
// Path trait
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

trait Path {

	//////////////////////////////////////////////////////////////////////////80
	// Check if Path is absolute
	//////////////////////////////////////////////////////////////////////////80
	public static function isAbsPath($path) {
		return ($path[0] === '/' || $path[1] === ':');
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
	// Return full workspace path
	//////////////////////////////////////////////////////////////////////////80
	public static function getWorkspacePath($path) {
		$path = Common::cleanPath($path);
		if (!$path) {
			return false;
		}
		//Security check
		if (!Common::checkPath($path)) {
			Common::send("error", "Client does not have access.");
		}
		if (Common::isAbsPath($path)) {
			return $path;
		}
		return WORKSPACE . "/" . $path;
	}

}