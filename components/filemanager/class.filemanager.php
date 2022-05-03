<?php

//////////////////////////////////////////////////////////////////////////////80
// FileManager Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once("vendor/differential/diff_match_patch.php");

class Filemanager {

	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Create (Creates a new file or directory)
	//////////////////////////////////////////////////////////////////////////80
	public function create($path, $type) {

		if (file_exists($path)) {
			Common::send("error", i18n("path_exists"));
		}

		// $path = strip_tags($path);
		$path = htmlspecialchars($path);

		if ($type === "folder" && @mkdir($path)) {
			Common::send("success");
		} elseif ($type === "file" && $file = fopen($path, "w")) {
			$modifyTime = filemtime($path);
			fclose($file);
			Common::send("success", array("modifyTime" => $modifyTime));
		} else {
			$error = error_get_last();
			debug($error);
			Common::send("error", i18n("path_unableCreate"));
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Delete (Deletes a file or directory (+contents))
	//////////////////////////////////////////////////////////////////////////80
	public function delete($path) {
		if (!file_exists($path)) {
			Common::send("error", "Invalid path.");
		}

		if (is_dir($path)) {
			$path = preg_replace("/[\/]+/", "/", "$path/");
		}

		Common::rDelete($path);
		Common::send("success");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Duplicate (Creates a duplicate of the object - (cut/copy/paste)
	//////////////////////////////////////////////////////////////////////////80
	public function duplicate($path, $dest) {
		if (!file_exists($path) || !$dest) {
			Common::send("error", "Invalid path.");
		}

		if (file_exists($dest)) {
			Common::send("error", "Duplicate path.");
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
			Common::send("success", i18n("duplicated_file"));
		} else {
			rCopyDirectory($path, $dest);
			Common::send("success", i18n("duplicated_folder"));
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Extract
	//////////////////////////////////////////////////////////////////////////80
	public function extract($path, $name) {
		if (!file_exists($path)) {
			Common::send("error", "Invalid path.");
		}

		$info = pathinfo($path);

		$parent = $info["dirname"];
		$base = $info["basename"];
		$ext = $info["extension"];

		debug($parent);
		debug($base);
		debug($ext);

		$des = $parent."/".$name;

		//////////////////////////////////////////////////////////////////////////80

		if ($ext === "zip") {

			if (!class_exists("ZipArchive")) {
				Common::send("error", i18n("extract_noZip"));
			}

			$zip = new ZipArchive;
			$res = $zip->open($path);

			if (!$res) {
				Common::send("error", i18n("extract_noOpen"));
			}

			// extract archive
			if ($zip->extractTo($des)) {
				$zip->close();
				Common::send("success", i18n("extract_success"));
			} else {
				Common::send("error", i18n("extract_unable"));
			}


		} elseif ($ext === "tar") {

			if (!class_exists("PharData")) {
				Common::send("error", i18n("extract_noPhar"));
			}
			$tar = new PharData($path);

			if ($tar->extractTo($des)) {
				Common::send("success", i18n("extract_success"));
			} else {
				Common::send("error", i18n("extract_unable"));
			}

		} elseif ($ext === "gz") {

			if (!class_exists("PharData")) {
				Common::send("error", i18n("extract_noPhar"));
			}
			$gz = new PharData($path);

			if ($gzOpen = $gz->decompress()) {

				$tar = new PharData($gzOpen);

				if ($tar->extractTo($des)) {
					Common::send("success", i18n("extract_success"));
				} else {
					Common::send("error", i18n("extract_unable"));
				}
			} else {
				Common::send("error", i18n("extract_noDecomp"));
			}
		} elseif ($ext === "rar") {

			if (!class_exists("rar_open")) {
				Common::send("error", i18n("extract_noRar"));
			}
			$rar = new rar_open;
			$res = $rar->open($path);

			if (!$res) {
				Common::send("error", i18n("extract_noOpen"));
			}

			$entries = rar_list($res);
			try {
				foreach ($entries as $entry) {
					$entry->extract($des);
				}
			} catch (Exception $e) {
				Common::send("error", i18n("extract_unable"));
			}

			Common::send("success", i18n("extract_success"));
			$rar->close();
		} else {

			Common::send("error", i18n("extract_unrecognized"));
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
			Common::send("error", "Invalid path.");
		}

		if (!is_dir($path) || !($handle = opendir($path))) {
			Common::send("error", "Unreadable path.");
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
			$link = false;
			if(is_link($data["path"])) {
				$link = readlink($data["path"]);
			}
			
			if ($data["type"] === "folder") {

				$repo = file_exists($data["path"] . "/.git");

				$folders[] = array(
					"path" => $data["path"],
					"link" => $link,
					"type" => $data["type"],
					"size" => $data["size"],
					"repo" => $repo
				);
			}
			if ($data["type"] === "file") {
				$files[] = array(
					"path" => $data["path"],
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

		Common::send("success", array("index" => $output));
	}

	//////////////////////////////////////////////////////////////////////////80
	// Move
	//////////////////////////////////////////////////////////////////////////80
	public function move($path, $dest) {
		if (file_exists($dest)) Common::send("error", "Target already exists.");

		if (rename($path, $dest)) {
			Common::send("success", "Target moved.");
		} else {
			Common::send("error", "Failed to move target.");
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Open (Returns the contents of a file)
	//////////////////////////////////////////////////////////////////////////80
	public function open($path) {
		if (!$path || !is_file($path)) {
			Common::send("error", "Invalid path.");
		}

		$output = file_get_contents($path);

		if (extension_loaded("mbstring")) {
			if (!mb_check_encoding($output, "UTF-8")) {
				if (mb_check_encoding($output, "ISO-8859-1")) {
					$output = utf8_encode($output);
				} else {
					$output = mb_convert_encoding($output, "UTF-8");
				}
			}
		}

		$modifyTime = filemtime($path);
		Common::send("success", array("content" => $output, "modifyTime" => $modifyTime));
	}

	//////////////////////////////////////////////////////////////////////////80
	// loadURL for preview / open in browser
	//////////////////////////////////////////////////////////////////////////80
	public function loadURL($path) {
		if (Common::isAbsPath($path) && strpos($path, WORKSPACE) === false) {
			Common::send("error", i18n("outsideWorkspace"));
		}

		if (SERVER("HTTPS") !== "off") {
			$prot = "https://";
		} else {
			$prot = "http://";
		}
		$domain = SERVER("HTTP_HOST");
		$url = rtrim($prot . $domain . "/workspace/" . Common::getWorkspacePath($path), "/");

		Common::send("success", $url);
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
			Common::send("success", i18n("path_exists"));
		} elseif (rename($path, $newPath)) {
			Common::send("success");
		} else {
			Common::send("success", i18n("path_unableRename"));
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Save (Modifies a file name/contents or directory name)
	//////////////////////////////////////////////////////////////////////////80
	public function save($path, $modifyTime, $patch, $content) {
		// Change content
		if (!$content && !$patch) {
			$file = fopen($path, "w");
			fclose($file);
			Common::send("success", array("modifyTime" => filemtime($path)));
		}

		if ($content === " ") {
			$content = ""; // Blank out file
		}
		if ($patch && ! $modifyTime) {
			Common::send("error", "ModifyTime");
		}
		if (!is_file($path)) {
			Common::send("error", "Invalid path.");
		}

		$serverModifyTime = filemtime($path);
		$fileContents = file_get_contents($path);

		if ($patch && $serverModifyTime !== (int)$modifyTime) {
			Common::send("warning", "out of sync");
		} elseif (strlen(trim($patch)) === 0 && !$content) {
			// Do nothing if the patch is empty and there is no content
			Common::send("success", array("modifyTime" => $serverModifyTime));
		}
		try {
			$file = fopen($path, "w");

			if ($file) {
				if ($patch) {
					$dmp = new diff_match_patch();
					$patch = $dmp->patch_apply($dmp->patch_fromText($patch), $fileContents);
					$content = $patch[0];
				}

				if (fwrite($file, $content)) {
					// Unless stat cache is cleared the pre-cached modifyTime will be
					// returned instead of new modification time after editing
					// the file.
					clearstatcache();
					Common::send("success", array("modifyTime" => filemtime($path)));
				} else {
					Common::send("error", "Client does not have access.");
				}

				fclose($file);
			} else {
				Common::send("error", "Client does not have access.");
			}
		}catch(Exception $e) {
			Common::send("error", "Client does not have access.");
		}

	}
}