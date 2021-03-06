<?php

//////////////////////////////////////////////////////////////////////////////80
// Analytics Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class Analytics {

	//////////////////////////////////////////////////////////////////////////80
	// PROPERTIES
	//////////////////////////////////////////////////////////////////////////80

	private $endpoint = 'https://www.atheos.io/analytics';
	private $db = null;

	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// ----------------------------------||---------------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Construct
	//////////////////////////////////////////////////////////////////////////80
	public function __construct() {
		ini_set("user_agent", "Atheos");
		$this->db = Common::getKeyStore("analytics");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Set Initial Version
	//////////////////////////////////////////////////////////////////////////80
	public function init() {
		global $plugins;
		$data = $this->db->select("*");
		if (empty($data)) {
			// TODO, CREATE
			// $this->create();
			Common::send("warning", "No data.");
		}

		$reply = array("endpoint" => defined("DATAPOINT") ? DATAPOINT : $this->endpoint);
		$status = "success";

		if (ANALYTICS) {
			$data["last_heard"] = date("Y/m/d");
			$data["atheos_version"] = VERSION;
			$data["php_version"] = phpversion();
			$data["client_os"] = $this->getBrowserName();
			$data["language"] = LANGUAGE;
			$data["plugins"] = $plugins;
			$reply["data"] = $data;
		} elseif (!ANALYTICS || !Common::checkAccess("configure")) {
			$reply = "Not authorized.";
			$status = "warning";
		} else {
			$reply = "Requires action.";
			$status = "notice";			
		}

		Common::send($status, $reply);
	}

	//////////////////////////////////////////////////////////////////////////80
	// Modify analytics data
	//////////////////////////////////////////////////////////////////////////80
	public function modify($key, $value) {
		$this->db->update($key, $value);
	}

	//////////////////////////////////////////////////////////////////////////80
	// GetBrowserName
	//////////////////////////////////////////////////////////////////////////80
	public function getBrowserName() {
		$userAgent = SERVER("HTTP_USER_AGENT");
		if (strpos($userAgent, 'Opera') || strpos($userAgent, 'OPR/')) return 'Opera';
		elseif (strpos($userAgent, 'Edge')) return 'Edge';
		elseif (strpos($userAgent, 'Chrome')) return 'Chrome';
		elseif (strpos($userAgent, 'Safari')) return 'Safari';
		elseif (strpos($userAgent, 'Firefox')) return 'Firefox';
		elseif (strpos($userAgent, 'MSIE') || strpos($userAgent, 'Trident/7')) return 'Internet Explorer';

		return 'Other';
	}
}