<?php

//////////////////////////////////////////////////////////////////////////////80
// TextMode
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @ccvca, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class ContextMenu {

	//////////////////////////////////////////////////////////////////////////80
	// Default File Manager Menu Map
	//////////////////////////////////////////////////////////////////////////80
	private $fileMenu = array(
		//////////////////////////////////////////////////////////////////////80
		// Folder Actions
		//////////////////////////////////////////////////////////////////////80
		[
			"title" => "fileNew",
			"icon" => "fas fa-plus-circle",
			"type" => "folder",
			"action" => "atheos.filemanager.createFile"
		],
		[
			"title" => "folderNew",
			"icon" => "fas fa-folder",
			"type" => "folder",
			"action" => "atheos.filemanager.createFolder"
		],
		[
			"title" => "filesUpload",
			"icon" => "fas fa-upload",
			"type" => "folder",
			"action" => "atheos.transfer.openUpload"
		],
		[
			"title" => "hr-directory",			
			"type" => "folder",
		],
		//////////////////////////////////////////////////////////////////////80
		// Generic Actions
		//////////////////////////////////////////////////////////////////////80
		[
			"title" => "copy",
			"icon" => "fas fa-copy",
			"action" => "atheos.filemanager.copy"
		],
		[
			"title" => "paste",
			"icon" => "fas fa-paste",
			"type" => "folder",
			"action" => "atheos.filemanager.paste"
		],
		[
			"title" => "duplicate",
			"icon" => "fas fa-clone",
			"action" => "atheos.filemanager.openDuplicate"
		],
		[
			"title" => "download",
			"icon" => "fas fa-download",
			"action" => "atheos.transfer.download"
		],
		//////////////////////////////////////////////////////////////////////80
		// Non-root Actions
		//////////////////////////////////////////////////////////////////////80
		[
			"title" => "hr-noRoot",
			"noRoot" => true,
		],
		[
			"title" => "rename",
			"icon" => "fas fa-pencil-alt",
			"noRoot" => true,
			"action" => "atheos.filemanager.openRename"
		],
		[
			"title" => "delete",
			"icon" => "fas fa-trash-alt",
			"noRoot" => true,
			"action" => "atheos.filemanager.delete"
		],
		//////////////////////////////////////////////////////////////////////80
		// Folder Actions
		//////////////////////////////////////////////////////////////////////80
		[
			"title" => "hr-folder",
			"type" => "folder",
		],
		[
			"title" => "rescan",
			"icon" => "fas fa-sync-alt",
			"type" => "folder",
			"action" => "atheos.filemanager.rescan"
		],
		//////////////////////////////////////////////////////////////////////80
		// Git Folder Actions
		//////////////////////////////////////////////////////////////////////80
		[
			"title" => "hr-git-folder",
			"type" => "folder",
		],
		[
			"title" => "codegit_open",
			"icon" => "fas fa-code-branch",
			"type" => "folder",
			"isRepo" => true,
			"action" => "atheos.codegit.showCodeGit"
		],
		[
			"title" => "git_init",
			"icon" => "fas fa-code-branch",
			"type" => "folder",
			"isRepo" => false,
			"action" => "atheos.codegit.gitInit"
		],
		[
			"title" => "git_clone",
			"icon" => "fas fa-code-branch",
			"type" => "folder",
			"action" => "atheos.codegit.gitClone"
		],
		//////////////////////////////////////////////////////////////////////80
		// Git File Actions
		//////////////////////////////////////////////////////////////////////80
		[
			"title" => "hr-git-file",
			"type" => "file",
			"inRepo" => true
		],
		[
			"title" => "git_diff",
			"icon" => "fas fa-code-branch",
			"type" => "file",
			"inRepo" => true,
			"action" => "atheos.codegit.diff"
		],
		[
			"title" => "git_blame",
			"icon" => "fas fa-code-branch",
			"type" => "file",
			"inRepo" => true,
			"action" => "atheos.codegit.blame"
		],
		[
			"title" => "git_log",
			"icon" => "fas fa-code-branch",
			"type" => "file",
			"inRepo" => true,
			"action" => "atheos.codegit.log"
		]
	);


	private $tabMenu = array();

	//////////////////////////////////////////////////////////////////////////80
	// Load Context loadMenus
	//////////////////////////////////////////////////////////////////////////80
	public function loadMenus() {
		$temp = array();
		foreach ($this->fileMenu as $item) {
			if (isset($item["title"])) $item["title"] = i18n($item["title"]);
			if (isset($item["admin"]) && $item["admin"] && !Common::checkAccess("configure")) continue;

			$temp[] = $item;
		}

		Common::send("success", array(
			"fileMenu" => $temp,
			"tabMenu" => $this->tabMenu
		));
	}
}