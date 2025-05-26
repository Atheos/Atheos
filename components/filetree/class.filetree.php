<?php

//////////////////////////////////////////////////////////////////////////////80
// File Tree Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once("vendor/differential/diff_match_patch.php");

class FileTree {

    //////////////////////////////////////////////////////////////////////////80
    // METHODS
    //////////////////////////////////////////////////////////////////////////80

    // -----------------------------||----------------------------- //

    //////////////////////////////////////////////////////////////////////////80
    // Create (Creates a new file or directory)
    //////////////////////////////////////////////////////////////////////////80
    public function create($path, $type) {

        if (file_exists($path)) {
            Common::send(409, i18n("path_exists"));
        }

        // $path = strip_tags($path);
        $path = htmlspecialchars($path);

        if ($type === "folder" && @mkdir($path)) {
            Common::send(200);
        } elseif ($type === "file" && $file = fopen($path, "w")) {
            $modifyTime = filemtime($path);
            fclose($file);
            Common::send(200, array("modifyTime" => $modifyTime));
        } else {
            // $error = error_get_last();
            Common::send(506, i18n("path_unableCreate"));
        }
    }

    //////////////////////////////////////////////////////////////////////////80
    // Delete (Deletes a file or directory (+contents))
    //////////////////////////////////////////////////////////////////////////80
    public function delete($path) {
        if (!file_exists($path)) {
            Common::send(418, "Invalid path.");
        }

        if (is_dir($path)) {
            $path = preg_replace("/[\/]+/", "/", "$path/");
        }

        Common::rDelete($path);
        Common::send(200);
    }

    //////////////////////////////////////////////////////////////////////////80
    // Duplicate (Creates a duplicate of the object - (cut/copy/paste)
    //////////////////////////////////////////////////////////////////////////80
    public function duplicate($path, $dest) {
        if (!file_exists($path) || !$dest) {
            Common::send(418, "Invalid path.");
        }

        if (file_exists($dest)) {
            Common::send(409, "Duplicate path.");
        }

        function rCopyDirectory($src, $dst) {
            $dir = opendir($src);
            @mkdir($dst);
            while (false !== ($file = readdir($dir))) {
                if (($file !== ".") && ($file !== "..")) {
                    if (is_dir($src . "/" . $file)) {
                        rCopyDirectory($src . "/" . $file, $dst . "/" . $file);
                    } else {
                        copy($src . "/" . $file, $dst . "/" . $file);
                    }
                }
            }
            closedir($dir);
        }

        if (is_file($path)) {
            copy($path, $dest);
            Common::send(200, i18n("duplicated_file"));
        } else {
            rCopyDirectory($path, $dest);
            Common::send(200, i18n("duplicated_folder"));
        }
    }

    //////////////////////////////////////////////////////////////////////////80
    // Extract
    //////////////////////////////////////////////////////////////////////////80
    public function extract($path, $name) {
        if (!file_exists($path)) {
            Common::send(418, "Invalid path.");
        }

        $info = pathinfo($path);

        $parent = $info["dirname"];
        // $base = $info["basename"];
        $ext = $info["extension"];

        $des = $parent."/".$name;

        //////////////////////////////////////////////////////////////////////////80

        if ($ext === "zip") {

            if (!class_exists("ZipArchive")) {
                Common::send(501, i18n("extract_noZip"));
            }

            $zip = new ZipArchive;
            $res = $zip->open($path);

            if (!$res) {
                Common::send(500, i18n("extract_noOpen"));
            }

            // extract archive
            if ($zip->extractTo($des)) {
                $zip->close();
                Common::send(200, i18n("extract_success"));
            } else {
                Common::send(506, i18n("extract_unable"));
            }


        } elseif ($ext === "tar") {

            if (!class_exists("PharData")) {
                Common::send(501, i18n("extract_noPhar"));
            }
            $tar = new PharData($path);

            if ($tar->extractTo($des)) {
                Common::send(200, i18n("extract_success"));
            } else {
                Common::send(500, i18n("extract_unable"));
            }

        } elseif ($ext === "gz") {

            if (!class_exists("PharData")) {
                Common::send(501, i18n("extract_noPhar"));
            }
            $gz = new PharData($path);

            if ($gzOpen = $gz->decompress()) {

                $tar = new PharData($gzOpen);

                if ($tar->extractTo($des)) {
                    Common::send(200, i18n("extract_success"));
                } else {
                    Common::send(506, i18n("extract_unable"));
                }
            } else {
                Common::send(500, i18n("extract_noDecomp"));
            }
        } elseif ($ext === "rar") {

            if (!class_exists("rar_open")) {
                Common::send(501, i18n("extract_noRar"));
            }
            $rar = new rar_open;
            $res = $rar->open($path);

            if (!$res) {
                Common::send(500, i18n("extract_noOpen"));
            }

            $entries = rar_list($res);
            try {
                foreach ($entries as $entry) {
                    $entry->extract($des);
                }
            } catch (Exception $e) {
                Common::send(500, i18n("extract_unable"));
            }

            Common::send(200, i18n("extract_success"));
            $rar->close();
        } else {

            Common::send(501, i18n("extract_unrecognized"));
        }
    }


    //////////////////////////////////////////////////////////////////////////80
    // Index (Returns list of files and directories)
    //////////////////////////////////////////////////////////////////////////80
    public function index($path) {
        $path = Common::cleanPath($path);

        $relativePath = $path !== "/" ? "$path/" : $path;
        $path = Common::isAbsPath($path) ? $path : WORKSPACE . "/" . $path;

        if (!file_exists($path)) {
            Common::send(418, "Invalid path.");
        }

        if (!is_dir($path) || !($handle = opendir($path))) {
            Common::send(500, "Unreadable path.");
        }

        $index = array();


        while (false !== ($object = readdir($handle))) {
            if ($object === "." || $object === "..") {
                continue;
            }

            if (is_dir($path."/".$object)) {
                $type = "folder";
                $size = count(glob($path."/".$object."/*"));
            } else {
                $type = "file";
                $size = @filesize($path."/".$object);
            }


            $index[] = array(
                // "path" => strip_tags($relativePath . $object),
                "path" => htmlspecialchars($relativePath . $object),
                "type" => $type,
                "size" => $size
            );
        }

        $folders = array();
        $files = array();
        foreach ($index as $item => $data) {
            $nodePath = $data["path"];
            $link = is_link($nodePath) ? readlink($nodePath) : false;

            if ($data["type"] === "folder") {

                $repo = file_exists($nodePath . "/.git");

                $folders[] = array(
                    "path" => $nodePath,
                    "link" => $link,
                    "type" => $data["type"],
                    "size" => $data["size"],
                    "repo" => $repo
                );
            }
            if ($data["type"] === "file") {
                $files[] = array(
                    "path" => $nodePath,
                    "link" => $link,
                    "type" => $data["type"],
                    "size" => $data["size"]
                );
            }
        }

        function sorter($a, $b, $key = "path") {
            return strnatcasecmp($a[$key], $b[$key]);
            // return strnatcmp($a[$key], $b[$key]);
        }

        usort($folders, "sorter");
        usort($files, "sorter");

        $output = array_merge($folders, $files);

        Common::send(200, array("index" => $output));
    }

    //////////////////////////////////////////////////////////////////////////80
    // Move
    //////////////////////////////////////////////////////////////////////////80
    public function move($path, $dest) {
        if (file_exists($dest)) Common::send(409, "Target already exists.");

        if (rename($path, $dest)) {
            Common::send(200, "Target moved.");
        } else {
            Common::send(506, "Failed to move target.");
        }
    }



    //////////////////////////////////////////////////////////////////////////80
    // loadURL for preview / open in browser
    //////////////////////////////////////////////////////////////////////////80
    public function loadURL($path) {
        if (Common::isAbsPath($path) && strpos($path, WORKSPACE) === false) {
            Common::send(451, i18n("outsideWorkspace"));
        }

        if (SERVER("HTTPS") !== "off") {
            $prot = "https://";
        } else {
            $prot = "http://";
        }
        $domain = SERVER("HTTP_HOST");
        $page = pathinfo(SERVER("REQUEST_URI"), PATHINFO_DIRNAME);
        $url = rtrim($prot . $domain . $page . "/workspace/" . Common::getRelativePath($path), "/");
        $url = str_replace("//workspace", "/workspace", $url);
        Common::send(200, $url);
    }

    //////////////////////////////////////////////////////////////////////////80
    // Rename
    //////////////////////////////////////////////////////////////////////////80
    public function rename($path, $name) {
        $parent = dirname($path);

        $newPath = $parent . "/" . $name;
        // $newPath = strip_tags($newPath);
        $newPath = htmlspecialchars($newPath);

        if (file_exists($newPath)) {
            Common::send(200, i18n("path_exists"));
        } elseif (rename($path, $newPath)) {
            Common::send(200);
        } else {
            Common::send(200, i18n("path_unableRename"));
        }
    }
}