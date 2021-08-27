<?php

//////////////////////////////////////////////////////////////////////////////80
// Analytics Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class Analytics {

	//////////////////////////////////////////////////////////////////////////80
	// PROPERTIES
	//////////////////////////////////////////////////////////////////////////80

	private $home = 'https://www.atheos.io/analytics';
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
		$data = $this->db->select("*");

		if (empty($data)) {
			$data = $this->create();
		} else {
			$data = $this->update($data);
		}
		$this->db->update($data, null, true);

		if ($data["enabled"] === true && Common::checkAccess("configure")) {
			$data["last_heard"] = date("Y/m/d");
			$data["atheos_version"] = VERSION;

			$reply = array(
				"home" => defined("DATAPOINT") ? DATAPOINT : $this->home,
				"data" => $data
			);

			$status = "success";
		} elseif ($data["enabled"] === "UNKNOWN" && Common::checkAccess("configure")) {
			$reply = "Analytic settings require action.";
			$status = "notice";
		} else {
			$reply = "Not authorized.";
			$status = "warning";
		}

		Common::send($status, $reply);
	}

	//////////////////////////////////////////////////////////////////////////80
	// Create analytics cache
	//////////////////////////////////////////////////////////////////////////80
	public function update($data = array()) {
		global $plugins;

		if (!isset($data["uuid"])) $data["uuid"] = uniqid();
		if (!isset($data["enabled"])) $data["enabled"] = "UNKNOWN";

		$data["last_heard"] = date("Y/m/d");
		$data["php_version"] = phpversion();
		$data["server_os"] = $_SERVER["SERVER_SOFTWARE"];

		$browser = Common::getBrowser();

		if (!is_array($data["client_os"])) {
			$data["client_os"] = [$browser];
		} elseif (!in_array($browser, $data["client_os"])) {
			$data["client_os"][] = $browser;
		}

		$data["timezone"] = TIMEZONE;
		$data["language"] = LANGUAGE;

		$data["plugins"] = $plugins;

		return $data;
	}

	public function create() {
		global $plugins;

		return array(
			"enabled" => "UNKNOWN",
			"uuid" => uniqid(),
			"version" => "v0.0.0",
			"first_heard" => date("Y/m/d"),
			"last_heard" => date("Y/m/d"),
			"php_version" => phpversion(),
			"server_os" => $_SERVER["SERVER_SOFTWARE"],
			"client_os" => [Common::getBrowser()],
			"timezone" => TIMEZONE,
			"language" => LANGUAGE,
			"plugins" => $plugins
		);
	}

	//////////////////////////////////////////////////////////////////////////80
	// Opt In or Out of analytics collection
	//////////////////////////////////////////////////////////////////////////80
	public function changeOpt($value) {
		$value = $value === "true";
		$status = $this->db->update("enabled", $value) ? "success" : "error";
		$text = $status === "success" ? "Updated analytics preference." : "Unable to update preference.";
		Common::send($status, $text);
	}
}