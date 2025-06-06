<?php

//////////////////////////////////////////////////////////////////////////////80
// Path trait
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

trait Path {

    //////////////////////////////////////////////////////////////////////////80
    // Check if Path is absolute
    //////////////////////////////////////////////////////////////////////////80
    public static function isAbsPath($path) {
        if (!$path) return $path;
        return ($path[0] === "/" || $path[1] === ":");
    }

    //////////////////////////////////////////////////////////////////////////80
    // Clean a path
    //////////////////////////////////////////////////////////////////////////80
    public static function cleanPath($path) {
        if (empty($path)) return "";

        // replace backslash with slash
        $path = str_replace("\\", "/", $path);

        // prevent Poison Null Byte injections
        $path = str_replace(chr(0), "", $path);

        // Prevent path traversal, normalize the path to remove .. and extra slashes
        while (strpos($path, "../") !== false) {
            $path = str_replace("../", "", $path);
        }

        // allow only valid chars in paths$
        // $path = preg_replace("/[^A-Za-z0-9 :\-\._\+\/]/", "", $path);
        // $path = preg_replace('/[^\p{L}\p{N} _\.\-\/:]/u', '', $path);
        // $path = preg_replace('/[^\p{L}\p{N} _\.\-\/:\(\)]/u', '', $path);
        $path = preg_replace('/[^\p{L}\p{N} _\.\-\/:\(\)\[\]\{\}~!@#$%&\'\+=]/u', '', $path);

        // Normalize the path using realpath to resolve ".." and extra slashes
        $normalizedPath = realpath($path);
        // if (!$normalizedPath) return "";

        return $path;
    }

    //////////////////////////////////////////////////////////////////////////80
    // Return full workspace path
    //////////////////////////////////////////////////////////////////////////80
    public static function getWorkspacePath($path, $skipAccessCheck=false) {
        $path = Common::cleanPath($path);

        if (!$path) {
            return false;
        }

        // $path = str_replace(WORKSPACE . "/", "", $path);

        //Security check; $skipAccessCheck used during project creation
        if (!$skipAccessCheck && !Common::checkPath($path)) {
            Common::send(403, "Client does not have access.");
        }

        if (Common::isAbsPath($path)) {
            return $path;
        } else {
            return WORKSPACE . "/" . $path;
        }
    }

    //////////////////////////////////////////////////////////////////////////80
    // Return the path relative to root installation, used during previews
    //////////////////////////////////////////////////////////////////////////80
    public static function getRelativePath($path) {
        // $path = Common::isAbsPath($path) ? $path : WORKSPACE . "/" . $path;
        $path = str_replace(WORKSPACE . "/", "", $path);
        return $path;
    }
}