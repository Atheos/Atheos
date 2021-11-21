<?php

//////////////////////////////////////////////////////////////////////////////80
// Scout Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class Scout {

	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// ----------------------------------||---------------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Construct
	//////////////////////////////////////////////////////////////////////////80
	public function __construct() {
		if (!function_exists('shell_exec')) {
			Common::send("error", i18n("noShell"));
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Filter File Tree
	//////////////////////////////////////////////////////////////////////////80
	public function filter() {
		$path = POST("path");
		$path = Common::getWorkspacePath($path);
		$strategy = POST("strategy");
		$filter = POST("filter");


		chdir($path);
		$query = str_replace('"', '', $filter);
		$cmd = 'find -L ';

		switch ($strategy) {
			case 'substring':
				$cmd = "$cmd -iname ".escapeshellarg('*' . $query . '*');
				break;
			case 'regexp':
				$cmd = "$cmd -regex ".escapeshellarg($query);
				break;
			case 'left_prefix':
				default:
					$cmd = "$cmd -iname ".escapeshellarg($query . '*');
					break;
		}

		$cmd .= " -printf \"%h/%f %y\n\"";
		$output = Common::execute($cmd);
		// $output = array();

		$output = $output["text"];

		$output = explode("\n", $output);
		$results = array();

		foreach ($output as $i => $line) {
			$line = explode(" ", $line);
			$fname = trim($line[0]);
			if ($line[1] == 'f') {
				$ftype = 'file';
			} else {
				$ftype = 'directory';
			}
			if (strlen($fname) != 0) {
				$fname = substr($fname, 2);
				$f = array('path' => $fname, 'type' => $ftype);
				array_push($results, $f);
			}
		}

		if (count($results) > 0) {
			Common::send("success", $results);
		} else {
			Common::send("error", "No results found.");
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Probe: Deep file content search
	//////////////////////////////////////////////////////////////////////////80
	public function probe() {
		$type = POST("type");
		$path = POST("path");
		$path = Common::cleanPath($path);
		$query = POST("query");
		$filter = POST("filter");

		$path = $type ? WORKSPACE : Common::getWorkspacePath($path);
		$root = WORKSPACE;

		$results = array();
		// $query =

		$query = str_replace('"', '', $query);

		$searchPath = escapeshellarg($path);
		$query = escapeshellarg($query);
		$filter = escapeshellarg(".*$filter");


		$cmd = "find -L $searchPath -iregex $filter -type f | xargs grep -i -I -n -R -H $query";

		$output = Common::execute($cmd);
		$output = $output["text"];

		$output = explode("\n", $output);

		foreach ($output as $line) {
			$data = explode(":", $line);
			$result = array();
			if (count($data) > 2) {
				$file = str_replace($path, '', $data[0]);

				$result['line'] = $data[1];
				$result['path'] = str_replace("$root/", '', $data[0]);
				$result['string'] = htmlentities(str_replace($data[0] . ":" . $data[1] . ':', '', $line));
				if (strlen($result["string"]) > 500) {
					$result["string"] = substr($result["string"], 0, 497) . '...';
				}
				$results[$file][] = $result;
			}
		}
		if (count($results) > 0) {
			Common::send("success", $results);
		} else {
			Common::send("error", "No results found.");
		}

	}
}