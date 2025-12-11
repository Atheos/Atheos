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
    private $menuItems = array(
        //////////////////////////////////////////////////////////////////////80
        // Folder Actions
        //////////////////////////////////////////////////////////////////////80
        [
            "title" => "fileNew",
            "location" => "fileTree",
            "icon" => "fas fa-plus-circle",
            "type" => "folder",
            "action" => "atheos.filetree.createFile"
        ],
        [
            "title" => "folderNew",
            "location" => "fileTree",
            "icon" => "fas fa-folder",
            "type" => "folder",
            "action" => "atheos.filetree.createFolder"
        ],
        [
            "title" => "filesUpload",
            "location" => "fileTree",
            "icon" => "fas fa-upload",
            "type" => "folder",
            "action" => "atheos.transfer.openUpload"
        ],
        [
            "title" => "hr_directory",
            "location" => "fileTree",
            "type" => "folder",
        ],
        //////////////////////////////////////////////////////////////////////80
        // Generic Actions
        //////////////////////////////////////////////////////////////////////80
        // [
        // 	"title" => "cut",
        // 	"icon" => "fas fa-cut",
        // 	"action" => "atheos.filetree.cut"
        // ],
        [
            "title" => "copy",
            "location" => "fileTree",
            "icon" => "fas fa-copy",
            "action" => "atheos.filetree.copy"
        ],
        [
            "title" => "paste",
            "location" => "fileTree",
            "icon" => "fas fa-paste",
            "type" => "folder",
            "action" => "atheos.filetree.paste"
        ],
        [
            "title" => "duplicate",
            "location" => "fileTree",
            "icon" => "fas fa-clone",
            "action" => "atheos.filetree.openDuplicate"
        ],
        [
            "title" => "download",
            "location" => "fileTree",
            "icon" => "fas fa-download",
            "action" => "atheos.transfer.download"
        ],
        [
            "title" => "extract",
            "location" => "fileTree",
            "icon" => "fas fa-file-export",
            "type" => "file",
            "fTypes" => ["zip", "tar", "tar.gz"],
            "action" => "atheos.filetree.extract"
        ],
        [
            "title" => "preview",
            "location" => "fileTree",
            "icon" => "fas fa-eye",
            "type" => "file",
            "fTypes" => ["php", "html"],
            "action" => "atheos.filetree.openInBrowser"
        ],
        // [
        // 	"title" => "preview",
        // 	"icon" => "fas fa-eye",
        // 	"type" => "file",
        // 	"fTypes" => ["jpg", "png", "svg"],
        // 	"action" => "atheos.filetree.openInModal"
        // ],
        //////////////////////////////////////////////////////////////////////80
        // Non-root Actions
        //////////////////////////////////////////////////////////////////////80
        [
            "title" => "hr_noRoot",
            "location" => "fileTree",
            "noRoot" => true,
        ],
        [
            "title" => "rename",
            "location" => "fileTree",
            "icon" => "fas fa-pencil-alt",
            "noRoot" => true,
            "action" => "atheos.filetree.openRename"
        ],
        [
            "title" => "delete",
            "location" => "fileTree",
            "icon" => "fas fa-trash-alt",
            "noRoot" => true,
            "action" => "atheos.filetree.delete"
        ],
        //////////////////////////////////////////////////////////////////////80
        // Folder Actions
        //////////////////////////////////////////////////////////////////////80
        [
            "title" => "hr_folder",
            "location" => "fileTree",
            "type" => "folder",
        ],
        [
            "title" => "rescan",
            "location" => "fileTree",
            "icon" => "fas fa-sync-alt",
            "type" => "folder",
            "action" => "atheos.filetree.rescan"
        ],
        //////////////////////////////////////////////////////////////////////80
        // Git Folder Actions
        //////////////////////////////////////////////////////////////////////80
        [
            "title" => "hr_git_folder",
            "location" => "fileTree",
            "type" => "folder",
        ],
        [
            "title" => "codegit_open",
            "location" => "fileTree",
            "icon" => "fas fa-code-branch",
            "type" => "folder",
            "isRepo" => true,
            "action" => "atheos.codegit.showCodeGit"
        ],
        [
            "title" => "git_init",
            "location" => "fileTree",
            "icon" => "fas fa-code-branch",
            "type" => "folder",
            "isRepo" => false,
            "action" => "atheos.codegit.gitInit"
        ],
        [
            "title" => "git_clone",
            "location" => "fileTree",
            "icon" => "fas fa-code-branch",
            "type" => "folder",
            "action" => "atheos.codegit.gitClone"
        ],
        //////////////////////////////////////////////////////////////////////80
        // Git File Actions
        //////////////////////////////////////////////////////////////////////80
        [
            "title" => "hr_git_file",
            "location" => "fileTree",
            "type" => "file",
            "inRepo" => true
        ],
        [
            "title" => "git_diff",
            "location" => "fileTree",
            "icon" => "fas fa-code-branch",
            "type" => "file",
            "inRepo" => true,
            "action" => "atheos.codegit.diff"
        ],
        [
            "title" => "git_blame",
            "location" => "fileTree",
            "icon" => "fas fa-code-branch",
            "type" => "file",
            "inRepo" => true,
            "action" => "atheos.codegit.blame"
        ],
        [
            "title" => "git_log",
            "location" => "fileTree",
            "icon" => "fas fa-code-branch",
            "type" => "file",
            "inRepo" => true,
            "action" => "atheos.codegit.log"
        ],


        //////////////////////////////////////////////////////////////////////80
        // FileTab Items:
        //////////////////////////////////////////////////////////////////////80
        [
            "title" => "save",
            "location" => "fileTab",
            "icon" => "fas fa-save",
            "action" => "atheos.editor.save"
        ],
        [
            "title" => "reload",
            "location" => "fileTab",
            "icon" => "fas fa-sync-alt",
            "action" => "atheos.editor.reset"
        ],
        [
            "title" => "reset",
            "location" => "fileTab",
            "icon" => "fas fa-sync-alt",
            "action" => "atheos.editor.reload"
        ],

        //////////////////////////////////////////////////////////////////////80
        // Editor Items:
        //////////////////////////////////////////////////////////////////////80
        [
            "title" => "selectAll",
            "location" => "editor",
            "icon" => "fas fa-object-group",
            "action" => "atheos.editor.selectAllText"
        ],
        [
            "title" => "cut",
            "location" => "editor",
            "icon" => "fas fa-scissors",
            "action" => "atheos.editor.cutToClipboard"
        ],
        [
            "title" => "copy",
            "location" => "editor",
            "icon" => "fas fa-copy",
            "action" => "atheos.editor.copyToClipboard"
        ],
        [
            "title" => "paste",
            "location" => "editor",
            "icon" => "fas fa-paste",
            "action" => "atheos.editor.pasteFromClipboard"
        ],
        [
            "title" => "hr_search",
            "location" => "editor"
        ],
        [
            "title" => "find",
            "location" => "editor",
            "icon" => "fas fa-search",
            "action" => "atheos.editor.openFind"
        ],
        [
            "title" => "replace",
            "location" => "editor",
            "icon" => "fas fa-wand-magic-sparkles",
            "action" => "atheos.editor.openReplace"
        ],
        [
            "title" => "gotoLine",
            "location" => "editor",
            "icon" => "fas fa-scroll",
            "action" => "atheos.editor.openGotoLine"
        ],
    );

    //////////////////////////////////////////////////////////////////////////80
    // Load Context loadMenus
    //////////////////////////////////////////////////////////////////////////80
    public function loadMenus() {
        $tempFileTree = array();
        $tempFileTab = array();
        $tempEditor = array();

        foreach ($this->menuItems as $item) {
            if (isset($item["title"])) {
                $item["title"] = strpos($item["title"], "hr_") ? $item["title"] : i18n($item["title"]);
            }
            if (isset($item["admin"]) && $item["admin"] && !Common::checkAccess("configure")) continue;

            if ($item["location"] === "fileTree") {
                $tempFileTree[] = $item;

            } else if ($item["location"] === "fileTab") {
                $tempFileTab[] = $item;

            } else if ($item["location"] === "editor") {
                $tempEditor[] = $item;

            }
        }

        Common::send(200, array(
            "fileTreeItems" => $tempFileTree,
            "fileTabItems" => $tempFileTab,
            "editorItems" => $tempEditor,
        ));
    }
}