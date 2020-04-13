<?php
/*
 * Copyright (c) Codiad & Andr3as, distributed
 * as-is and without warranty under the MIT License.
 * See http://opensource.org/licenses/MIT for more information.
 * This information must remain intact.
 */
require_once('../../common.php');
require_once('class.git.php');

//////////////////////////////////////////////////////////////////
// Verify Session or Key
//////////////////////////////////////////////////////////////////
Common::checkSession();

set_time_limit(0); 

$action = Common::data('action');
$path = Common::data('path');
$repo = Common::data('repo');

if (!$action) {
	die(Common::sendJSON("error", "missing action"));
}

if ($action !== 'scanForGit') {
	$CodeGit = new CodeGit($path, $repo);
	define('CONFIG', 'git.' . $_SESSION['user'] . '.php');
}

switch ($action) {

	case 'scanForGit':
		if ($path) {
			$reply = array(
				"data" => false,
				"message" => "Repo not found",
				"status" => "success"
			);
			if (file_exists(getWorkspacePath($path . '/.git'))) {
				$reply["message"] = "Repo found";
				$reply["data"] = true;

			}
			Common::sendJSON("success", 'test');
		} else {
			Common::sendJSON("E403g");
		}
		break;

	case 'status':
		if ($path) {
			$result = $CodeGit->status(getWorkspacePath($path));
			if ($result === false) {
				Common::sendJSON("error", "Failed to get status.");
			} else {
				Common::sendJSON("success", $result);
			}
		} else {
			Common::sendJSON("E403g");
		}
		break;

	case 'commit':
		$message = Common::data('message');
		$files = Common::data('files');
		if ($path && $files && $message) {
			$files = explode(',', $files);

			foreach ($files as $file) {
				$added = $CodeGit->add($path, $file);
				if (!$added) {
					die(Common::sendJSON("error", "Could not add file: $file"));
				}
			}

			$result = $CodeGit->commit($path, $message);

			if ($result) {
				Common::sendJSON("success", "Files Committed.");
			} else {
				Common::sendJSON("error", "Files could not be committed.");
			}
		} else {
			Common::sendJSON("E403g");
		}
		break;

	case 'diff':
		if ($repo && $path) {
			$result = $CodeGit->loadDiff(getWorkspacePath($repo), $path);
			if ($result === false) {
				echo '{"status":"error","message":"Failed to get diff!"}';
			} else {
				echo $result;
			}
		} else {
			Common::sendJSON("E403g");
		}
		break;

	case 'push':
		if ($path && isset($_GET['remote']) && isset($_GET['branch'])) {
			echo $CodeGit->push(getWorkspacePath($path), $_GET['remote'], $_GET['branch']);
		} else {
			Common::sendJSON("E403g");
		}
		break;

	case 'pull':
		if ($path && isset($_GET['remote']) && isset($_GET['branch'])) {
			echo $CodeGit->pull(getWorkspacePath($path), $_GET['remote'], $_GET['branch']);
		} else {
			Common::sendJSON("E403g");
		}
		break;

	case 'fetch':
		if ($path && isset($_GET['remote'])) {
			echo $CodeGit->fetch(getWorkspacePath($path), $_GET['remote']);
		} else {
			Common::sendJSON("E403g");
		}
		break;

	case 'fileStatus':
		if ($path) {
			$result = $CodeGit->fileStatus(getWorkspacePath($path));
			if ($result !== false) {
				Common::sendJSON("success", $result);
			} else {
				Common::sendJSON("error", "Failed to get file stats.");
			}
		} else {
			Common::sendJSON("E403g");
		}
		break;

	case 'showCommit':
		if ($path && isset($_GET['commit'])) {
			echo $CodeGit->showCommit(getWorkspacePath($path), $_GET['commit']);
		} else {
			Common::sendJSON("E403g");
		}
		break;

	case 'blame':
		if ($repo && $path) {
			$result = $CodeGit->loadBlame(getWorkspacePath($repo), $path);
			if ($result === false) {
				echo '{"status":"error","message":"Failed to get diff!"}';
			} else {
				echo $result;
			}
		} else {
			Common::sendJSON("E403g");
		}
		break;

	case 'getSettings':
		if ($path) {
			$settings = $CodeGit->getSettings(getWorkspacePath($path));
			echo '{"status":"success","data":'. json_encode($settings) .'}';
		} else {
			Common::sendJSON("E403g");
		}
		break;

	case 'setSettings':
		if (isset($_POST['settings']) && $path) {
			$settings = json_decode($_POST['settings'], true);

			$pluginSettings = getJSON('git.settings.php', 'config');
			if ($pluginSettings['lockuser'] == "true") {
				$settings['username'] = $_SESSION['user'];
				if (strlen($settings['local_username']) != 0) {
					$settings['local_username'] = $_SESSION['user'];
				}
			}

			$CodeGit->setSettings($settings, getWorkspacePath($path));
			echo '{"status":"success","message":"Settings saved"}';
		} else {
			Common::sendJSON("E403g");
		}
		break;

	default:
		echo '{"status":"error","message":"No Type"}';
		break;
}


function getWorkspacePath($path) {
	//Security check
	if (!Common::checkPath($path)) {
		die('{"status":"error","message":"Invalid path"}');
	}
	if (strpos($path, "/") === 0) {
		//Unix absolute path
		return $path;
	}
	if (strpos($path, ":/") !== false) {
		//Windows absolute path
		return $path;
	}
	if (strpos($path, ":\\") !== false) {
		//Windows absolute path
		return $path;
	}
	return WORKSPACE."/".$path;
}
?>