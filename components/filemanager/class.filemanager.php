<?php

/*
*  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
*  as-is and without warranty under the MIT License. See
*  [root]/license.txt for more. This information must remain intact.
*/

require_once('../../lib/diff_match_patch.php');
require_once('../../common.php');

class Filemanager {

	//////////////////////////////////////////////////////////////////
	// METHODS
	//////////////////////////////////////////////////////////////////

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////
	// INDEX (Returns list of files and directories)
	//////////////////////////////////////////////////////////////////

	public function index($path) {
		$path = Common::cleanPath($path);

		$relativePath = $path !== "/" ? "$path/" : $path;
		$path = Common::isAbsPath($path) ? $path : WORKSPACE . "/" . $path;

		if (!file_exists($path)) {
			Common::sendJSON("E402m"); die;
		}

		if (!is_dir($path) || !($handle = opendir($path))) {
			Common::sendJSON("error", "Not a valid directory."); die;
		}

		$index = array();


		while (false !== ($object = readdir($handle))) {
			if ($object === "." || $object === "..") {
				continue;
			}

			if (is_dir($path.'/'.$object)) {
				$type = "directory";
				$size = count(glob($path.'/'.$object.'/*'));
			} else {
				$type = "file";
				$size = @filesize($path.'/'.$object);
			}


			$index[] = array(
				"path" => $relativePath . $object,
				"type" => $type,
				"size" => $size
			);
		}

		$relativePath = str_replace(WORKSPACE, "", $index[0]["path"]);

		$folders = array();
		$files = array();
		foreach ($index as $item => $data) {
			if ($data['type'] == 'directory') {

				$repo = file_exists($data['path'] . "/.git");

				$folders[] = array(
					"path" => $data['path'],
					"type" => $data['type'],
					"size" => $data['size'],
					"repo" => $repo
				);
			}
			if ($data['type'] == 'file') {
				$files[] = array(
					"path" => $data['path'],
					"type" => $data['type'],
					"size" => $data['size']
				);
			}
		}

		function sorter($a, $b, $key = 'path') {
			return strnatcasecmp($a[$key], $b[$key]);
			// return strnatcmp($a[$key], $b[$key]);
		}

		usort($folders, "sorter");
		usort($files, "sorter");

		$output = array_merge($folders, $files);

		Common::sendJSON("success", array("index" => $output));

	}

	//////////////////////////////////////////////////////////////////
	// OPEN (Returns the contents of a file)
	//////////////////////////////////////////////////////////////////
	public function open($path) {
		if (!$path || !is_file($path)) {
			Common::sendJSON("E402i"); die;
		}

		$output = file_get_contents($path);

		if (extension_loaded('mbstring')) {
			if (!mb_check_encoding($output, 'UTF-8')) {
				if (mb_check_encoding($output, 'ISO-8859-1')) {
					$output = utf8_encode($output);
				} else {
					$output = mb_convert_encoding($output, 'UTF-8');
				}
			}
		}

		$modifyTime = filemtime($path);
		Common::sendJSON("success", array("content" => $output, "modifyTime" => $modifyTime));

	}

	//////////////////////////////////////////////////////////////////
	// CREATE (Creates a new file or directory)
	//////////////////////////////////////////////////////////////////
	public function create($path, $type) {

		if (file_exists($path)) {
			Common::sendJSON("error", "Path already exists."); die;
		}

		if ($type === "directory" && mkdir($path)) {
			Common::sendJSON("S2000");
		} elseif ($type === "file" && $file = fopen($path, 'w')) {
			$modifyTime = filemtime($path);
			fclose($file);
			Common::sendJSON("success", array("modifyTime" => $modifyTime));

			Common::sendJSON("S2000");
		} else {
			Common::sendJSON("error", "Cannot create path.");
		}
	}

	//////////////////////////////////////////////////////////////////
	// DELETE (Deletes a file or directory (+contents))
	//////////////////////////////////////////////////////////////////
	public function delete($path) {

		if (!file_exists($path)) {
			Common::sendJSON("E402i");
			die;
		}

		function rDelete($target) {
			// Unnecessary, but rather be safe that sorry.
			if ($target === "." || $target === "..") {
				return;
			}
			if (is_dir($target)) {
				$files = glob($target . "{*,.[!.]*,..?*}", GLOB_BRACE|GLOB_MARK); //GLOB_MARK adds a slash to directories returned

				foreach ($files as $file) {
					rDelete($file);
				}
				if (file_exists($target)) {
					rmdir($target);
				}
			} elseif (is_file($target)) {
				unlink($target);
			}
		}

		rDelete($path);

		Common::sendJSON("S2000");

	}

	public function rename($path, $name) {
		$parent = dirname($path);
		$newPath = $parent . "/" . $name;
		if (file_exists($newPath)) {
			Common::sendJSON("error", "Path already exists.");
		} elseif (rename($path, $newPath)) {
			Common::sendJSON("S2000");
		} else {
			Common::sendJSON("error", "Unable to rename path.");
		}
	}

	//////////////////////////////////////////////////////////////////
	// Save (Modifies a file name/contents or directory name)
	//////////////////////////////////////////////////////////////////
	public function save($path, $modifyTime, $patch, $content) {
		// Change content
		if (!$content && !$patch) {
			// Common::sendJSON("E403m", "Content");
			$file = fopen($path, 'w');
			fclose($file);
			Common::sendJSON("success", array("modifyTime" => filemtime($path))); die;
		}

		if ($content === ' ') {
			$content = ''; // Blank out file
		}
		if ($patch && ! $modifyTime) {
			Common::sendJSON("E403m", "ModifyTime");
		}
		if (!is_file($path)) {
			Common::sendJSON("E402i"); die;
		}

		$serverModifyTime = filemtime($path);
		$fileContents = file_get_contents($path);

		if ($patch && $serverModifyTime !== (int)$modifyTime) {
			Common::sendJSON("warning", "Client is out of sync."); die;
		} elseif (strlen(trim($patch)) === 0 && !$content) {
			// Do nothing if the patch is empty and there is no content
			Common::sendJSON("success", array("modifyTime" => $serverModifyTime)); die;
		}

		if ($file = fopen($path, 'w')) {
			if ($patch) {
				$dmp = new diff_match_patch();
				$patch = $dmp->patch_apply($dmp->patch_fromText($patch), $fileContents);
				$content = $patch[0];
				//DEBUG : file_put_contents($this->path.".orig",$fileContents );
				//DEBUG : file_put_contents($this->path.".patch", $this->patch);
			}

			if (fwrite($file, $content)) {
				// Unless stat cache is cleared the pre-cached modifyTime will be
				// returned instead of new modification time after editing
				// the file.
				clearstatcache();
				Common::sendJSON("success", array("modifyTime" => filemtime($path)));
			} else {
				Common::sendJSON("E430c");
			}

			fclose($file);
		} else {
			Common::sendJSON("E430c");
		}

	}

	//////////////////////////////////////////////////////////////////
	// DUPLICATE (Creates a duplicate of the object - (cut/copy/paste)
	//////////////////////////////////////////////////////////////////

	public function duplicate($path, $dest) {

		if (!file_exists($path) || !$dest) {
			Common::sendJSON("E403g");
			die;
		}

		if (file_exists($dest)) {
			Common::sendJSON("error", "Path already exists.");
			die;
		}

		function rCopyDirectory($src, $dst) {
			$dir = opendir($src);
			@mkdir($dst);
			while (false !== ($file = readdir($dir))) {
				if (($file !== '.') && ($file !== '..')) {
					if (is_dir($src . '/' . $file)) {
						rCopyDirectory($src . '/' . $file, $dst . '/' . $file);
					} else {
						copy($src . '/' . $file, $dst . '/' . $file);
					}
				}
			}
			closedir($dir);
		}

		if (is_file($path)) {
			copy($path, $dest);
			Common::sendJSON("success", "File Duplicated");
		} else {
			rCopyDirectory($path, $dest);
			Common::sendJSON("success", "Folder Duplicated");
		}
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
}