<?php

//////////////////////////////////////////////////////////////////////////////80
// Check trait
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

trait Check {

	//////////////////////////////////////////////////////////////////////////80
	// Check if user can configure Atheos
	//////////////////////////////////////////////////////////////////////////80
	public static function checkAccess($permission = "configure") {
		$users = Common::loadJSON("users");
		$activeUser = SESSION("user");

		if (array_key_exists($activeUser, $users)) {
			$permissions = $users[$activeUser]["permissions"];
			return in_array($permission, $permissions);
		} else {
			return false;
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Check Path
	//////////////////////////////////////////////////////////////////////////80
	public static function checkPath($path) {
		$users = Common::loadJSON("users");
		$activeUser = SESSION("user");
		// $projects = Common::loadJSON("projects");
		$projects = Common::getKeyStore("projects")->select("*");

		if (!array_key_exists($activeUser, $users)) return false;

		$userACL = $users[$activeUser]["userACL"];

		if ($userACL === "full") {
			return true;
		} else {
			foreach ($projects as $projectName => $projectPath) {
				if (!in_array($projectPath, $userACL)) continue;

				if (strpos($path, $projectPath) === 0 || strpos($path, WORKSPACE . "/$projectPath") === 0) {
					return true;
				}
			}
		}
		return false;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Check Session
	//////////////////////////////////////////////////////////////////////////80
	public static function checkSession() {
		$loose_ip = long2ip(ip2long(SERVER("REMOTE_ADDR")) & ip2long("255.255.0.0"));

		$userAgent = SERVER("HTTP_USER_AGENT") || md5("userAgent" . $loose_ip);
		$encoding = SERVER("HTTP_ACCEPT_ENCODING") || md5("encoding" . $loose_ip);
		$language = SERVER("HTTP_ACCEPT_LANGUAGE") || md5("language" . $loose_ip);

		//Some security checks, helps with securing the service
		if (SESSION("user") && SESSION("LOOSE_IP")) {
			$destroy = false;

			$destroy = $destroy ?: SESSION("LOOSE_IP") !== $loose_ip;
			$destroy = $destroy ?: SESSION("AGENT_STRING") !== $userAgent;
			$destroy = $destroy ?: SESSION("ACCEPT_ENCODING") !== $encoding;
			$destroy = $destroy ?: SESSION("ACCEPT_LANGUAGE") !== $language;

			if ($destroy) {
				session_unset();
				session_destroy();
				Common::send("error", "Security violation.");
			}

			SESSION("LAST_ACTIVE", time()); // Reset user activity timer
		} else {
			//Store identification data so we can detect malicous logins potentially. (Like XSS)
			SESSION("AGENT_STRING", $userAgent);
			SESSION("ACCEPT_ENCODING", $encoding);
			SESSION("ACCEPT_LANGUAGE", $language);
			SESSION("LOOSE_IP", $loose_ip);
			SESSION("LAST_ACTIVE", time()); // Set user activity timer
		}

		if (!SESSION("user")) {
			Common::send("error", "Authentication error");
		}
	}
}