<?php

/*
*  Copyright (c) Codiad & Andr3as, distributed
*  as-is and without warranty under the MIT License. See
*  [root]/license.txt for more. This information must remain intact.
*/

class Settings
{

	//////////////////////////////////////////////////////////////////
	// PROPERTIES
	//////////////////////////////////////////////////////////////////

	public $username = '';

	//////////////////////////////////////////////////////////////////
	// METHODS
	//////////////////////////////////////////////////////////////////

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////
	// Construct
	//////////////////////////////////////////////////////////////////

	public function __construct() {}

	//////////////////////////////////////////////////////////////////
	// Save User Settings
	//////////////////////////////////////////////////////////////////

	public function save($key, $value) {
		$temp = Common::readJSON("settings");

		if (!$temp) {
			$temp = array(
				$this->username => array("atheos.username" => $this->username)
			);
		}

		// Security: prevent user side overwritten value
		$this->settings["username"] = $this->username;

		$temp[$this->username][$key] = $value;

		Common::saveJSON("settings", $temp);

		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////
	// Load User Settings
	//////////////////////////////////////////////////////////////////

	public function load() {
		$temp = Common::readJSON("settings");

		if (!$temp) {
			$temp = array(
				$this->username => array("atheos.username" => $this->username)
			);
			Common::saveJSON("settings", $temp);
		}

		Common::sendJSON("success", $temp[$this->username]);
	}
}