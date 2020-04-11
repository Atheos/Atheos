<?php

/*
*  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
*  as-is and without warranty under the MIT License. See
*  [root]/license.txt for more. This information must remain intact.
*/

require_once('../../common.php');

class Active {

	//////////////////////////////////////////////////////////////////
	// PROPERTIES
	//////////////////////////////////////////////////////////////////

	public $username = "";
	public $path = "";
	public $newPath = "";
	public $activeFiles = "";

	//////////////////////////////////////////////////////////////////
	// METHODS
	//////////////////////////////////////////////////////////////////

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////
	// Construct
	//////////////////////////////////////////////////////////////////

	public function __construct() {
		$this->activeFiles = Common::readJSON('active');
	}

	//////////////////////////////////////////////////////////////////
	// List User's Active Files
	//////////////////////////////////////////////////////////////////

	public function listActive() {

		if (!$this->activeFiles || !$this->activeFiles[$this->username]) {
			Common::sendJSON("E404g");
		} else {

			$userActiveFiles = $this->activeFiles[$this->username];

			foreach ($userActiveFiles as $path => $status) {
				$fullPath = Common::isAbsPath($path) ? $path : WORKSPACE. "/$path";

				$userActiveFiles[$path] = file_exists($fullPath) ? $status : "invalid";
			}
			Common::sendJSON("S2000", $userActiveFiles);
		}
	}

	//////////////////////////////////////////////////////////////////
	// Check File
	//////////////////////////////////////////////////////////////////

	public function check() {
		$activeUsers = array();
		foreach ($this->activeFiles as $user => $data) {
			if ($user === $this->username) {
				continue;
			} elseif (isset($this->activeFiles[$user][$this->path])) {
				$activeUsers[] = ucfirst($user);
			}
		}
		if (count($activeUsers) !== 0) {
			$file = substr($this->path, strrpos($this->path, "/") + 1);
			Common::sendJSON("warning", "File '$file' currently opened by: " . implode(", ", $activeUsers));
		} else {
			Common::sendJSON("S2000");
		}
	}

	//////////////////////////////////////////////////////////////////
	// Add File
	//////////////////////////////////////////////////////////////////

	public function add() {
		$process_add = true;
		$this->activeFiles[$this->username][$this->path] = "active";
		Common::saveJSON('active', $this->activeFiles);
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////
	// Rename File
	//////////////////////////////////////////////////////////////////
	public function rename() {
		$revisedActiveFiles = array();
		foreach ($this->activeFiles as $user) {
			foreach ($this->activeFiles[$user] as $path => $status) {
				if ($path === $this->path) {
					$revisedActiveFiles[$user][$newPath] = $status;
				} else {
					$revisedActiveFiles[$user][$path] = $status;
				}
			}
		}

		Common::saveJSON('active', $revisedActiveFiles);
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////
	// Remove File
	//////////////////////////////////////////////////////////////////
	public function remove() {
		unset($this->activeFiles[$this->username][$this->path]);
		Common::saveJSON('active', $this->activeFiles);
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////
	// Remove All Files
	//////////////////////////////////////////////////////////////////
	public function removeAll() {
		unset($this->activeFiles[$this->username]);
		Common::saveJSON('active', $this->activeFiles);
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////
	// Mark File As Focused
	//  All other files will be marked as non-focused.
	//////////////////////////////////////////////////////////////////
	public function markFileAsFocused() {
		$userActiveFiles = $this->activeFiles[$this->username];

		foreach ($userActiveFiles as $path => $status) {
			$userActiveFiles[$path] = $path === $this->path ? "focus": "active";
		}

		$this->activeFiles[$this->username] = $userActiveFiles;

		Common::saveJSON('active', $this->activeFiles);
		Common::sendJSON("S2000");
	}
}