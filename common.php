<?php

//////////////////////////////////////////////////////////////////////////////80
// Common
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

// error_reporting(E_ALL); // Error/Exception engine, always use E_ALL
// ini_set('ignore_repeated_errors', TRUE); // always use TRUE
// ini_set('display_errors', true); // Error/Exception display, use FALSE only in production environment or real server. Use TRUE in development environment
// ini_set("log_errors", true);
// ini_set("error_log", "php-error.log");

require_once("traits/checks.php");
require_once("traits/database.php");
require_once("traits/helpers.php");
require_once("traits/file.php");
require_once("traits/path.php");
require_once("traits/reply.php");

require_once("traits/i18n.php");

class Common {

	use Check;
	use Database;
	use Helpers;
	use File;
	use Path;
	use Reply;

	//////////////////////////////////////////////////////////////////////////80
	// PROPERTIES
	//////////////////////////////////////////////////////////////////////////80
	public static $debugStack = array();

	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Construct
	//////////////////////////////////////////////////////////////////////////80
	public static function initialize() {
		$path = __DIR__;

		define("VERSION", "v5.0.0");

		if (file_exists($path."/config.php")) require_once($path."/config.php");

		if (defined("LIFETIME") && LIFETIME !== false) {
			ini_set("session.cookie_lifetime", LIFETIME);
		}

		if (!defined("BASE_PATH")) define("BASE_PATH", $path);
		if (!defined("COMPONENTS")) define("COMPONENTS", BASE_PATH . "/components");
		if (!defined("LIBRARIES")) define("LIBRARIES", BASE_PATH . "/libraries");
		if (!defined("PLUGINS")) define("PLUGINS", BASE_PATH . "/plugins");
		if (!defined("DATA")) define("DATA", BASE_PATH . "/data");
		if (!defined("WORKSPACE")) define("WORKSPACE", BASE_PATH . "/workspace");
		if (!defined("TIMEZONE")) {
			$date = new DateTime();
			$timeZone = $date->getTimezone();
			define("TIMEZONE", $timeZone->getName());
		}
		if (!defined("LANGUAGE")) define("LANGUAGE", "en");
		if (!defined("DEVELOPMENT")) define("DEVELOPMENT", false);

		// TIMEZONE
		try {
			date_default_timezone_set(TIMEZONE);
		} catch (Exception $e) {
			date_default_timezone_set("UTC");
		}

		if (!defined("HEADERS")) define ("HEADERS", serialize(array(
			"Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
			"X-Frame-Options: SAMEORIGIN",
			"X-XSS-Protection: 1; mode=block",
			"X-Content-Type-Options: nosniff",
			"Referrer-Policy: no-referrer",
			"Feature-Policy: sync-xhr 'self'",
			"Access-Control-Allow-Origin: *"
		)));

		//Check for external authentification
		if (defined("AUTH_PATH") && file_exists(AUTH_PATH)) require_once(AUTH_PATH);

		global $components; global $libraries; global $plugins;
		// Read Components & Plugins
		$components = Common::readDirectory(COMPONENTS);
		$libraries = Common::readDirectory(LIBRARIES);
		$plugins = Common::readDirectory(PLUGINS);
	}

	//////////////////////////////////////////////////////////////////////////80
	// SESSION
	//////////////////////////////////////////////////////////////////////////80
	public static function startSession() {
		session_name(md5(BASE_PATH));
		session_start();

		// Set up language translation
		global $i18n;
		$i18n = new i18n(LANGUAGE);
		$i18n->init();
	}

	//////////////////////////////////////////////////////////////////////////80////////80
	// Execute Command
	//////////////////////////////////////////////////////////////////////////80////////80
	public static function execute($cmd = false) {
		$text = false;
		$code = 0;

		if (!$cmd) return false;

		if (function_exists("system")) {
			ob_start();
			system($cmd, $code);
			$text = ob_get_contents();
			ob_end_clean();
		} elseif (function_exists("exec")) {
			exec($cmd, $text, $code);
			$text = implode("\n", $text);
		}

		// if ($code === 0 && $text === "") return "Executed successfully";

		return array(
			"code" => $code,
			"text" => $text
		);
	}
}

Common::initialize();
Common::startSession();

function i18n($string, $args = false) {
	global $i18n;
	return $i18n->translate($string, $args);
}

function debug($val) {
	Common::$debugStack[] = $val;
}

function SERVER($key, $val = null) {
	return Common::data("SERVER", $key, $val);
}

function SESSION($key, $val = null) {
	return Common::data("SESSION", $key, $val);
}

function POST($key, $val = null) {
	$val = Common::data("POST", $key, $val);
	if ($key === "username") {
		$val = strtolower(preg_replace("#[^A-Za-z0-9\-\_\@\.]#", "", $val));
	}
	return $val;
}



?>