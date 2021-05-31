<?php
//////////////////////////////////////////////////////////////////////////////80
// CodeGit Controller
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Andr3as, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once("class.git.php");

$repo = POST('repo');
$path = POST('path');

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
			Common::send("error", "Missing path.");
		}
		break;

	// Adds and commits with message
	case 'commit':
		$message = POST('message');
		$files = POST('files');
		if ($repo && $files && $message) {
			$CodeGit->commit($message, $files);
		} else {
			Common::send("error", "Missing repo, file or message.");
		}
		break;

	case 'clone':
		$repoURL = POST('repoURL');
		if ($path && $repoURL) {
			$CodeGit->cloneRepo($path, $repoURL);
		} else {
			Common::send("error", "Missing path or URL.");
		}
		break;

	case 'transfer':
		$type = POST('type');
		$remote = POST('remote');
		$branch = POST('branch');

		if ($type && $repo && $remote && $branch) {
			switch ($type) {
				case 'pull':
					$CodeGit->pull($remote, $branch);
					break;
				case 'push':
					$CodeGit->push($remote, $branch);
					break;
				case 'fetch':
					$CodeGit->fetch($remote, $branch);
					break;
			}
		} else {
			Common::send("error", "Missing type, repo, remote, or branch.");
		}
		break;

	case 'init':
		$type = POST('type');

		if ($repo && $type) {
			$CodeGit->init($repo, $type);
		} else {
			Common::send("error", "Missing repo or type.");
		}
		break;

	case 'checkout':
		$file = POST("file");
		if ($repo && $file) {
			$CodeGit->checkout($repo, $file);
		} else {
			Common::send("error", "Missing repo or file.");
		}
		break;

	case 'configure':
		$settings = array(
			"type" => POST("type"),
			"name" => POST("name"),
			"email" => POST("email")
		);

		$result = $CodeGit->settings($repo, $settings);

		Common::send("success", $result);

		break;

	//////////////////////////////////////////////////////////////////////////80
	// Default: Invalid Action
	//////////////////////////////////////////////////////////////////////////80
	default:
		Common::send("error", "Invalid action.");
		break;
}