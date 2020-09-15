<?php

//////////////////////////////////////////////////////////////////////////////80
// JSON trait
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

trait JSON {

	//////////////////////////////////////////////////////////////////////////80
	// Reads JSON data from the data folder using namespaces.
	//////////////////////////////////////////////////////////////////////////80
	public static function load($file, $namespace = "") {
		$json = false;

		$path = DATA . "/" . $namespace . "/";
		$path = preg_replace("#/+#", "/", $path);

		if (is_readable($path . $file . ".json")) {
			$json = file_get_contents($path . $file . ".json");
			$json = json_decode($json, true);
		}
		return $json;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Save JSON
	//////////////////////////////////////////////////////////////////////////80
	public static function save($file, $data, $namespace = "") {
		$path = DATA . "/" . $namespace . "/";
		$path = preg_replace("#/+#", "/", $path);

		if (!is_dir($path)) mkdir($path);

		$data = json_encode($data, JSON_PRETTY_PRINT);

		$write = fopen($path . $file . ".json", "w") or die("can't open file: $file");
		fwrite($write, $data);
		fclose($write);
	}
}