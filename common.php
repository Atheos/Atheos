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
	// URLs
	//////////////////////////////////////////////////////////////////

	public static function getConstant($key, $default = null) {
		return defined($key) ? constant($key) : $default;
	}

	//////////////////////////////////////////////////////////////////
	// Localization
	//////////////////////////////////////////////////////////////////

	public static function i18n($key, $type = "return") {
		global $lang;
		$key = ucwords(strtolower($key)); //Test, test TeSt and tESt are exacly the same
		$return = isset($lang[$key]) ? $lang[$key] : $key;
		// foreach ($args as $k => $v)
		// $return = str_replace("%{".$k."}%", $v, $return);
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
	// Format JSEND Response
	//////////////////////////////////////////////////////////////////

	public static function formatJSEND($status, $data = false) {

		/// Debug /////////////////////////////////////////////////
		$debug = "";
		if (count(Common::$debugMessageStack) > 0) {
			$debug .= ',"debug":';
			$debug .= json_encode(Common::$debugMessageStack);
		}

		// Success ///////////////////////////////////////////////
		if ($status == "success") {
			if ($data) {
				$jsend = '{"status":"success","data":'.json_encode($data).$debug.'}';
			} else {
				$jsend = '{"status":"success","data":null'.$debug.'}';
			}

			// Error /////////////////////////////////////////////////
		} else {
			$jsend = '{"status":"error","message":"'.$data.'"'.$debug.'}';
		}

		// Return ////////////////////////////////////////////////
		return $jsend;

	}

	//////////////////////////////////////////////////////////////////
	// Format JSEND Response
	//////////////////////////////////////////////////////////////////

	public static function sendJSON($status, $message = false) {

		$reply = array(
			status => $status ?? "error",
			message => $message ?? "no data"
		);


		/// Debug /////////////////////////////////////////////////
		if (count(Common::$debugMessageStack) > 0) {
			$reply["debug"] = Common::$debugMessageStack;
		}

		// Success ///////////////////////////////////////////////
		if ($status == "success") {
			if ($message) {
				$message["status"] = "success";
				$message["debug"] = $debug;
				$jsend = json_encode($data);
			} else {
				$jsend = '{"status":"success","data":null}';
			}

			// Error /////////////////////////////////////////////////
		} else {
			$jsend = '{"status":"error","message":"'.$data.'"}';
		}

		// Return ////////////////////////////////////////////////
		echo json_encode($reply);

	}

	//////////////////////////////////////////////////////////////////
	// Check Function Availability
	//////////////////////////////////////////////////////////////////

	public static function checkAccess() {
		return !file_exists(DATA . "/" . $_SESSION['user'] . '_acl.php');
	}

	//////////////////////////////////////////////////////////////////
	// Check Path
	//////////////////////////////////////////////////////////////////

	public static function checkPath($path) {
		$user_acl = readJSON($_SESSION['user'] . "_acl");

		if (is_array($user_acl)) {
			foreach ($user_acl as $projects => $data) {
				if (strpos($path, $data) === 0) {
					return true;
				}
			}
		} else {
			foreach (readJSON('projects') as $project => $data) {
				if (strpos($path, $data['path']) === 0) {
					return true;
				}
			}
		}
		return false;
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

}

//////////////////////////////////////////////////////////////////
// Wrapper for old method names
//////////////////////////////////////////////////////////////////

function debug($message) {
	Common::debug($message);
}
function i18n($key, $type = "echo") {
	return Common::i18n($key, $type);
}
function checkSession() {
	Common::checkSession();
}
function getJSON($file, $namespace = "") {
	return Common::readJSON($file, $namespace);
}
function readJSON($file, $namespace = "") {
	return Common::readJSON($file, $namespace);
}
function saveJSON($file, $data, $namespace = "") {
	Common::saveJSON($file, $data, $namespace);
}
function formatJSEND($status, $data = false) {
	return Common::formatJSEND($status, $data);
}
function checkAccess() {
	return Common::checkAccess();
}
function checkPath($path) {
	return Common::checkPath($path);
}
function isAvailable($func) {
	return Common::isAvailable($func);
}
?>