<?php

/*
*  Copyright (c) Codiad & daeks (codiad.com), distributed
*  as-is and without warranty under the MIT License. See
*  [root]/license.txt for more. This information must remain intact.
*/

class Update {

	//////////////////////////////////////////////////////////////////
	// METHODS
	//////////////////////////////////////////////////////////////////

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////
	// Construct
	//////////////////////////////////////////////////////////////////

	public function __construct() {
		ini_set("user_agent", "Atheos");
	}

	//////////////////////////////////////////////////////////////////
	// Set Initial Version
	//////////////////////////////////////////////////////////////////

	public function init() {
		$version = array();
		if (file_exists(DATA ."/version.json")) {
			$local = $this->getLocalData();

			$local["last_heard"] = date("Y/m/d");
			$local["php_version"] = phpversion();
			$local["server_os"] = Common::data("SERVER_SOFTWARE", "server");
			$local["client_os"] = $this->getBrowserName();
			$local["language"] = LANGUAGE;
			$local["location"] = LANGUAGE;
			$local["plugins"] = PLUGINS;


			$reply = array(
				"local" => $local,
				"remote" => UPDATEURL,
				"github" => GITHUBAPI
			);

			Common::sendJSON("success", $reply);

		}
	}
	//////////////////////////////////////////////////////////////////
	// Check Latest Version
	//////////////////////////////////////////////////////////////////

	public function check() {
		$local = $this->getLocalData();

		return json_encode(array(
			"local" => $local
		));
	}

	//////////////////////////////////////////////////////////////////
	// Get Local Data
	//////////////////////////////////////////////////////////////////

	public function getLocalData() {
		$current = Common::readJSON('version');
		return $current;
	}

	//////////////////////////////////////////////////////////////////
	// Save Local Data
	//////////////////////////////////////////////////////////////////

	public function setLocalData() {
		$current = Common::readJSON('version');
		Common::saveJSON('version', $current);
	}
	//////////////////////////////////////////////////////////////////
	// OptOut
	//////////////////////////////////////////////////////////////////

	public function optOut() {
		$current = Common::readJSON('version');
		$current['optOut'] = false;
		Common::saveJSON('version', $current);
	}
	//////////////////////////////////////////////////////////////////
	// OptIn
	//////////////////////////////////////////////////////////////////

	public function optIn() {
		$current = Common::readJSON('version');
		$current['optOut'] = true;
		Common::saveJSON('version', $current);
	}

	public function getBrowserName() {

		$userAgent = Common::data("HTTP_USER_AGENT", "server");
		if (strpos($userAgent, 'Opera') || strpos($userAgent, 'OPR/')) return 'Opera';
		elseif (strpos($userAgent, 'Edge')) return 'Edge';
		elseif (strpos($userAgent, 'Chrome')) return 'Chrome';
		elseif (strpos($userAgent, 'Safari')) return 'Safari';
		elseif (strpos($userAgent, 'Firefox')) return 'Firefox';
		elseif (strpos($userAgent, 'MSIE') || strpos($userAgent, 'Trident/7')) return 'Internet Explorer';

		return 'Other';
	}
}