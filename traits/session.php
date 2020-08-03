<?php

//////////////////////////////////////////////////////////////////////////////80
// Session trait
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

trait Session {

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



}