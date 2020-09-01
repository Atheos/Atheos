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
	// Read json
	// Reads JSON data from the data folder using namespaces.
	//////////////////////////////////////////////////////////////////////////80
	public static function readJSON($file, $namespace = "") {
		$json = false;

		$path = DATA . "/" . $namespace . "/";
		$path = preg_replace('#/+#', '/', $path);

		$file = pathinfo($file, PATHINFO_FILENAME);

		if (is_readable($path . $file . '.json')) {
			$json = file_get_contents($path . $file . '.json');
		} elseif (is_readable($path . $file . '.php')) {
			$json = file_get_contents($path . $file . '.php');
			$json = str_replace(["\n\r", "\r", "\n"], "", $json);
			$json = str_replace("|*/?>", "", str_replace("<?php/*|", "", $json));
			saveJSON($file . ".json", json_decode($json, true), $namespace);
		}

		if (is_file($path . $file . ".json") && is_file($path . $file . ".php")) {
			unlink($path . $file . ".php");
		}

		if ($json) {
			$json = json_decode($json, true);
		}
		return $json;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Save JSON
	//////////////////////////////////////////////////////////////////////////80
	public static function saveJSON($file, $data, $namespace = "") {
		$path = DATA . "/" . $namespace . "/";
		$path = preg_replace('#/+#', '/', $path);

		if (!is_dir($path)) mkdir($path);

		$file = pathinfo($file, PATHINFO_FILENAME) . ".json";

		$data = json_encode($data, JSON_PRETTY_PRINT);

		$write = fopen($path . $file, 'w') or die("can't open file: " . $path . $file);
		fwrite($write, $data);
		fclose($write);
	}

}