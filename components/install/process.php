<?php

/*
*  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
*  as-is and without warranty under the MIT License. See
*  [root]/license.txt for more. This information must remain intact.
*/

//////////////////////////////////////////////////////////////////////
// Paths
//////////////////////////////////////////////////////////////////////
$data = array();
if ($_POST && count($_POST) > 0) {
	foreach ($_POST as $key => $value) {
		Common::$data[$key] = $value;
	}
}


$path = $data['path'] || false;

$rel = str_replace('/components/install/process.php', '', $_SERVER['REQUEST_URI']);

$workspace = $path . "/workspace";
$users = $path . "/data/users.json";
$projects = $path . "/data/projects.json";
$active = $path . "/data/active.json";
$config = $path . "/config.php";

//////////////////////////////////////////////////////////////////////
// Functions
//////////////////////////////////////////////////////////////////////

function saveFile($file, $data) {
	$write = fopen($file, 'w') or die("Unable to open file:$file");
	fwrite($write, $data);
	fclose($write);
}

function saveJSON($file, $data) {
	$data = json_encode($data, JSON_PRETTY_PRINT);
	saveFile($file, $data);
}

function cleanUsername($username) {
	return preg_replace('#[^A-Za-z0-9'.preg_quote('-_@. ').']#', '', $username);
}

function isAbsPath($path) {
	return $path[0] === '/';
}

function cleanPath($path) {
	// prevent Poison Null Byte injections
	$path = str_replace(chr(0), '', $path);

	// prevent escaping out of the workspace
	while (strpos($path, '../') !== false) {
		$path = str_replace('../', '', $path);
	}

	return $path;
}

//////////////////////////////////////////////////////////////////////
// Verify no overwrites
//////////////////////////////////////////////////////////////////////

if (!file_exists($users) && !file_exists($projects) && !file_exists($active)) {
	//////////////////////////////////////////////////////////////////
	// Get POST responses
	//////////////////////////////////////////////////////////////////

	$username = cleanUsername($data['username']);
	$password = password_hash($data['password'], PASSWORD_DEFAULT);
	$projectName = $data['projectName'] || false;
	$projectPath = $data["projectPath"] || $projectName;
	$timezone = $data['timezone'] || false;

	//////////////////////////////////////////////////////////////////
	// Create Projects files
	//////////////////////////////////////////////////////////////////

	$projectPath = cleanPath($projectPath);

	if (!isAbsPath($projectPath)) {
		$projectPath = str_replace(" ", "_", preg_replace('/[^\w-\.]/', '', $projectPath));
		mkdir($workspace . "/" . $projectPath);
	} else {
		if (substr($projectPath, -1) == '/') {
			$projectPath = substr($projectPath, 0, strlen($projectPath)-1);
		}
		if (!file_exists($projectPath)) {
			if (!mkdir($projectPath.'/', 0755, true)) {
				die("Unable to create Absolute Path");
			}
		} else {
			if (!is_writable($projectPath) || !is_readable($projectPath)) {
				die("No Read/Write Permission");
			}
		}
	}
	$projectData = array("name" => $projectName, "path" => $projectPath);

	saveJSON($projects, array($projectData));

	//////////////////////////////////////////////////////////////////
	// Create Users file
	//////////////////////////////////////////////////////////////////
	$userData = array();
	$userData[$username] = array(
		"password" => $password,
		"activeProject" => $projectPath,
		"permissions" => ["configure", "read", "write"],
		"userACL" => "full"
	);

	saveJSON($users, array($userData));

	//////////////////////////////////////////////////////////////////
	// Create Active file
	//////////////////////////////////////////////////////////////////
	saveJSON($active, array(''));

	//////////////////////////////////////////////////////////////////
	// Create Config
	//////////////////////////////////////////////////////////////////
	$configData = '<?php

/*
*  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
*  as-is and without warranty under the MIT License. See
*  [root]/license.txt for more. This information must remain intact.
*/

//////////////////////////////////////////////////////////////////
// CONFIG
//////////////////////////////////////////////////////////////////

// PATH TO CODIAD
define("BASE_PATH", "' . $path . '");

// BASE URL TO CODIAD (without trailing slash)
define("BASE_URL", "' . $_SERVER["HTTP_HOST"] . $rel . '");

// THEME : default, modern or clear (look at /themes)
define("THEME", "atheos");

// ABSOLUTE PATH
define("WHITEPATHS", BASE_PATH . ",/home");

// SESSIONS (e.g. 7200)
$cookie_lifetime = "0";

// TIMEZONE
date_default_timezone_set("' . $timezone . '");

// External Authentification
//define("AUTH_PATH", "/path/to/customauth.php");

//////////////////////////////////////////////////////////////////
// ** DO NOT EDIT CONFIG BELOW **
//////////////////////////////////////////////////////////////////

// PATHS
define("COMPONENTS", BASE_PATH . "/components");
define("PLUGINS", BASE_PATH . "/plugins");
define("THEMES", BASE_PATH . "/themes");
define("DATA", BASE_PATH . "/data");
define("WORKSPACE", BASE_PATH . "/workspace");

// URLS
define("WSURL", BASE_URL . "/workspace");

// Marketplace
//define("MARKETURL", "https://atheos.io/market/json");

// Update Check
define("UPDATEURL", "http://https://atheos.io/update?v={VER}&o={OS}&p={PHP}&w={WEB}&a={ACT}");
define("ARCHIVEURL", "https://github.com/Atheos/Atheos/archive/master.zip");
define("COMMITURL", "https://api.github.com/repos/Atheos/Atheos/commits");
	';

	saveFile($config, $configData);

	echo("success");
}