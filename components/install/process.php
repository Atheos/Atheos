<?php

//////////////////////////////////////////////////////////////////////////////80
// Install Process
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

//////////////////////////////////////////////////////////////////////////////80
// Paths
//////////////////////////////////////////////////////////////////////////////80
$data = $_POST;

$path = $data["path"] ?: false;

$rel = str_replace("/components/install/process.php", "", $_SERVER['REQUEST_URI']);

$workspace = $path . "/workspace";
$users = $path . "/data/users.json";
$projects = $path . "/data/projects.json";
$active = $path . "/data/active.json";
$settings = $path . "/data/settings.json";
$version = $path . "/data/version.json";

$config = $path . "/config.php";

//////////////////////////////////////////////////////////////////////////////80
// Functions
//////////////////////////////////////////////////////////////////////////////80

function saveFile($file, $data) {
	$write = fopen($file, "w") or die("Unable to open file:$file");
	fwrite($write, $data);
	fclose($write);
}

function saveJSON($file, $data) {
	$data = json_encode($data, JSON_PRETTY_PRINT);
	saveFile($file, $data);
}

function cleanUsername($username) {
	return strtolower(preg_replace("#[^A-Za-z0-9\-\_\@\.]#", "", $username));
}

function isAbsPath($path) {
	return ($path[0] === "/" || $path[1] === ":") ? true : false;
}

function cleanPath($path) {
	// prevent Poison Null Byte injections
	$path = str_replace(chr(0), "", $path);

	// prevent escaping out of the workspace
	while (strpos($path, "../") !== false) {
		$path = str_replace("../", "", $path);
	}

	return $path;
}

//////////////////////////////////////////////////////////////////////////////80
// Verify no overwrites
//////////////////////////////////////////////////////////////////////////////80

if (!file_exists($users) && !file_exists($projects) && !file_exists($active)) {
	//////////////////////////////////////////////////////////////////
	// Get POST responses
	//////////////////////////////////////////////////////////////////

	$username = cleanUsername($data["username"]);
	$password = password_hash($data["password"], PASSWORD_DEFAULT);
	$projectName = $data["projectName"] ?: false;
	$projectPath = $data["projectPath"] ?: $projectName;
	$timezone = $data["timezone"] ?: false;
	$timezone = preg_replace('/[^a-zA-Z\/]/', "", $timezone);

	//////////////////////////////////////////////////////////////////////////80
	// Create Projects files
	//////////////////////////////////////////////////////////////////////////80

	$projectPath = cleanPath($projectPath);

	if (isAbsPath($projectPath)) {
		if (substr($projectPath, -1) === "/") {
			$projectPath = substr($projectPath, 0, strlen($projectPath)-1);
		}
		if (!file_exists($projectPath)) {
			if (!mkdir($projectPath . "/", 0755, true)) {
				die("Unable to create Absolute Path");
			}
		} else {
			if (!is_writable($projectPath) || !is_readable($projectPath)) {
				die("No Read/Write Permission");
			}
		}

	} else {
		$projectPath = str_replace(" ", "_", preg_replace('/[^\w\-\.]/', '', $projectPath));
		mkdir($workspace . "/" . $projectPath);
	}

	$projectData = array($projectPath => $projectName);

	saveJSON($projects, $projectData);

	//////////////////////////////////////////////////////////////////////////80
	// Create Users file
	//////////////////////////////////////////////////////////////////////////80
	$userData = array();
	$userData[$username] = array(
		"password" => $password,
		"activeProject" => $projectPath,
		"creationDate" => date("Y-m-d H:i:s"),
		"lastLogin" => false,
		"permissions" => ["configure", "read", "write"],
		"userACL" => "full"
	);

	saveJSON($users, $userData);

	//////////////////////////////////////////////////////////////////////////80
	// Create Active and Settings file
	//////////////////////////////////////////////////////////////////////////80
	$genericData = array($username => array());
	saveJSON($active, $genericData);
	saveJSON($settings, $genericData);

	$versionData = array(
		"atheos_uuid" => uniqid(),
		"atheos_version" => "v4.2.0",
		"first_heard" => date("Y-m-d H:i:s"),
		"last_heard" => date("Y-m-d H:i:s"),
		"php_version" => phpversion(),
		"server_os" => $_SERVER["SERVER_SOFTWARE"],
		"client_os" => false,
		"location" => $timezone,
		"language" => false,
		"optOut" => true,
		"plugins" => array()
	);

	saveJSON($version, $versionData);



	//////////////////////////////////////////////////////////////////////////80
	// Create Config
	//////////////////////////////////////////////////////////////////////////80
	$configData = '<?php

//////////////////////////////////////////////////////////////////////////////80
// Configuration
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

// PATH TO ATHEOS
define("BASE_PATH", __DIR__);

// BASE URL TO ATHEOS (without trailing slash)
define("BASE_URL", "' . $_SERVER["HTTP_HOST"] . $rel . '");

// THEME : atheos, modern or clear (look at /themes)
define("THEME", "atheos");

// SESSION LIFETIME IN SECONDS (e.g. 7200 = 2 hours)
define("LIFETIME", false);

// TIMEZONE
try {
    date_default_timezone_set("' . $timezone . '");
} catch (Exception $e) {
    date_default_timezone_set("UTC");
}

// DEVELOPMENT MODE
define("DEVELOPMENT", false);

// EXTERNAL AUTHENTICATION
// define("AUTH_PATH", "/path/to/customauth.php");

//////////////////////////////////////////////////////////////////////////////80
// ** DO NOT EDIT CONFIG BELOW **
//////////////////////////////////////////////////////////////////////////////80

// PATHS
define("COMPONENTS", BASE_PATH . "/components");
define("PLUGINS", BASE_PATH . "/plugins");
define("THEMES", BASE_PATH . "/themes");
define("DATA", BASE_PATH . "/data");
define("WORKSPACE", BASE_PATH . "/workspace");

define("UPDATEURL", "https://www.atheos.io/update");
define("MARKETURL", "https://www.atheos.io/market/json");
define("GITHUBAPI", "https://api.github.com/repos/Atheos/Atheos/releases/latest");
	';

	saveFile($config, $configData);

	echo("success");
}
