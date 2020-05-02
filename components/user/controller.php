<?php

//////////////////////////////////////////////////////////////////////////////80
// User Controller
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once '../../common.php';
require_once 'class.user.php';

$action = Common::data('action');

//////////////////////////////////////////////////////////////////////////////80
// Verify Session or Key
//////////////////////////////////////////////////////////////////////////////80
if ($action !== 'authenticate') {
	Common::checkSession();
}

if (!$action) {
	Common::sendJSON("E401m");
	die;
}

$User = new User();

$username = Common::data('username');
$password = Common::data('password');
$activeProject = Common::data('activeProject');
$userACL = Common::data('userACL');
$language = Common::data('language');
$theme = Common::data('theme');

if ($username) {
	$username = User::cleanUsername($username);
}

switch ($action) {
	//////////////////////////////////////////////////////////////////////////80
	// Authenticate / LogIn
	//////////////////////////////////////////////////////////////////////////80
	case 'authenticate':
		if ($username && $password) {
			$User->username = $username;
			$User->password = $password;

			require_once '../../languages/code.php';
			if ($language && isset($languages[$language])) {
				// if (isset($lang) && isset($languages[$lang])) {
				$User->lang = $language;
			} else {
				$User->lang = 'en';
			}

			// theme
			$User->theme = $theme;
			$User->authenticate();
		} else {
			Common::sendJSON("E403g");
			die;
		}
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Change Password
	//////////////////////////////////////////////////////////////////////////80
	case 'changePassword':
		if (!$username || !$password) {
			die(Common::sendJSON("error", "Missing username or password"));
		}

		if (Common::checkAccess("configure") || $username === Common::data("user", "session")) {
			$User->username = $username;
			$User->password = $password;
			$User->changePassword();
		}
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Create User
	//////////////////////////////////////////////////////////////////////////80
	case 'create':
		if (Common::checkAccess("configure")) {
			if (!$username || !$password) {
				die(Common::sendJSON("error", "Missing username or password"));
			}

			$User->username = User::cleanUsername($username);
			$User->password = $password;
			$User->create();
		}
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Delete User
	//////////////////////////////////////////////////////////////////////////80
	case 'delete':
		if (Common::checkAccess("configure")) {
			if (!$username) {
				die(Common::sendJSON("error", "Missing username"));
			}

			$User->username = $username;
			$User->delete();
		}
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Verify Session
	//////////////////////////////////////////////////////////////////////////80
	case 'keepAlive':

		$User->username = Common::data("user", "session");
		$User->verify();
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Logout
	//////////////////////////////////////////////////////////////////////////80
	case 'logout':
		session_unset();
		session_destroy();
		session_start();
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Save Active Project
	//////////////////////////////////////////////////////////////////////////80
	case 'saveActiveProject':
		if (!isset($activeProject)) {
			die(Common::sendJSON("error", "Missing project"));
		}
		$User->username = Common::data("user", "session");
		$User->activeProject = $activeProject;
		$User->saveActiveProject();
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Set Project Access
	//////////////////////////////////////////////////////////////////////////80
	case 'updateACL':
		if (Common::checkAccess("configure")) {
			if (!$username) {
				die(Common::sendJSON("error", "Missing username"));
			}
			$User->username = $username;
			$User->userACL = $userACL;
			$User->updateACL();
		}
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Default: Invalid Action
	//////////////////////////////////////////////////////////////////////////80
	default:
		echo '{"status":"error","message":"Invalid action"}';
		break;
}