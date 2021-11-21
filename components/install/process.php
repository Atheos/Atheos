<?php

//////////////////////////////////////////////////////////////////////////////80
// Install Process
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

//////////////////////////////////////////////////////////////////////////////80
// Paths
//////////////////////////////////////////////////////////////////////////////80
require_once("../../common.php");
$rel = str_replace("/components/install/process.php", "", $_SERVER['REQUEST_URI']);
$config = BASE_PATH . "/config.php";


//////////////////////////////////////////////////////////////////////////////80
// Verify no overwrites
//////////////////////////////////////////////////////////////////////////////80
if (!file_exists(BASE_PATH . "/data/users.json") && !file_exists(BASE_PATH . "/data/projects.json")) {

	//////////////////////////////////////////////////////////////////////////80
	// Get POST responses
	//////////////////////////////////////////////////////////////////////////80
	$username = POST("username");
	$password = POST("password");
	$projectName = POST("projectName") ?: false;
	$projectPath = POST("projectPath") ?: $projectName;
	$domain = POST("domain") ?: false;
	$timezone = POST("timezone") ?: "UTC";
	$language = substr($_SERVER["HTTP_ACCEPT_LANGUAGE"], 0, 2) ?: "en";
	$development = POST("development") ?: "false";
	$authorized = POST("analytics") ?: "UNKNOWN";

	//////////////////////////////////////////////////////////////////////////80
	// Create Projects filesue
	//////////////////////////////////////////////////////////////////////////80

	$password = password_hash($password, PASSWORD_DEFAULT);
	$projectPath = Common::cleanPath($projectPath);

	if (Common::isAbsPath($projectPath)) {
		if (substr($projectPath, -1) === "/") {
			$projectPath = substr($projectPath, 0, strlen($projectPath)-1);
		}
		if (!file_exists($projectPath)) {
			if (!mkdir($projectPath . "/", 0755, true)) {
				Common::send("error", "Unable to create Absolute Path");
			}
		} else {
			if (!is_writable($projectPath) || !is_readable($projectPath)) {
				Common::send("error", "No Read/Write Permission");
			}
		}

	} else {
		$projectPath = str_replace(" ", "_", preg_replace('/[^\w\-\.]/', '', $projectPath));
		if (!file_exists(WORKSPACE . "/" . $projectPath)) mkdir(WORKSPACE . "/" . $projectPath);
	}

	$projectData = array($projectName => $projectPath);

	Common::saveJSON("projects.db", $projectData);

	//////////////////////////////////////////////////////////////////////////80
	// Create Users file
	//////////////////////////////////////////////////////////////////////////80
	$userData = array();
	$userData[$username] = array(
		"password" => $password,
		"resetPassword" => false,
		"activeProject" => $projectPath,
		"creationDate" => date("Y-m-d H:i:s"),
		"lastLogin" => false,
		"permissions" => ["configure", "read", "write"],
		"userACL" => "full"
	);

	Common::saveJSON("users", $userData);

	//////////////////////////////////////////////////////////////////////////80
	// Create analytics cache
	//////////////////////////////////////////////////////////////////////////80
	$analyticsData = array(
		"enabled" => $authorized,
		"uuid" => uniqid(),
		"version" => "v4.3.0",
		"first_heard" => date("Y/m/d"),
		"last_heard" => date("Y/m/d"),
		"php_version" => phpversion(),
		"server_os" => $_SERVER["SERVER_SOFTWARE"],
		"client_os" => [Common::getBrowser()],
		"timezone" => $timezone,
		"language" => $language,
		"plugins" => array()
	);

	Common::saveJSON("analytics.db", $analyticsData);

	//////////////////////////////////////////////////////////////////////////80
	// Create Config
	//////////////////////////////////////////////////////////////////////////80
	$configData = '<?php

//////////////////////////////////////////////////////////////////////////////80
// Configuration
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

// PATH TO ATHEOS
define("BASE_PATH", __DIR__);

// BASE URL TO ATHEOS (without trailing slash)
define("BASE_URL", "' . $_SERVER["HTTP_HOST"] . $rel . '");

// Add an install domain to the page title
define("DOMAIN", "' . $domain . '");

// SESSION LIFETIME IN SECONDS (e.g. 7200 = 2 hours)
define("LIFETIME", false);

// TIMEZONE
define("TIMEZONE", "' . $timezone . '");

// DEVELOPMENT MODE
define("DEVELOPMENT", ' . $development . ');

// EXTERNAL AUTHENTICATION
// define("AUTH_PATH", "/path/to/customauth.php");

//////////////////////////////////////////////////////////////////////////////80
// ** EDIT AT YOUR OWN RISK **
//////////////////////////////////////////////////////////////////////////////80

// SECURITY HEADERS, SET TO FALSE TO DISABLE ALL
define ("HEADERS", serialize(array(
	"Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
	"X-Frame-Options: SAMEORIGIN",
	"X-XSS-Protection: 1; mode=block",
	"X-Content-Type-Options: nosniff",
	"Referrer-Policy: no-referrer",
	"Feature-Policy: sync-xhr \'self\'",
	"Access-Control-Allow-Origin: *"
)));

//////////////////////////////////////////////////////////////////////////////80
// ** DO NOT EDIT CONFIG BELOW **
//////////////////////////////////////////////////////////////////////////////80

// PATHS
define("COMPONENTS", BASE_PATH . "/components");
define("LIBRARIES", BASE_PATH . "/libraries");
define("PLUGINS", BASE_PATH . "/plugins");
define("DATA", BASE_PATH . "/data");
define("WORKSPACE", BASE_PATH . "/workspace");

define("UPDATEURL", "https://www.atheos.io/update");
define("MARKETURL", "https://www.atheos.io/market/json");
define("GITHUBAPI", "https://api.github.com/repos/Atheos/Atheos/releases/latest");
	';

	//////////////////////////////////////////////////////////////////////////80
	// Save Config
	//////////////////////////////////////////////////////////////////////////80
	$write = fopen($config, "w") or Common::send("error", "Unable to save config");
	fwrite($write, $configData);
	fclose($write);

	//////////////////////////////////////////////////////////////////////////80
	// Initialize session for auto login
	//////////////////////////////////////////////////////////////////////////80
	SESSION("user", $username);
	SESSION("lang", $language);
	SESSION("projectPath", $projectPath);
	SESSION("projectName", $projectName);

	//////////////////////////////////////////////////////////////////////////80
	// Send data back to client
	//////////////////////////////////////////////////////////////////////////80
	$reply = array(
		"username" => $username,
		"lastLogin" => date("Y-m-d H:i:s"),
		"text" => "Installation successful."
	);

	Common::send("success", $reply);
}