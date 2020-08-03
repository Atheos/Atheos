<?php

//////////////////////////////////////////////////////////////////////////////80
// Common
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

//////////////////////////////////////////////////////////////////
// Common Class
//////////////////////////////////////////////////////////////////

require_once("traits/checks.php");
require_once("traits/database.php");
require_once("traits/helpers.php");
require_once("traits/json.php");
require_once("traits/path.php");
require_once("traits/reply.php");
require_once("traits/session.php");

class Common {
	
	use Check;
	use Database;
	use Helpers;
	use JSON;
	use Path;
	use Reply;
	use Session;

	//////////////////////////////////////////////////////////////////////////80
	// PROPERTIES
	//////////////////////////////////////////////////////////////////////////80

	public static $debugStack = array();

	private static $data = array(
		"session" => array(),
		"post" => array(),
		"get" => array(),
	);
	
	private static $database = null;

	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Construct
	//////////////////////////////////////////////////////////////////////////80
	public static function construct() {
		$path = str_replace("index.php", "", $_SERVER['SCRIPT_FILENAME']);
		$path = str_replace("controller.php", "", $path);
		$path = str_replace("dialog.php", "", $path);

		$path = __DIR__;

		if (file_exists($path.'/config.php')) {
			require_once($path.'/config.php');
		}

		if (file_exists($path.'/components/i18n/class.i18n.php')) {
			require_once($path.'/components/i18n/class.i18n.php');
		}

		if (!defined('BASE_PATH')) {
			define("BASE_PATH", __DIR__);
		}

		if (!defined('COMPONENTS')) {
			define('COMPONENTS', BASE_PATH . '/components');
		}

		if (!defined('PLUGINS')) {
			define('PLUGINS', BASE_PATH . '/plugins');
		}

		if (!defined('DATA')) {
			define('DATA', BASE_PATH . '/data');
		}

		if (!defined('THEMES')) {
			define("THEMES", BASE_PATH . "/themes");
		}

		if (!defined('THEME')) {
			define("THEME", "atheos");
		}

		if (!defined('LANGUAGE')) {
			define("LANGUAGE", "en");
		}

		if (!defined('DEVELOPMENT')) {
			define("DEVELOPMENT", false);
		}

		if (file_exists(BASE_PATH .'/components/i18n/class.i18n.php')) {
			require_once(BASE_PATH .'/components/i18n/class.i18n.php');
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Read Post/Get/Server/Session Data
	//////////////////////////////////////////////////////////////////////////80
	public static function data($key, $type = false) {
		$value = false;

		if (array_key_exists($key, Common::$data["post"])) {
			$value = Common::$data["post"][$key];
		} elseif (array_key_exists($key, Common::$data["get"])) {
			$value = Common::$data["get"][$key];
		}

		if ($type) {
			if ($type === "server") {
				$value = array_key_exists($key, $_SERVER) ? $_SERVER[$key] : false;
			} elseif ($type === "session") {
				$value = array_key_exists($key, $_SESSION) ? $_SESSION[$key] : false;
			} else {
				$value = array_key_exists($key, Common::$data[$type]) ? Common::$data[$type][$key] : false;
			}
		}
		return $value;
	}

	//////////////////////////////////////////////////////////////////////////80////////80
	// Execute Command
	//////////////////////////////////////////////////////////////////////////80////////80
	public function execute($cmd = false) {
		$output = false;
		if (!$cmd) return "No command provided";

		if (function_exists('system')) {
			ob_start();
			system($cmd);
			$output = ob_get_contents();
			ob_end_clean();
			// } else if (function_exists('passthru')) {
			// 	ob_start();
			// 	passthru($cmd);
			// 	$output = ob_get_contents();
			// 	ob_end_clean();
		} elseif (function_exists('exec')) {
			exec($cmd, $output);
			$output = implode("\n", $output);
		} elseif (function_exists('shell_exec')) {
			$output = shell_exec($cmd);
		} else {
			$output = 'Command execution not possible on this system';
		}
		return $output;
	}
}

Common::startSession();

function i18n($string, $args = false) {
	global $i18n;
	return $i18n->translate($string, $args);
}


function debug($val, $name = "debug") {
	Common::debug($val, $name);
}

?>