<?php

//////////////////////////////////////////////////////////////////////////////80
// Project Controller
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once("class.project.php");

$activeName = SESSION("projectName");
$activePath = SESSION("projectPath");

$projectName = POST("projectName");
$projectPath = POST("projectPath");

$gitRepo = POST("gitRepo");
$gitBranch = POST("gitBranch");

$Project = new Project();

switch ($action) {
    //////////////////////////////////////////////////////////////////////////80
    // Create Project
    //////////////////////////////////////////////////////////////////////////80
    case "create":
        if (!Common::checkAccess("configure")) {
            Common::send(403, "User does not have access.");
        } elseif (!$projectName) {
            Common::send(417, "Missing project name.");
        } else {
            $projectPath = $projectPath ? $projectPath : $projectName;
            $Project->create($projectName, $projectPath, $gitRepo, $gitBranch);
        }

        break;

    //////////////////////////////////////////////////////////////////////////80
    // Return Current
    //////////////////////////////////////////////////////////////////////////80
    case "current":
        if ($activeName) {
            Common::send(200, array("name" => $activeName, "path" => $activePath));
        } else {
            Common::send(404, i18n("project_noActive"));
        }
        break;

    //////////////////////////////////////////////////////////////////////////80
    // Delete Project
    //////////////////////////////////////////////////////////////////////////80
    case "delete":
        if (!Common::checkAccess("configure")) {
            Common::send(403, "User does not have access.");
        } elseif (!$projectName) {
            Common::send(417, "Missing project name.");
        } else {
            $scope = POST("scope");
            $Project->delete($projectName, $scope);
        }

        break;

    //////////////////////////////////////////////////////////////////////////80
    // Open Project
    //////////////////////////////////////////////////////////////////////////80
    case "open":
        if ($projectPath === "@TH305" && Common::checkAccess("configure")) {
            $projectName = "Atheos IDE";
            $projectPath = BASE_PATH;
        } elseif ($projectPath === "W3BR00T" && Common::checkAccess("configure")) {
            $projectName = "Web Root";
            $projectPath = WEBROOT;
        }

        if (!Common::checkPath($projectPath)) {
            Common::send(403, "User does not have access.");
        } elseif (!$projectName || !$projectPath) {
            Common::send(417, "Missing project name or path.");
        } else {
            $Project->open($projectName, $projectPath);
        }

        break;

    //////////////////////////////////////////////////////////////////////////80
    // Rename Project
    //////////////////////////////////////////////////////////////////////////80
    case "rename":
        $oldName = POST("oldName");
        $newName = POST("newName");

        if (!Common::checkAccess("configure")) {
            Common::send(403, "User does not have access.");
        } elseif (!$projectName || !$projectPath) {
            Common::send(417, "Missing project path or name.");
        } else {
            $Project->rename($oldName, $newName, $projectPath);
        }

        break;

    default:
        Common::send(416, "Invalid action.");
        break;
}