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

$action = Common::post('action') ?: Common::get('action');
$path = Common::post('path') ?: Common::get('path');
$repo = Common::post('repo') ?: Common::get('repo');

if (!$action) {
	die(Common::sendJSON("error", "missing action"));
}

if ($action !== 'scanForGit') {
	$CodeGit = new Git();
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
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'init':
		if ($path) {
			if ($CodeGit->init(getWorkspacePath($path))) {
				echo '{"status":"success","message":"Initialized empty Git repository!"}';
			} else {
				echo '{"status":"error","message":"' . $CodeGit->result . '!"}';
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'clone':
		if ($path && $repo && isset($_GET['init_submodules'])) {
			echo $CodeGit->cloneRepo(getWorkspacePath($path), $repo, $_GET['init_submodules']);
		} else {
			Common::sendJSON("error", "Missing parameter.");
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
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'commit':
		$message = Common::post('message');
		$files = Common::post('files');
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
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'diff':
		if ($repo && $path) {
			$result = $CodeGit->diff(getWorkspacePath($repo), $path);
			if ($result === false) {
				echo '{"status":"error","message":"Failed to get diff!"}';
			} else {
				echo $result;
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'checkout':
		if ($repo && $path) {
			if ($CodeGit->checkout(getWorkspacePath($repo), $path)) {
				echo '{"status":"success","message":"Changes reverted!"}';
			} else {
				echo '{"status":"error","message":"Failed to undo changes!"}';
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'getRemotes':
		if ($path) {
			$result = $CodeGit->getRemotes(getWorkspacePath($path));
			if ($result === false) {
				echo '{"status":"error","message":"Failed to get remotes!"}';
			} else {
				echo '{"status":"success","data":'. json_encode($result) .'}';
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'newRemote':
		if ($path && isset($_GET['name']) && isset($_GET['url'])) {
			$result = $CodeGit->newRemote(getWorkspacePath($path), $_GET['name'], $_GET['url']);
			if ($result === false) {
				echo '{"status":"error","message":"Failed to create remotes!"}';
			} else {
				echo '{"status":"success","message": "New Remote created."}';
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'removeRemote':
		if ($path && isset($_GET['name'])) {
			$result = $CodeGit->removeRemote(getWorkspacePath($path), $_GET['name']);
			if ($result === false) {
				echo '{"status":"error","message":"Failed to remove remote!"}';
			} else {
				echo '{"status":"success","message":"Remote removed!"}';
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'renameRemote':
		if ($path && isset($_GET['name']) && isset($_GET['newName'])) {
			$result = $CodeGit->renameRemote(getWorkspacePath($path), $_GET['name'], $_GET['newName']);
			if ($result === false) {
				echo '{"status":"error","message":"Failed to rename remote!"}';
			} else {
				echo '{"status":"success","message":"Remote renamed!"}';
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'getRemoteBranches':
		if ($path) {
			$result = $CodeGit->getRemoteBranches(getWorkspacePath($path));
			if ($result === false) {
				echo '{"status":"error","message":"Failed to get remote branches!"}';
			} else {
				echo '{"status":"success","data":'. json_encode($result) .'}';
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'checkoutRemote':
		if ($path && isset($_GET['name']) && isset($_GET['remoteName'])) {
			$result = $CodeGit->checkoutRemote(getWorkspacePath($path), $_GET['name'], $_GET['remoteName']);
			if ($result === false) {
				echo '{"status":"error","message":"Failed to checkout remote!"}';
			} else {
				echo '{"status":"success","message":"Remote checkedout!"}';
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'getBranches':
		if ($path) {
			$result = $CodeGit->getBranches(getWorkspacePath($path));
			if ($result === false) {
				echo '{"status":"error","message":"Failed to get branches!"}';
			} else {
				echo '{"status":"success","data":'. json_encode($result) .'}';
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'newBranch':
		if ($path && isset($_GET['name'])) {
			$result = $CodeGit->newBranch(getWorkspacePath($path), $_GET['name']);
			if ($result === false) {
				echo '{"status":"error","message":"Failed to create branch!"}';
			} else {
				echo '{"status":"success","message": "New branch created."}';
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'deleteBranch':
		if ($path && isset($_GET['name'])) {
			$result = $CodeGit->deleteBranch(getWorkspacePath($path), $_GET['name']);
			if ($result === false) {
				echo '{"status":"error","message":"Failed to delete branch!"}';
			} else {
				echo '{"status":"success","message":"Branch deleted!"}';
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'checkoutBranch':
		if ($path && isset($_GET['name'])) {
			$result = $CodeGit->checkoutBranch(getWorkspacePath($path), $_GET['name']);
			if ($result === false) {
				echo '{"status":"error","message":"Failed to checkout branch!"}';
			} else {
				echo '{"status":"success","message":"Switched to branch: ' . $_GET['name'] .'!"}';
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'renameBranch':
		if ($path && isset($_GET['name']) && isset($_GET['newName'])) {
			$result = $CodeGit->renameBranch(getWorkspacePath($path), $_GET['name'], $_GET['newName']);
			if ($result === false) {
				echo '{"status":"error","message":"Failed to rename branch!"}';
			} else {
				echo '{"status":"success","message":"Branch renamed!"}';
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'merge':
		if ($path && isset($_GET['name'])) {
			$result = $CodeGit->merge(getWorkspacePath($path), $_GET['name']);
			if ($result === false) {
				echo '{"status":"error","message":"Failed to merge branch!"}';
			} else {
				echo '{"status":"success","message":"Branch merged!"}';
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'push':
		if ($path && isset($_GET['remote']) && isset($_GET['branch'])) {
			echo $CodeGit->push(getWorkspacePath($path), $_GET['remote'], $_GET['branch']);
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'pull':
		if ($path && isset($_GET['remote']) && isset($_GET['branch'])) {
			echo $CodeGit->pull(getWorkspacePath($path), $_GET['remote'], $_GET['branch']);
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'fetch':
		if ($path && isset($_GET['remote'])) {
			echo $CodeGit->fetch(getWorkspacePath($path), $_GET['remote']);
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'rename':
		if ($path && isset($_GET['old_name']) && isset($_GET['new_name'])) {
			echo $CodeGit->renameItem(getWorkspacePath($path), $_GET['old_name'], $_GET['new_name']);
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'submodule':
		if ($repo && $path && isset($_GET['submodule'])) {
			echo $CodeGit->submodule(getWorkspacePath($repo), $path, $_GET['submodule']);
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'initSubmodule':
		if ($path) {
			echo $CodeGit->initSubmodule(getWorkspacePath($path));
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'numstat':
		if ($path) {
			$result = $CodeGit->numstat(getWorkspacePath($path));
			if ($result !== false) {
				echo $result;
			} else {
				echo '{"status":"error","message":"Failed to get numstat"}';
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'showCommit':
		if ($path && isset($_GET['commit'])) {
			echo $CodeGit->showCommit(getWorkspacePath($path), $_GET['commit']);
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'blame':
		if ($repo && $path) {
			$result = $CodeGit->blame(getWorkspacePath($repo), $path);
			if ($result === false) {
				echo '{"status":"error","message":"Failed to get diff!"}';
			} else {
				echo $result;
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'network':
		if ($path) {
			$result = $CodeGit->network(getWorkspacePath($path));
			if ($result === false) {
				echo '{"status":"error","message":"Failed to get network!"}';
			} else {
				echo '{"status":"success","data":'. json_encode($result) .'}';
			}
		} else {
			Common::sendJSON("error", "Missing parameter.");
		}
		break;

	case 'getSettings':
		if ($path) {
			$settings = $CodeGit->getSettings(getWorkspacePath($path));
			echo '{"status":"success","data":'. json_encode($settings) .'}';
		} else {
			Common::sendJSON("error", "Missing parameter.");
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
			Common::sendJSON("error", "Missing parameter.");
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