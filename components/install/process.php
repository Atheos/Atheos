<?php

//////////////////////////////////////////////////////////////////////////////80
// Install Process
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

//////////////////////////////////////////////////////////////////////
// Paths
//////////////////////////////////////////////////////////////////////
$data = $_POST;

$path = $data['path'] ?: false;

$rel = str_replace('/components/install/process.php', '', $_SERVER['REQUEST_URI']);

$workspace = $path . "/workspace";
$users = $path . "/data/users.json";
$projects = $path . "/data/projects.json";
$active = $path . "/data/active.json";
$settings = $path . "/data/settings.json";
$version = $path . "/data/version.json";

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
	return ($path[0] === '/' || $path[1] === ':')?true:false;
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
	$projectName = $data["projectName"] ?: false;
	$projectPath = $data["projectPath"] ?: $projectName;
	$timezone = $data['timezone'] ?: false;

	//////////////////////////////////////////////////////////////////
	// Create Projects files
	//////////////////////////////////////////////////////////////////

	$projectPath = cleanPath($projectPath);

	if (isAbsPath($projectPath)) {
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

	} else {
		$projectPath = str_replace(" ", "_", preg_replace('/[^\w-\.]/', '', $projectPath));
		mkdir($workspace . "/" . $projectPath);
	}

	$projectData = array($projectPath => $projectName);

	saveJSON($projects, $projectData);

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

	saveJSON($users, $userData);

	//////////////////////////////////////////////////////////////////
	// Create Active and Settings file
	//////////////////////////////////////////////////////////////////
	$genericData = array($username => array());
	saveJSON($active, $genericData);
	saveJSON($settings, $genericData);

	$versionData = array(
		atheos_uuid => uniqid(),
		first_heard => date("Y-m-d H:i:s"),
		last_heard => date("Y-m-d H:i:s"),
		atheos_version => "v4.0.5",
		php_version => phpversion(),
		server_os => $_SERVER["SERVER_SOFTWARE"],
		client_os => false,
		location => $timezone,
		language => false,
		optOut => true,
		plugins => array()
	);
	
	saveJSON($version, $versionData);
	


	//////////////////////////////////////////////////////////////////
	// Create Config
	//////////////////////////////////////////////////////////////////
	$configData = '<?php

//////////////////////////////////////////////////////////////////////////////80
// Configuration
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

// PATH TO ATHEOS
define("BASE_PATH", "' . $path . '");

// BASE URL TO ATHEOS (without trailing slash)
define("BASE_URL", "' . $_SERVER["HTTP_HOST"] . $rel . '");

// THEME : default, modern or clear (look at /themes)
define("THEME", "atheos");

// SESSIONS (e.g. 7200)
$cookie_lifetime = "0";

// TIMEZONE
date_default_timezone_set("' . $timezone . '");

// External Authentification
//define("AUTH_PATH", "/path/to/customauth.php");

//////////////////////////////////////////////////////////////////////////////80
// ** DO NOT EDIT CONFIG BELOW **
//////////////////////////////////////////////////////////////////////////////80

// PATHS
define("COMPONENTS", BASE_PATH . "/components");
define("PLUGINS", BASE_PATH . "/plugins");
define("THEMES", BASE_PATH . "/themes");
define("DATA", BASE_PATH . "/data");
define("WORKSPACE", BASE_PATH . "/workspace");

// URLS
define("WSURL", BASE_URL . "/workspace");

// Update Check
define("ARCHIVEURL", "https://github.com/Atheos/Atheos/archive/master.zip");
define("COMMITURL", "https://api.github.com/repos/Atheos/Atheos/commits");

define("UPDATEURL", "https://atheos.io/update");
define("MARKETURL", "https://www.atheos.io/market/json");
define("GITHUBAPI", "https://api.github.com/repos/Atheos/Atheos/releases/latest");
	';

	saveFile($config, $configData);

	echo("success");
}