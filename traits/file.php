<?php

//////////////////////////////////////////////////////////////////////////////80
// File trait
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

trait File {

    //////////////////////////////////////////////////////////////////////////80
    // Reads file from DATA
    //////////////////////////////////////////////////////////////////////////80
    public static function load($name, $namespace) {
        $path = DATA . "/" . $namespace . "/" . $name;
        $path = preg_replace("#\/+#", "/", $path);

        // First try the legacy format.
        if (is_readable($path)) {
            $content = file_get_contents($path);

            // Save the content into the new wrapped format and unlink.
            if (Common::save($name, $content, $namespace)) {
                unlink($path);
            }
            return $content;
        }

        // Next try the new PHP-wrapped format.
        $wrapped = $path . ".php";
        if (is_readable($wrapped)) {
            $content = file_get_contents($wrapped);
            $clean = str_replace(["<?php/*|\n", "\n|*/?>"], "", $content);

            return $clean;
        }

        return false;
    }

    //////////////////////////////////////////////////////////////////////////80
    // Saves data to DATA
    //////////////////////////////////////////////////////////////////////80
    public static function save($name, $content, $namespace = "") {
        $path = DATA . "/" . $namespace . "/";
        $path = preg_replace("#\/+#", "/", $path);

        if (!is_dir($path)) mkdir($path);

        $write = fopen($path . $name . ".php", "w") or false;
        if ($write) {
            $wrapped = "<?php/*|\n" . $content . "\n|*/?>";
            fwrite($write, $wrapped);
            fclose($write);
            return true;
        } else {
            return false;
        }
    }

    //////////////////////////////////////////////////////////////////////////80
    // Save JSON data with pretty print
    //////////////////////////////////////////////////////////////////////////80
    public static function saveJSON($name, $data, $namespace = "") {
        $data = json_encode($data, JSON_PRETTY_PRINT);
        $result = Common::save($name . ".json", $data, $namespace);
        return $result;
    }

    //////////////////////////////////////////////////////////////////////////80
    // Reads JSON data
    //////////////////////////////////////////////////////////////////////////80
    public static function loadJSON($name, $namespace = "") {
        $json = Common::load($name . ".json", $namespace);
        $json = json_decode($json, true);
        return $json ? $json : [];
    }

    //////////////////////////////////////////////////////////////////////////80
    // Reads Cache data using MD5 file names
    //////////////////////////////////////////////////////////////////////////80
    public static function loadCache($name, $namespace = "") {
        $name = md5($name);
        $content = Common::load($name, $namespace);
        return $content;
    }

    //////////////////////////////////////////////////////////////////////////80
    // Save Cache data with MD5 file names
    //////////////////////////////////////////////////////////////////////////80
    public static function saveCache($name, $data, $namespace = "") {
        $name = md5($name);
        $result = Common::save($name, $data, $namespace);
        return $result ? $name : false;
    }

    //////////////////////////////////////////////////////////////////////////80
    // Delete file within data
    //////////////////////////////////////////////////////////////////////////80
    public static function delete($name, $namespace) {
        $path = DATA . "/" . $namespace . "/" . $name;
        $path = preg_replace("#\/+#", "/", $path);
        if (is_file($path)) {
            unlink($path);
            return true;
        } else {
            return false;
        }
    }

    //////////////////////////////////////////////////////////////////////////80
    // Delete Cache data with MD5 file names
    //////////////////////////////////////////////////////////////////////////80
    public static function deleteCache($name, $namespace = "") {
        $name = md5($name);
        $result = Common::delete($name, $namespace);
        return $result;
    }

}
