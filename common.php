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

Common::startSession();

//////////////////////////////////////////////////////////////////
// Common Class
//////////////////////////////////////////////////////////////////

class Common {

	//////////////////////////////////////////////////////////////////////////80
	// PROPERTIES
	//////////////////////////////////////////////////////////////////////////80

	public static $debugStack = array();

	private static $data = array(
		"session" => array(),
		"post" => array(),
		"get" => array(),
	);

	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Construct
	//////////////////////////////////////////////////////////////////////////80
	public static function construct() {
		global $cookie_lifetime;


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
	// SESSIONS
	//////////////////////////////////////////////////////////////////////////80
	public static function startSession() {
		Common::construct();

		global $cookie_lifetime;
		if (isset($cookie_lifetime) && $cookie_lifetime !== "") {
			ini_set("session.cookie_lifetime", $cookie_lifetime);
		}

		//Set a Session Name
		session_name(md5(BASE_PATH));
		session_start();

		//Some security checks, helps with securing the service
		if (isset($_SESSION['user']) && isset($_SESSION['_USER_LOOSE_IP'])) {
			$badSession = false;
			$badSession = $badSession ? $badSession : $_SESSION['_USER_LOOSE_IP'] !== long2ip(ip2long($_SERVER['REMOTE_ADDR']) & ip2long("255.255.0.0"));
			$badSession = $badSession ? $badSession : $_SESSION['_USER_AGENT'] !== $_SERVER['HTTP_USER_AGENT'];
			$badSession = $badSession ? $badSession : $_SESSION['_USER_ACCEPT_ENCODING'] !== $_SERVER['HTTP_ACCEPT_ENCODING'];
			$badSession = $badSession ? $badSession : $_SESSION['_USER_ACCEPT_LANG'] !== $_SERVER['HTTP_ACCEPT_LANGUAGE'];

			if ($badSession) {
				//Bad session detected, let's not allow any further data to be transfered and redirect to logout.
				session_unset(); // Same as $_SESSION = array();
				session_destroy(); // Destroy session on disk
				setcookie("sid", "", 1);
				header("Location: index.php");
				die();
			}
			$_SESSION['_USER_LAST_ACTIVITY'] = time(); //Reset user activity timer
		} else {
			//Store identification data so we can detect malicous logins potentially. (Like XSS)
			$_SESSION['_USER_AGENT'] = $_SERVER['HTTP_USER_AGENT']; //Save user agent (Spoofable, so we have the other stuff below to check for as well which may or may not be a little more difficult to guess for an attacker.)
			$_SESSION['_USER_ACCEPT_ENCODING'] = $_SERVER['HTTP_ACCEPT_ENCODING'];
			$_SESSION['_USER_ACCEPT_LANG'] = $_SERVER['HTTP_ACCEPT_LANGUAGE'];
			$_SESSION['_USER_LOOSE_IP'] = long2ip(ip2long($_SERVER['REMOTE_ADDR']) & ip2long("255.255.0.0"));
			$_SESSION['_USER_LAST_ACTIVITY'] = time();
		}

		//Check for external authentification
		if (defined('AUTH_PATH') && file_exists(AUTH_PATH)) {
			require_once(AUTH_PATH);
		}

		// Set up language translation
		global $i18n;
		$i18n = new i18n(LANGUAGE);
		$i18n->init();

		global $components; global $plugins; global $themes;
		// Read Components, Plugins, Themes
		$components = Common::readDirectory(COMPONENTS);
		$plugins = Common::readDirectory(PLUGINS);
		$themes = Common::readDirectory(THEMES);

		// Add data to global variables
		if ($_POST && !empty($_POST)) {
			foreach ($_POST as $key => $value) {
				Common::$data["post"][$key] = $value;
			}
		}
		if ($_GET && !empty($_GET)) {
			foreach ($_GET as $key => $value) {
				Common::$data["get"][$key] = $value;
			}
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Read Content of directory
	//////////////////////////////////////////////////////////////////////////80
	public static function readDirectory($foldername) {
		$tmp = array();
		$allFiles = scandir($foldername);
		foreach ($allFiles as $fname) {
			if ($fname === '.' || $fname === '..') {
				continue;
			}

			$length = strlen(".disabled");
			if (substr($fname, -$length) === ".disabled") {
				continue;
			}

			if (is_dir($foldername.'/'.$fname)) {
				$tmp[] = $fname;
			}
		}
		return $tmp;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Check Session / Key
	//////////////////////////////////////////////////////////////////////////80
	public static function checkSession() {
		// Set any API keys
		$api_keys = array();
		// Check API Key or Session Authentication
		$key = "";
		if (isset($_GET['key'])) {
			$key = $_GET['key'];
		}
		if (!isset($_SESSION['user']) && !in_array($key, $api_keys)) {
			exit('{"status":"error","message":"Authentication Error"}');
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Read json
	// Reads JSON data from the data folder using namespaces.
	//////////////////////////////////////////////////////////////////////////80
	public static function readJSON($file, $namespace = "") {
		$json = false;

		$path = DATA . "/" . $namespace . "/";
		$path = preg_replace('#/+#', '/', $path);

		$file = pathinfo($file, PATHINFO_FILENAME);

		if (is_readable($path . $file . '.json')) {
			$json = file_get_contents($path . $file . '.json');
		} elseif (is_readable($path . $file . '.php')) {
			$json = file_get_contents($path . $file . '.php');
			$json = str_replace(["\n\r", "\r", "\n"], "", $json);
			$json = str_replace("|*/?>", "", str_replace("<?php/*|", "", $json));
			saveJSON($file . ".json", json_decode($json, true), $namespace);
		}

		if (is_file($path . $file . ".json") && is_file($path . $file . ".php")) {
			unlink($path . $file . ".php");
		}

		if ($json) {
			$json = json_decode($json, true);
		}
		return $json;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Save JSON
	//////////////////////////////////////////////////////////////////////////80
	public static function saveJSON($file, $data, $namespace = "") {
		$path = DATA . "/" . $namespace . "/";
		$path = preg_replace('#/+#', '/', $path);

		if (!is_dir($path)) mkdir($path);

		$file = pathinfo($file, PATHINFO_FILENAME) . ".json";

		$data = json_encode($data, JSON_PRETTY_PRINT);

		$write = fopen($path . $file, 'w') or die("can't open file: " . $path . $file);
		fwrite($write, $data);
		fclose($write);
	}


	//////////////////////////////////////////////////////////////////////////80
	// Log Action
	//////////////////////////////////////////////////////////////////////////80
	public static function log($text, $name = "global") {
		$path = DATA . "/log/";
		$path = preg_replace('#/+#', '/', $path);

		if (!is_dir($path)) mkdir($path);

		$file = "$name.log";
		$text = $text . PHP_EOL;

		if (file_exists($path . $file)) {
			$lines = file($path . $file);
			if (sizeof($lines) > 100) {
				unset($lines[0]);
			}
			$lines[] = $text;

			$write = fopen($path . $file, 'w');
			fwrite($write, implode('', $lines));
			fclose($write);
		} else {
			$write = fopen($path . $file, 'w');
			fwrite($write, $text);
			fclose($write);
		}
	}

	// This debug function will be simplified once the langaue work is completed.
	public static function debug($val, $name = "debug") {
		Common::$debugStack[] = $val;

		$time = date("Y-m-d H:i:s");
		$trace = debug_backtrace(null, 5);
		if (is_array($trace) && count($trace) > 2) {
			$function = $trace[1]['function'];
			$file = $trace[2]['file'];

			$val = is_array($val) ? json_encode($val) : "\"$val\"";
			$val = str_pad($val, 40, ".", STR_PAD_RIGHT);
			$function = str_pad($function, 10, ".", STR_PAD_RIGHT);

			$text = "@$time:\t$val < $function in $file";

			Common::log($text, $name);
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Format JSON Responses
	//////////////////////////////////////////////////////////////////////////80
	public static function sendJSON($status, $text = false) {
		if (preg_match('/^[SEWN][0-9]{3}[0-9a-z]{1}$/', $status)) {
			$reply = Common::parseStatusCodes($status, $text);
		} elseif (is_array($text)) {
			$reply = $text;
			$reply["status"] = $status ? $status : "error";
		} else {
			$reply = array(
				"text" => $text ? $text : "no data",
				"status" => $status ? $status : "error"
			);
		}

		/// Debug /////////////////////////////////////////////////
		if (count(Common::$debugStack) > 0) {
			$reply["debug"] = Common::$debugStack;
		}

		// Return ////////////////////////////////////////////////
		echo json_encode($reply);
	}

	//////////////////////////////////////////////////////////////////////////80
	// Parse Status Codes
	//////////////////////////////////////////////////////////////////////////80
	public static function parseStatusCodes($code, $text = false) {
		$codes = array(
			"S2000" => "Success.",

			"E401i" => "Invalid Action.",
			"E401m" => "Missing Action.",

			"E402i" => "Invalid Path.",
			"E402m" => "Missing Path.",

			"E403g" => "Invalid Parameter.",
			"E403i" => "Invalid Parameter:",
			"E403m" => "Missing Parameter.",

			"E404g" => "No Content.",

			"E430u" => "User does not have access.",
			"E430c" => "Client does not have access.",
			"E430a" => "Atheos does not have access.",

			"W490g" => "Conflict.",
			"W490s" => "Conflict:",

			"E5000" => "Internal Error.",
			"E5001" => "Internal Error:",
			"E5002" => "Failed to save content.",

		);

		$reply = is_array($text) ? $text : array();

		if (in_array($code, $codes)) {
			$reply["text"] = $codes[$code];
		}

		if ($text && !is_array($text)) {
			$reply["text"] .= " $text";
		}

		switch ($code[0]) {
			case "S":
				$reply["status"] = "success";
				break;
			case "E":
				$reply["status"] = "error";
				break;
			case "W":
				$reply["status"] = "warning";
				break;
			case "N":
				$reply["status"] = "notice";
				break;
			default:
				$reply["status"] = "error";
				break;
		}
		return $reply;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Check if user can configure Atheos
	//////////////////////////////////////////////////////////////////////////80
	public static function checkAccess($permission = "configure") {
		$users = Common::readJSON("users");
		$username = Common::data("user", "session");

		if (array_key_exists($username, $users)) {
			$permissions = $users[$username]["permissions"];
			return in_array($permission, $permissions);
		} else {
			return false;
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Check Path
	//////////////////////////////////////////////////////////////////////////80
	public static function checkPath($path) {
		$users = Common::readJSON("users");
		$username = Common::data("user", "session");
		$projects = Common::readJSON('projects');

		if (!array_key_exists($username, $users)) {
			return false;
		}

		$userACL = $users[$username]["userACL"];

		if ($userACL === "full") {
			return true;
		} else {
			foreach ($projects as $projectPath => $projectName) {
				if (!in_array($projectPath, $userACL)) {
					continue;
				}

				if (strpos($path, $projectPath) === 0 || strpos($path, WORKSPACE . "/$projectPath") === 0) {
					return true;
				}
			}
		}
		return false;
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

	//////////////////////////////////////////////////////////////////////////80
	// Check Function Availability
	//////////////////////////////////////////////////////////////////////////80
	public static function isAvailable($func) {
		if (ini_get('safe_mode')) return false;
		$disabled = ini_get('disable_functions');
		if ($disabled) {
			$disabled = explode(',', $disabled);
			$disabled = array_map('trim', $disabled);
			return !in_array($func, $disabled);
		}
		return true;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Check If Path is absolute
	//////////////////////////////////////////////////////////////////////////80
	public static function isAbsPath($path) {
		return ($path[0] === '/' || $path[1] === ':')?true:false;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Check If WIN based system
	//////////////////////////////////////////////////////////////////////////80
	public static function isWINOS() {
		return (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN');
	}

	//////////////////////////////////////////////////////////////////////////80
	// Return full workspace path
	//////////////////////////////////////////////////////////////////////////80
	public static function getWorkspacePath($path) {
		if (!$path) {
			return false;
		}
		//Security check
		if (!Common::checkPath($path)) {
			Common::sendJSON("E430c"); die;
		}
		if (strpos($path, "/") === 0) {
			//Unix absolute path
			return $path;
		}
		if (strpos($path, ":/") !== false) {
			//Windows absolute path
			return $path;
		}
		if (strpos($path, ":\\") !== false) {
			//Windows absolute path
			return $path;
		}
		return WORKSPACE . "/" . $path;
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

function i18n($string, $args = false) {
	global $i18n;
	return $i18n->translate($string, $args);
}


function debug($val, $name = "debug") {
	Common::debug($val, $name);
}

?>