<?php
//////////////////////////////////////////////////////////////////////////////80
// CodeGit Controller
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Andr3as, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once(__DIR__ . "/../../common.php");

require_once("class.git.php");

$action = Common::data('action');

$repo = Common::data('repo');
$path = Common::data('path');

$repo = Common::getWorkspacePath($repo);
$path = Common::getWorkspacePath($path);

$CodeGit = new CodeGit($path, $repo);


switch ($action) {

	// Check status of overall repo, mostly used for the banner
	case 'repoStatus':
		$CodeGit->repoStatus();
		break;

	case 'fileStatus':
		if ($path) {
			$CodeGit->fileStatus($path);
		} else {
			Common::sendJSON("E403g");
		}
		break;

	// Adds and commits with message
	case 'commit':
		$message = Common::data('message');
		$files = Common::data('files');
		if ($repo && $files && $message) {
			$CodeGit->commit($message, $files);
		} else {
			Common::sendJSON("E403g");
		}
		break;

	case 'clone':
		$repoURL = Common::data('repoURL');
		if ($path && $repoURL) {
			$CodeGit->cloneRepo($path, $repoURL);
		} else {
			Common::sendJSON("E403g");
		}
		break;

	case 'transfer':
		$type = Common::data('type');
		$remote = Common::data('remote');
		$branch = Common::data('branch');

		if ($type && $repo && $remote && $branch) {
			switch ($type) {
				case 'pull':
					$CodeGit->pull($repo, $remote, $branch);
					break;
				case 'push':
					$CodeGit->push($repo, $remote, $branch);
					break;
				case 'fetch':
					$CodeGit->fetch($repo, $remote, $branch);
					break;
			}
		} else {
			Common::sendJSON("E403g");
		}
		break;

	case 'init':
		$type = Common::data('type');
		
		if ($repo && $type) {
			$CodeGit->init($repo, $type);
		} else {
			Common::sendJSON("E403g");
		}
		break;

	case 'checkout':
		$file = Common::data("file");
		if ($repo && $file) {
			$CodeGit->checkout($repo, $file);
		} else {
			Common::sendJSON("E403g");
		}
		break;

	case 'configure':
		$settings = array(
			"type" => Common::data("type"),
			"name" => Common::data("name"),
			"email" => Common::data("email")
		);

		$result = $CodeGit->settings($repo, $settings);

		Common::sendJSON("success", $result);

		break;

	//////////////////////////////////////////////////////////////////////////80
	// Default: Invalid Action
	//////////////////////////////////////////////////////////////////////////80
	default:
		Common::sendJSON("E401i");
		break;
}