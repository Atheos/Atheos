<?php
/*
    *  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
    *  as-is and without warranty under the MIT License. See
    *  [root]/license.txt for more. This information must remain intact.
    */

Common::startSession();

//////////////////////////////////////////////////////////////////
// Common Class
//////////////////////////////////////////////////////////////////

class Common {

	//////////////////////////////////////////////////////////////////
	// PROPERTIES
	//////////////////////////////////////////////////////////////////

	public static $debugMessageStack = array();
	private static $data = array();

	//////////////////////////////////////////////////////////////////
	// METHODS
	//////////////////////////////////////////////////////////////////

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////
	// Construct
	//////////////////////////////////////////////////////////////////

	public static function construct() {
		global $cookie_lifetime;
		$path = str_replace("index.php", "", $_SERVER['SCRIPT_FILENAME']);
		foreach (array("components", "plugins") as $folder) {
			if (strpos($_SERVER['SCRIPT_FILENAME'], $folder)) {
				$path = substr($_SERVER['SCRIPT_FILENAME'], 0, strpos($_SERVER['SCRIPT_FILENAME'], $folder));
				break;
			}
		}

		if (file_exists($path.'config.php')) {
			require_once($path.'config.php');
		}

		if (!defined('BASE_PATH')) {
			define('BASE_PATH', rtrim(str_replace("index.php", "", $_SERVER['SCRIPT_FILENAME']), "/"));
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
	}

	//////////////////////////////////////////////////////////////////
	// SESSIONS
	//////////////////////////////////////////////////////////////////

	public static function startSession() {
		Common::construct();


		global $cookie_lifetime;
		if (isset($cookie_lifetime) && $cookie_lifetime != "") {
			ini_set("session.cookie_lifetime", $cookie_lifetime);
		}

		//Set a Session Name
		session_name(md5(BASE_PATH));

		session_start();

		if (true) {
			//Some security checks, helps with securing the service
			if (isset($_SESSION['user']) && isset($_SESSION['_USER_LOOSE_IP'])) {
				if ($_SESSION['_USER_LOOSE_IP'] != long2ip(ip2long($_SERVER['REMOTE_ADDR']) & ip2long("255.255.0.0")) || $_SESSION['_USER_AGENT'] != $_SERVER['HTTP_USER_AGENT'] || $_SESSION['_USER_ACCEPT_ENCODING'] != $_SERVER['HTTP_ACCEPT_ENCODING'] || $_SESSION['_USER_ACCEPT_LANG'] != $_SERVER['HTTP_ACCEPT_LANGUAGE']) {
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
		}

		//Check for external authentification
		if (defined('AUTH_PATH')) {
			require_once(AUTH_PATH);
		}

		global $lang;
		if (isset($_SESSION['lang'])) {
			include BASE_PATH."/languages/{$_SESSION['lang']}.php";
		} else {
			include BASE_PATH."/languages/".LANGUAGE.".php";
		}

		Common::loadData();

	}

	//////////////////////////////////////////////////////////////////
	// Load and clean input data
	//////////////////////////////////////////////////////////////////
	public static function loadData() {
		Common::$data["session"] = array();
		Common::$data["post"] = array();
		Common::$data["get"] = array();

		if ($_SESSION && count($_SESSION) > 0) {
			foreach ($_SESSION as $key => $value) {
				Common::$data["session"][$key] = $value;
			}
		}
		if ($_POST && count($_POST) > 0) {
			foreach ($_POST as $key => $value) {
				Common::$data["post"][$key] = $value;
			}
		}
		if ($_GET && count($_GET) > 0) {
			foreach ($_GET as $key => $value) {
				Common::$data["get"][$key] = $value;
			}
		}
	}

	//////////////////////////////////////////////////////////////////
	// Read Content of directory
	//////////////////////////////////////////////////////////////////
	public static function readDirectory($foldername) {
		$tmp = array();
		$allFiles = scandir($foldername);
		foreach ($allFiles as $fname) {
			if ($fname == '.' || $fname == '..') {
				continue;
			}
			if (is_dir($foldername.'/'.$fname)) {
				$tmp[] = $fname;
			}
		}
		return $tmp;
	}

	//////////////////////////////////////////////////////////////////
	// Log debug message
	// Messages will be displayed in the console when the response is
	// made with the formatJSEND function.
	//////////////////////////////////////////////////////////////////
	public static function debug($message) {
		Common::$debugMessageStack[] = $message;
	}

	//////////////////////////////////////////////////////////////////
	// Localization
	//////////////////////////////////////////////////////////////////
	public static function i18n($key, $type = "echo", $args = array()) {
		if (is_array($type)) {
			$args = $type;
			$type = "echo";
		}
		global $lang;
		$key = ucwords(strtolower($key)); //Test, test TeSt and tESt are exacly the same
		$return = isset($lang[$key]) ? $lang[$key] : $key;

		foreach ($args as $k => $v) {
			$return = str_replace("%{".$k."}%", $v, $return);
		}
		if ($type == "echo") {
			echo $return;
		} else {
			return $return;
		}
	}

	//////////////////////////////////////////////////////////////////
	// Check Session / Key
	//////////////////////////////////////////////////////////////////
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

	//////////////////////////////////////////////////////////////////
	// Get JSON
	//////////////////////////////////////////////////////////////////
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

	//////////////////////////////////////////////////////////////////
	// Save JSON
	//////////////////////////////////////////////////////////////////

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

	//////////////////////////////////////////////////////////////////
	// Format JSON Responses
	//////////////////////////////////////////////////////////////////
	public static function sendJSON($status, $text = false) {
		if (preg_match('/^[SEWN][0-9]{3}[0-9a-z]{1}$/', $status)) {
			$reply = Common::parseStatusCodes($status, $text);
		} elseif (is_array($text)) {
			$reply = $text;
			$reply["status"] = $status ?? "error";
		} else {
			$reply = array(
				"text" => $text ?? "no data",
				"status" => $status ?? "error"
			);
		}



		/// Debug /////////////////////////////////////////////////
		if (count(Common::$debugMessageStack) == 1) {
			$reply["debug"] = Common::$debugMessageStack[0];
		} elseif (count(Common::$debugMessageStack) > 0) {
			$reply["debug"] = Common::$debugMessageStack;
		}

		// Return ////////////////////////////////////////////////
		echo json_encode($reply);
	}

	//////////////////////////////////////////////////////////////////
	// Parse Status Codes
	//////////////////////////////////////////////////////////////////
	public static function parseStatusCodes($code, $text = false) {
		$codes = array(
			"S2000" => "Success.",

			"E401i" => "Invalid Action.",
			"E401m" => "Missing Action.",

			"E402i" => "Invalid Path.",
			"E402m" => "Missing Path.",

			"E403g" => "Invalid Parameter.",
			"E403i" => "Invalid Parameter:",
			"E403m" => "Missing Parameter:",

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

		if (is_array($text)) {
			$reply = $text;
		} else {
			$reply = array();
		}

		// $reply["code"] = $code;

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
		}
		return $reply;
	}

	//////////////////////////////////////////////////////////////////
	// Check if user can configure Atheos
	//////////////////////////////////////////////////////////////////
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

	//////////////////////////////////////////////////////////////////
	// Check Path
	//////////////////////////////////////////////////////////////////
	public static function checkPath($path) {
		$users = Common::readJSON("users");
		$username = Common::data("user", "session");


		$userHasAccess = false;

		if (array_key_exists($username, $users)) {
			$userACL = $users[$username]["userACL"];
			$userHasAccess = $userACL === "full" ? true : false;
			if ($userACL === "full") {
				$userHasAccess = true;
			} else {
				foreach ($userACL as $project) {
					$userHasAccess = strpos($path, $project) === 0 ? true : $userHasAccess;
				}
			}
		}

		$projects = Common::readJSON('projects');
		$pathWithinProject = false;

		foreach ($projects as $projectPath => $projectName) {
			$pathWithinProject = strpos($path, $projectPath) === 0 ? true : $pathWithinProject;
		}

		return $userHasAccess && $pathWithinProject;

	}

	public static function data($key, $type = false) {
		$data = Common::$data;
		$value = false;
		if (array_key_exists($key, $data["session"])) {
			$value = $data["session"][$key];
		} elseif (array_key_exists($key, $data["post"])) {
			$value = $data["post"][$key];
		} elseif (array_key_exists($key, $data["get"])) {
			$value = $data["get"][$key];
		}

		if ($type) {
			if ($type === "server") {
				$value = array_key_exists($key, $_SERVER) ? $_SERVER[$key] : false;
			} else {
				$value = array_key_exists($key, $data[$type]) ? $data[$type][$key] : false;
			}
		}


		//$value = htmlspecialchars(strip_tags($value));

		return $value;
	}

	//////////////////////////////////////////////////////////////////
	// Check Function Availability
	//////////////////////////////////////////////////////////////////
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

	//////////////////////////////////////////////////////////////////
	// Check If Path is absolute
	//////////////////////////////////////////////////////////////////
	public static function isAbsPath($path) {
		return ($path[0] === '/' || $path[1] === ':')?true:false;
	}

	//////////////////////////////////////////////////////////////////
	// Check If WIN based system
	//////////////////////////////////////////////////////////////////
	public static function isWINOS() {
		return (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN');
	}

	//////////////////////////////////////////////////////////////////
	// Return full workspace path
	//////////////////////////////////////////////////////////////////
	public static function getWorkspacePath($path) {
		if (!$path) {
			return false;
		}
		//Security check
		if (!Common::checkPath($path)) {
			Common::sendJSON("E430c");
			die;
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

	//////////////////////////////////////////////////////////////////
	// Clean a path
	//////////////////////////////////////////////////////////////////
	public static function cleanPath($path) {

		// replace backslash with slash
		$path = str_replace('\\', '/', $path);

		// allow only valid chars in paths$
		$path = preg_replace('/[^A-Za-z0-9 \-\._\/]/', '', $path);
		// maybe this is not needed anymore
		// prevent Poison Null Byte injections
		$path = str_replace(chr(0), '', $path);

		// prevent go out of the workspace
		while (strpos($path, '../') !== false) {
			$path = str_replace('../', '', $path);
		}
		return $path;
	}

}

//////////////////////////////////////////////////////////////////
// Wrapper for old method names
//////////////////////////////////////////////////////////////////

function i18n($key, $type = "echo", $args = array()) {
	return Common::i18n($key, $type, $args);
}

?>