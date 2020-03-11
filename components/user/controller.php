<?php

/*
    *  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
    *  as-is and without warranty under the MIT License. See
    *  [root]/license.txt for more. This information must remain intact.
    */

require_once('../../common.php');
require_once('class.user.php');

$action = '';

if (isset($_GET['action'])) {
	$action = $_GET['action'];
}elseif(isset($_POST['action'])){
	$action = $_POST['action'];
} else {
	die(Common::sendJSON("error", "Missing action"));
}


//////////////////////////////////////////////////////////////////
// Verify Session or Key
//////////////////////////////////////////////////////////////////

if ($action != 'authenticate') {
	checkSession();
}

$User = new User();

$username = false;
$password = false;
$project = false;
$language = false;
$theme = false;

if (isset($_POST["username"])) {
	$username = User::CleanUsername($_POST["username"]);
}
if (isset($_POST["password"])) {
	$password = $_POST["password"];
}
if (isset($_POST["project"])) {
	$project = $_POST["project"];
}
if (isset($_POST["language"])) {
	$lang = $_POST["language"];
}
if (isset($_POST["theme"])) {
	$theme = $_POST["theme"];
}


switch ($action) {
	//////////////////////////////////////////////////////////////////
	// Authenticate / LogIn
	//////////////////////////////////////////////////////////////////
	case 'authenticate':
		if ($username && $password) {
			// $User->username = $_POST['username'];
			$User->username = User::CleanUsername($username);
			$User->password = $password;

			// check if the asked languages exist and is registered in languages/code.php

			
				require_once '../../languages/code.php';
				if (isset($lang) && isset($languages[$lang])) {
					$User->lang = $lang;
				} else {
					$User->lang = 'en';
				}
			
			// theme
			$User->theme = $theme;
			$User->Authenticate();
		} else {
			die(Common::sendJSON("error", "Missing username or password"));
		}
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
	// Verify Session
	//////////////////////////////////////////////////////////////////
	case 'verify':
		$User->username = $_SESSION['user'];
		$User->Verify();

		break;

	//////////////////////////////////////////////////////////////////
	// Create User
	//////////////////////////////////////////////////////////////////
	case 'create':

		if (checkAccess()) {
			if (!$username || !$password) {
				die(Common::sendJSON("error", "Missing username or password"));
			}

			$User->username = User::CleanUsername($_POST['username']);
			$User->password = $_POST['password'];
			$User->Create();
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
			$User->Delete();
		}

		break;

	//////////////////////////////////////////////////////////////////
	// Change Password
	//////////////////////////////////////////////////////////////////

	case 'password':
		if (!isset($_POST['username']) || !isset($_POST['password'])) {
			die(Common::sendJSON("error", "Missing username or password"));
		}

		if (checkAccess() || $_POST['username'] == $_SESSION['user']) {
			$User->username = $_POST['username'];
			$User->password = $_POST['password'];
			$User->Password();
		}

		break;

	//////////////////////////////////////////////////////////////////
	// Set Project Access
	//////////////////////////////////////////////////////////////////
	case 'setUserACL':
		if (checkAccess()) {
			if (!$username) {
				die(Common::sendJSON("error", "Missing username"));
			}
			// $User->username = $_GET['username'];
			$User->username = $username;

			//No project selected
			if (isset($project)) {
				$User->projects = $project;
			} else {
				$User->projects = array();
			}
			$User->Project_Access();
		}
		break;

	//////////////////////////////////////////////////////////////////
	// Change Project
	//////////////////////////////////////////////////////////////////

	case 'saveActiveProject':
		if (!isset($project)) {
			die(Common::sendJSON("error", "Missing project"));
		}

		$User->username = $_SESSION['user'];
		$User->project = $project;
		$User->Project();

		break;

	//////////////////////////////////////////////////////////////////
	// Default: Invalid Action
	//////////////////////////////////////////////////////////////////
	default:
		echo '{"status":"error","message":"Invalid action"}';
		break;
}
