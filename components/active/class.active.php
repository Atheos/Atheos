<?php

//////////////////////////////////////////////////////////////////////////////80
// Active Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class Active {

	//////////////////////////////////////////////////////////////////////////80
	// PROPERTIES
	//////////////////////////////////////////////////////////////////////////80

	public $activeFiles = "";

	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Construct
	//////////////////////////////////////////////////////////////////////////80

	public function __construct() {
		$this->activeFiles = Common::readJSON('active');
	}

	//////////////////////////////////////////////////////////////////////////80
	// Add File
	//////////////////////////////////////////////////////////////////////////80
	public function add($user, $path) {
		$this->activeFiles[$user][$path] = "active";
		Common::saveJSON('active', $this->activeFiles);
		Common::sendJSON("S2000");
	}


	//////////////////////////////////////////////////////////////////////////80
	// Check File
	//////////////////////////////////////////////////////////////////////////80
	public function check($activeUser, $path) {
		$activeUsers = array();
		foreach ($this->activeFiles as $username => $files) {
			if ($username === $activeUser) {
				continue;
			} elseif (isset($files[$path])) {
				$activeUsers[] = ucfirst($username);
			}
		}
		if (!empty($activeUsers)) {
			$file = substr($path, strrpos($path, "/") + 1);
			Common::sendJSON("warning", i18n("warning_fileOpen", implode(", ", $activeUsers)));
		} else {
			Common::sendJSON("S2000");
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// List User's Active Files
	//////////////////////////////////////////////////////////////////////////80
	public function list($activeUser) {

		if (!$this->activeFiles || !array_key_exists($activeUser, $this->activeFiles)) {
			Common::sendJSON("E404g");
		} else {

			$userActiveFiles = $this->activeFiles[$activeUser];

			foreach ($userActiveFiles as $path => $status) {
				$fullPath = Common::isAbsPath($path) ? $path : WORKSPACE. "/$path";
				if (file_exists($fullPath)) {
					$userActiveFiles[$path] = $status;
				}

				// $userActiveFiles[$path] = file_exists($fullPath) ? $status : "invalid";
			}
			Common::sendJSON("S2000", $userActiveFiles);
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Rename File
	//////////////////////////////////////////////////////////////////////////80
	public function rename($oldPath, $newPath) {
		$revisedActiveFiles = array();
		foreach ($this->activeFiles as $username => $data) {

			foreach ($data as $path => $status) {
				if ($path === $this->path) {
					$revisedActiveFiles[$user][$this->newPath] = $status;
				} else {
					$revisedActiveFiles[$user][$path] = $status;
				}
			}
		}

		Common::saveJSON('active', $revisedActiveFiles);
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Remove File
	//////////////////////////////////////////////////////////////////////////80
	public function remove($activeUser, $path) {
		unset($this->activeFiles[$activeUser][$path]);
		Common::saveJSON('active', $this->activeFiles);
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Remove All Files
	//////////////////////////////////////////////////////////////////////////80
	public function removeAll($activeUser) {
		unset($this->activeFiles[$activeUser]);
		Common::saveJSON('active', $this->activeFiles);
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Mark File As Focused
	//  All other files will be marked as non-focused.
	//////////////////////////////////////////////////////////////////////////80
	public function setFocus($activeUser, $focus) {
		$userActiveFiles = $this->activeFiles[$activeUser];
		foreach ($userActiveFiles as $path => $type) {
			$userActiveFiles[$path] = $path === $focus ? "focus": "active";
		}

		$this->activeFiles[$activeUser] = $userActiveFiles;

		Common::saveJSON('active', $this->activeFiles);
		Common::sendJSON("S2000");
	}
}