<?php

//////////////////////////////////////////////////////////////////////////////80
// User
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

//////////////////////////////////////////////////////////////////
// Verify Session or Key
//////////////////////////////////////////////////////////////////
if ($action != 'authenticate') {
	Common::checkSession();
}

if ($action) {

	$User = new User();

	$username = Common::data('username');
	$password = Common::data('password');
	$activeProject = Common::data('activeProject');
	$userACL = Common::data('project');
	$language = Common::data('language');
	$theme = Common::data('theme');

	if ($username) {
		$username = User::cleanUsername($username);
	}

	switch ($action) {
		//////////////////////////////////////////////////////////////////
		// Authenticate / LogIn
		//////////////////////////////////////////////////////////////////
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

		//////////////////////////////////////////////////////////////////
		// Verify Session
		//////////////////////////////////////////////////////////////////
		case 'keepAlive':

			$User->username = Common::data("user", "session");
			$User->verify();

			break;

		//////////////////////////////////////////////////////////////////
		// Logout
		//////////////////////////////////////////////////////////////////
		case 'logout':
			session_unset();
			session_destroy();
			session_start();

			break;

		//////////////////////////////////////////////////////////////////
		// Create User
		//////////////////////////////////////////////////////////////////
		case 'create':

			if (checkAccess()) {
				if (!$username || !$password) {
					die(Common::sendJSON("error", "Missing username or password"));
				}

				$User->username = User::cleanUsername($_POST['username']);
				$User->password = $_POST['password'];
				$User->create();
			}

			break;

		//////////////////////////////////////////////////////////////////
		// Delete User
		//////////////////////////////////////////////////////////////////
		case 'delete':

			if (checkAccess()) {
				if (!$username) {
					die(Common::sendJSON("error", "Missing username"));
				}

				// $User->username = $_GET['username'];
				$User->username = $username;
				$User->delete();
			}

			break;

		//////////////////////////////////////////////////////////////////
		// Change Password
		//////////////////////////////////////////////////////////////////

		case 'password':
			if (!$username || !$password) {
				die(Common::sendJSON("error", "Missing username or password"));
			}

			if (checkAccess() || $username === Common::data("user", "session")) {
				$User->username = $username;
				$User->password = $password;
				$User->changePassword();
			}

			break;

		//////////////////////////////////////////////////////////////////
		// Set Project Access
		//////////////////////////////////////////////////////////////////
		case 'changeUserACL':
			if (checkAccess()) {
				if (!$username) {
					die(Common::sendJSON("error", "Missing username"));
				}
				$User->username = $username;
				$User->userACL = $userACL;
				$User->changeUserACL();
			}
			break;

		//////////////////////////////////////////////////////////////////
		// Change Project
		//////////////////////////////////////////////////////////////////

		case 'saveActiveProject':
			if (!isset($activeProject)) {
				die(Common::sendJSON("error", "Missing project"));
			}

			$User->username = Common::data("user", "session");

			$User->activeProject = $activeProject;
			$User->saveActiveProject();

			break;

		//////////////////////////////////////////////////////////////////
		// Default: Invalid Action
		//////////////////////////////////////////////////////////////////
		default:
			echo '{"status":"error","message":"Invalid action"}';
			break;
	}
} else {
	die(Common::sendJSON("error", "missing action"));
}