<?php

//////////////////////////////////////////////////////////////////////////////80
// Update Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class Update {

	//////////////////////////////////////////////////////////////////////////80
	// PROPERTIES
	//////////////////////////////////////////////////////////////////////////80

	private $update = 'https://www.atheos.io/update';
	private $github = 'https://api.github.com/repos/Atheos/Atheos/releases/latest';

	public $local = array();
	public $remote = array();


	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// ----------------------------------||---------------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Construct
	//////////////////////////////////////////////////////////////////////////80
	public function __construct() {
		ini_set("user_agent", "Atheos");
		
		$this->local = Common::readJSON("version");
		$this->remote = Common::readJSON("update", "cache");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Set Initial Version
	//////////////////////////////////////////////////////////////////////////80
	public function init() {
		$updateMTime = file_exists(DATA . "/cache/update.json") ? filemtime(DATA . "/cache/update.json") : false;

		$oneWeekAgo = time() - (168 * 3600);

		// In summary, if there is a cache file, and it's less than a week old,
		// don't send a request for new UpdateCache, otherwise, do so.
		$request = $updateMTime ? $updateMTime < $oneWeekAgo : true;
		$request = $this->remote ? $request : true;

		$reply = array(
			"local" => $this->local,
			"remote" => defined('UPDATEURL') ? UPDATEURL : $this->update,
			"github" => defined('GITHUBAPI') ? GITHUBAPI : $this->github,
			"request" => $request
		);

		Common::sendJSON("success", $reply);
	}

	//////////////////////////////////////////////////////////////////////////80
	// Check Latest Version
	//////////////////////////////////////////////////////////////////////////80
	public function check() {
		$local = $this->getLocalData();

		return json_encode(array(
			"local" => $local
		));
	}

	//////////////////////////////////////////////////////////////////////////80
	// Get Local Data
	//////////////////////////////////////////////////////////////////////////80
	public function getLocalData() {
		$current = Common::readJSON('version');
		return $current;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Save  Market Cache
	//////////////////////////////////////////////////////////////////////////80
	public function saveCache($cache) {
		$cache = json_decode($cache);
		$this->local = $cache;
		Common::saveJSON("update", $cache, "cache");
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////////////80
	// GetBrowserName
	//////////////////////////////////////////////////////////////////////////80
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