<?php

/*
*  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
*  as-is and without warranty under the MIT License. See
*  [root]/license.txt for more. This information must remain intact.
*/

require_once('../../common.php');

class Scout {

	//////////////////////////////////////////////////////////////////
	// PROPERTIES
	//////////////////////////////////////////////////////////////////

	//////////////////////////////////////////////////////////////////
	// METHODS
	//////////////////////////////////////////////////////////////////

	// -----------------------------||----------------------------- //


	//////////////////////////////////////////////////////////////////
	// Probe: Deep file content search
	//////////////////////////////////////////////////////////////////
	public function probe() {
		if (!function_exists('shell_exec')) {
			Common::sendJSON("error", "Shell_exec() Command Not Enabled.");
		} else {

			$type = Common::data("type");
			$path = Common::data("path");
			// $path = $this->cleanPath($path);
			$query = Common::data("query");
			$filter = Common::data("filter");


			if ($type === 1) {
				$path = WORKSPACE;
			} else {
				$path = Common::getWorkspacePath($path);
			}


			$root = WORKSPACE;

			$results = array();
			// $query =

			$query = str_replace('"', '', $query);

			$searchPath = escapeshellarg($path);
			$query = escapeshellarg($query);
			$filter = escapeshellarg(".*$filter");


			$cmd = "find -L $searchPath -iregex $filter -type f | xargs grep -i -I -n -R -H $query";

			$output = shell_exec($cmd);
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
				Common::sendJSON("success", $results);
			} else {
				Common::sendJSON("error", "No Results Found");
			}
		}
	}

	public function filter() {
		if (!function_exists('shell_exec')) {
			Common::sendJSON("error", "Shell_exec() Command Not Enabled.");
		} else {
			$path = Common::data("path");
			// $path = $this->cleanPath($path);
			$path = Common::getWorkspacePath($path);
			$strategy = Common::data("strategy");
			$filter = Common::data("filter");



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
			$output = shell_exec($cmd);
			// $output = array();
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
				Common::sendJSON("success", $results);
			} else {
				Common::sendJSON("error", "No Results Found");
			}
		}
	}

	//////////////////////////////////////////////////////////////////
	// Clean a path
	//////////////////////////////////////////////////////////////////

	public static function cleanPath($path) {

		// replace backslash with slash
		$path = str_replace('\\', '/', $path);

		// allow only valid chars in paths$
		$path = preg_replace('/[^A-Za-z0-9\-\._\/]/', '', $path);
		// maybe this is not needed anymore
		// prevent Poison Null Byte injections
		$path = str_replace(chr(0), '', $path);

		// prevent go out of the workspace
		while (strpos($path, '../') !== false) {
			$path = str_replace('../', '', $path);
		}

		return $path;
	}
}