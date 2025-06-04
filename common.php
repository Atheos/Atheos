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
// ini_set("ignore_repeated_errors", TRUE); // always use TRUE
// ini_set("display_errors", true); // Error/Exception display, use FALSE only in production environment or real server. Use TRUE in development environment
// ini_set("log_errors", true);
// ini_set("error_log", "php-error.log");

require_once("traits/checks.php");
require_once("traits/database.php");
require_once("traits/helpers.php");
require_once("traits/file.php");
require_once("traits/path.php");
require_once("traits/exchange.php");

require_once("traits/i18n.php");

class Common {

    use Check;
    use Database;
    use Helpers;
    use File;
    use Path;
    use Exchange;

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

        if (file_exists($path."/config.php")) require_once($path."/config.php");

        if (defined("LIFETIME") && LIFETIME !== false) {
            ini_set("session.cookie_lifetime", LIFETIME);
        }

        define("WEBROOT", "/var/www/html/");

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
        if (!defined("THEME")) define("THEME", "dark blue");
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

    //////////////////////////////////////////////////////////////////////////80
    // Load users last state
    //////////////////////////////////////////////////////////////////////////80
    public static function loadState() {
        $activeUser = SESSION("user");


        $userData = Common::loadJSON("users")[$activeUser];


        $activeProjectName = SESSION("projectName");
        $activeProjectPath = SESSION("projectPath");
        if ($activeProjectName && $activeProjectPath) {
            // Load currently active project in session, pulled from cache data in user class
            $projectName = $activeProjectName;
            $projectPath = $activeProjectPath;
        } else {
            // Load default/first project
            $projects_db = Common::getKeyStore("projects");

            $projectList = $projects_db->select("*");

            if ($userData["userACL"] !== "full") {
                $projectPath = reset($userData["userACL"]);
            } else {
                $projectPath = reset($projectList);
            }
            $projectName = array_search($projectPath, $projectList);

            // Set Session Project
            SESSION("projectPath", $projectPath);
            SESSION("projectName", $projectName);
        }


        $openFiles_db = Common::getObjStore("activeFiles");
        $result = $openFiles_db->select(array(["user", "==", $activeUser]));

        $openFiles = array();
        foreach ($result as $file) {
            $path = $file["path"];

            // Ensure path is correct when in workspace
            if (file_exists(Common::getWorkspacePath($path))) {
                $openFiles[] = $file;
            } else {

                // Invalid file path
                $where = array(["user", "==", $activeUser], ["path", "==", $path]);
                $openFiles_db->delete($where);
            }
        }

        $settings_db = Common::getKeyStore("settings", "users/" . $activeUser);
        $settings = $settings_db->select("*");

        return array(
            "userLastLogin" => $userData["lastLogin"],
            "projectName" => $projectName,
            "projectPath" => $projectPath,
            "projectIsRepo" => is_dir($projectPath . "/.git"),
            "openFiles" => $openFiles,
            "settings" => $settings,
            "text" => $projectName . " Loaded.",
        );
    }

    //////////////////////////////////////////////////////////////////////////80
    // Safe Execution Command
    //////////////////////////////////////////////////////////////////////////80
    public static function safe_execute($cmd, ...$args) {
        if (count($args) > 0) {
            // Sanitize every single argument.
            $safe_args = array_map("escapeshellarg", $args);
            // Replace placeholders in template with the sanitized arguments.
            $cmd = vsprintf(str_replace("?", "%s", $cmd), $safe_args);
        } else {
            $cmd = str_replace("?", "", $cmd);
            $cmd = str_replace("%%", "%", $cmd);
        }
        return Common::raw_execute($cmd);
    }

    //////////////////////////////////////////////////////////////////////////80
    // Raw Execution Command; call directly only when absolutely necessary.
    //////////////////////////////////////////////////////////////////////////80
    public static function raw_execute($cmd = null) {
        $result = [
            "code" => 417,
            "output" => ["common_missing_command"]
        ];

        if (!$cmd) return $result;
        $output = null;

        if (function_exists("system")) {
            ob_start();
            system($cmd, $result["code"]);
            $output = ob_get_clean();
        } elseif (function_exists("exec")) {
            $output = [];
            exec($cmd, $output, $result["code"]);
        }

        $result["output"] = is_array($output) ? $output : explode("\n", $output);
        return $result;
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