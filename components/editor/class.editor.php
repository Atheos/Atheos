<?php

//////////////////////////////////////////////////////////////////////////////80
// Session Manager Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once("vendor/differential/diff_match_patch.php");

class Editor {

    //////////////////////////////////////////////////////////////////////////80
    // PROPERTIES
    //////////////////////////////////////////////////////////////////////////80
    private $activeUser = null;
    private $db = null;

    //////////////////////////////////////////////////////////////////////////80
    // METHODS
    //////////////////////////////////////////////////////////////////////////80

    // -----------------------------||----------------------------- //

    //////////////////////////////////////////////////////////////////////////80
    // Construct
    //////////////////////////////////////////////////////////////////////////80
    public function __construct() {
        $activeUser = SESSION("user");
        $this->activeUser = $activeUser;
        $this->db = Common::getObjStore("activeFiles", "users/" . $activeUser);
    }

    //////////////////////////////////////////////////////////////////////////80
    // List User's Active Files
    //////////////////////////////////////////////////////////////////////////80
    public function listActiveFiles() {
        $result = $this->db->select("*");

        $temp = array();
        foreach ($result as $file) {
            $path = $file["path"];

            // Ensure path is correct when in workspace
            if (file_exists(Common::getWorkspacePath($path))) {
                $temp[] = $file;
            } else {

                // Invalid file path
                $where = array(["path", "==", $path]);
                $this->db->delete($where);
            }
        }

        Common::send(200, $temp);
    }

    //////////////////////////////////////////////////////////////////////////80
    // Open (Returns the contents of a file)
    //////////////////////////////////////////////////////////////////////////80
    public function openFile($path, $inFocus) {
        if (!$path || !is_file($path)) {
            Common::send(418, "Invalid path.");
        }

        $content = file_get_contents($path);

        if (extension_loaded("mbstring")) {
            if (!mb_check_encoding($content, "UTF-8")) {
                if (mb_check_encoding($content, "ISO-8859-1")) {
                    $content = utf8_encode($content);
                } else {
                    $content = mb_convert_encoding($content, "UTF-8");
                }
            }
        }

        $modifyTime = filemtime($path);
        $loadHash = hash("sha256", $content);
        if ($inFocus === "true") {
            $this->setStatus($path, "inFocus");
        }
        Common::send(200, array("content" => $content, "modifyTime" => $modifyTime, "loadHash" => $loadHash));
    }

    //////////////////////////////////////////////////////////////////////////80
    // Mark File As Focused
    //  All other files will be marked as non-focused.
    //////////////////////////////////////////////////////////////////////////80
    public function setFocus($path) {
        $this->setStatus($path, "inFocus");
        Common::send(200);
    }

    //////////////////////////////////////////////////////////////////////////80
    // Mark File As Focused
    //  All other files will be marked as non-focused.
    //////////////////////////////////////////////////////////////////////////80
    public function setStatus($path, $status) {
        // Set all files open by user as "active"
        $where = array(["path", "==", "*"]);
        $value = array("status" => "active");
        $this->db->update($where, $value);

        // Insert/update the passed path as either active or inFocus
        $where = array(["path", "==", $path]);
        $value = array(
            "path" => $path,
            "updated" => time(),
            "status" => $status
        );
        $this->db->update($where, $value, true);

        return true;
    }

    //////////////////////////////////////////////////////////////////////////80
    // Encode high unicode characters
    //////////////////////////////////////////////////////////////////////////80
    public function encodeHighUnicode($str) {
        $pattern = '/[\x{10000}-\x{10FFFF}]/u';
        $callback = function($match) {
            $codepoint = mb_ord($match[0]);
            $hex = dechex($codepoint);
            $paddedHex = str_pad(strtolower($hex), 6, '0', STR_PAD_LEFT);

            $prefix = "\xee\x80\x80";
            $suffix = "\xee\x80\x81";

            return $prefix . $paddedHex . $suffix;
        };

        return preg_replace_callback($pattern, $callback, $str);
    }



    //////////////////////////////////////////////////////////////////////////80
    // Decode high unicode characters
    //////////////////////////////////////////////////////////////////////////80
    public function decodeHighUnicode($str) {
        $pattern = '/\xee\x80\x80([0-9a-f]{6})\xee\x80\x81/';
        $callback = function($match) {
            $codepoint = hexdec($match[1]);
            return mb_chr($codepoint);
        };

        return preg_replace_callback($pattern, $callback, $str);
    }


    //////////////////////////////////////////////////////////////////////////80
    // Save (Modifies a file name/contents or directory name)
    //////////////////////////////////////////////////////////////////////////80
    public function saveFile($path, $saveType, $newContent, $clientModifyTime, $loadHash) {
        if (!is_file($path)) {
            Common::send(418, "Invalid path.");
        }

        try {
            $oldContent = file_get_contents($path);
            $serverModifyTime = filemtime($path);

            if ($saveType === "patch") {
                if (!$clientModifyTime) {
                    Common::send(419, "Missing modification time.");
                } elseif ($serverModifyTime !== (int)$clientModifyTime) {
                    if ($loadHash and $loadHash !== hash("sha256", $oldContent)) {
                        // Hash matches, safe to continue to save
                    } else {
                        Common::send(159, "out of sync");
                    }
                }
            }

            if (strlen(trim($newContent)) === 0) {
                // Do nothing if there is no content
                Common::send(200, array("modifyTime" => $serverModifyTime));
            }

            // Common::send(202, array("modifyTime" => filemtime($path)));
            $fileWriter = fopen($path, "w");
            if (!$fileWriter) {
                Common::send(506, "Client does not have access.");
            }

            if ($saveType === "clear") {
                $newContent = "";
            }

            if ($saveType === "patch") {
                $dmp = new diff_match_patch();

                // Encode/decode high unicode chars to fix PHP/JS encoding differences.
                $oldEncodedContent = $this->encodeHighUnicode($oldContent);
                $patches = $dmp->patch_fromText($newContent);
                $encodedPatch = $dmp->patch_apply($patches, $oldEncodedContent);
                $newContent = $this->decodeHighUnicode($encodedPatch[0]);
            }

            if (fwrite($fileWriter, $newContent)) {
                // Unless stat cache is cleared the pre-cached modifyTime will be
                // returned instead of new modification time after editing
                // the file.
                clearstatcache();
                Common::send(200, array("modifyTime" => filemtime($path), "loadHash" => hash("sha256", $newContent)));
            } else {
                Common::send(506, "Server encountered an error during write.");
            }

            fclose($fileWriter);

        }catch(Exception $e) {
            Common::send(506, "Server encountered an unknown error.");
        }
    }


    //////////////////////////////////////////////////////////////////////////80
    // Rename File
    //////////////////////////////////////////////////////////////////////////80
    public function rename($oldPath, $newPath) {
        $where = array(["path", "==", $oldPath]);
        $value = array("path" => $newPath);
        $this->db->update($where, $value);
        Common::send(200);
    }

    //////////////////////////////////////////////////////////////////////////80
    // Remove File
    //////////////////////////////////////////////////////////////////////////80
    public function remove($path) {
        $where = array(["path", "==", $path]);
        $this->db->delete($where);
        Common::send(200);
    }

    //////////////////////////////////////////////////////////////////////////80
    // Remove All Files
    //////////////////////////////////////////////////////////////////////////80
    public function removeAll() {
        $this->db->delete("*");
        Common::send(200);
    }
}