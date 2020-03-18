<?php

/*
*  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
*  as-is and without warranty under the MIT License. See
*  [root]/license.txt for more. This information must remain intact.
*/

require_once('../../common.php');

class Scout extends Common
{

	//////////////////////////////////////////////////////////////////
	// PROPERTIES
	//////////////////////////////////////////////////////////////////

	public $root = "";
	public $project = "";
	public $rel_path = "";
	public $path = "";
	public $patch = "";
	public $type = "";
	public $newName = "";
	public $content = "";
	public $destination = "";
	public $upload = "";
	public $controller = "";
	public $upload_json = "";
	public $searchString = "";

	public $searchFileType = "";
	public $query = "";
	public $foptions = "";

	// JSEND Return Contents
	public $status = "";
	public $data = "";
	public $message = "";

	//////////////////////////////////////////////////////////////////
	// METHODS
	//////////////////////////////////////////////////////////////////

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////
	// Construct
	//////////////////////////////////////////////////////////////////

	public function __construct($get, $post, $files) {
		$this->rel_path = Scout::cleanPath($get['path']);

		if ($this->rel_path != "/") {
			$this->rel_path .= "/";
		}
		if (!empty($get['query'])) {
			$this->query = $get['query'];
		}
		if (!empty($get['options'])) {
			$this->foptions = $get['options'];
		}
		$this->root = $get['root'];
		if ($this->isAbsPath($get['path'])) {
			$this->path = Scout::cleanPath($get['path']);
		} else {
			$this->root .= '/';
			$this->path = $this->root . Scout::cleanPath($get['path']);
		}
		// Search
		if (!empty($post['searchString'])) {
			$this->searchString = ($post['searchString']);
		}
		if (!empty($post['searchFileType'])) {
			$this->searchFileType = ($post['searchFileType']);
		}
		// Create
		if (!empty($get['type'])) {
			$this->type = $get['type'];
		}
		// Modify\Create
		if (!empty($get['newName'])) {
			$this->newName = $get['newName'];
		}

		foreach (array('content', 'mtime', 'patch') as $key) {
			if (!empty($post[$key])) {
				if (get_magic_quotes_gpc()) {
					$this->$key = stripslashes($post[$key]);
				} else {
					$this->$key = $post[$key];
				}
			}
		}
		// Duplicate
		if (!empty($get['destination'])) {
			$get['destination'] = Scout::cleanPath($get['destination']);
			if ($this->isAbsPath($get['path'])) {
				$this->destination = $get['destination'];
			} else {
				$this->destination = $this->root . $get['destination'];
			}
		}
	}


	//////////////////////////////////////////////////////////////////
	// SEARCH
	//////////////////////////////////////////////////////////////////

	public function search() {
		if (!function_exists('shell_exec')) {
			$this->status = "error";
			$this->message = "Shell_exec() Command Not Enabled.";
		} else {
			if ($_GET['type'] == 1) {
				$this->path = WORKSPACE;
			}
			$return = array();

			$input = str_replace('"', '', $this->searchString);
			$cmd = 'find -L ' . escapeshellarg($this->path) . ' -iregex  '.escapeshellarg('.*' . $this->searchFileType).' -type f | xargs grep -i -I -n -R -H ' . escapeshellarg($input) . '';
			$output = shell_exec($cmd);
			$output_arr = explode("\n", $output);
			foreach ($output_arr as $line) {
				$data = explode(":", $line);
				$da = array();
				if (count($data) > 2) {
					$file = str_replace($this->path, '', $data[0]);

					$da['line'] = $data[1];
					$da['name'] = str_replace($this->path, '', $data[0]);
					$da['path'] = str_replace($this->root, '', $data[0]);
					$da['string'] = str_replace($data[0] . ":" . $data[1] . ':', '', $line);
					// $return[$file]['line'] = $data[1];
					$return[$file][] = $da;
				}
			}
			if (count($return) == 0) {
				$this->status = "error";
				$this->message = "No Results Returned";
			} else {
				$this->status = "success";
				$this->data = json_encode($return);
			}
		}
		$this->respond(true);
	}


	//////////////////////////////////////////////////////////////////
	// RESPOND (Outputs data in JSON [JSEND] format)
	//////////////////////////////////////////////////////////////////

	public function respond($adjusted = false) {

		// Success ///////////////////////////////////////////////
		if ($this->status == "success") {
			if ($this->data) {
				if ($adjusted == true) {
					$json = '{"status":"success","data":'.$this->data.'}';
				} else {
					$json = '{"status":"success","data":{'.$this->data.'}}';

				}
			} else {
				$json = '{"status":"success","data":null}';
			}

			// Upload JSON ///////////////////////////////////////////
		} elseif ($this->upload_json != '') {
			$json = $this->upload_json;

			// Error /////////////////////////////////////////////////
		} else {
			$json = '{"status":"error","message":"'.$this->message.'"}';
		}

		// Output ////////////////////////////////////////////////
		echo($json);
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