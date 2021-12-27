<?php

//////////////////////////////////////////////////////////////////////////////80
// Transfer Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class Transfer {

	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// ----------------------------------||---------------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Download
	//////////////////////////////////////////////////////////////////////////80
	public function download($path = false, $type = false) {
		if (!$path || !file_exists($path)) {
			Common::send("error", "Invalid path.");
		}
		if (preg_match("#^[\\\/]?$#i", trim($path)) || preg_match("#[\:*?\"<>\|]#i", $path) || substr_count($path, "./") > 0) {
			//  Attempting to download all Projects	  or illegal characters in filepaths
			Common::send("error", "Invalid path.");
		}

		if (!$type) {
			Common::send("error", "Missing type.");
		} elseif (($type === "directory" && !is_dir($path)) || ($type === "file" && !is_file($path))) {
			Common::send("error", "Invalid type.");
		}

		$pathInfo = pathinfo($path);

		$filename = $pathInfo["basename"];

		if ($type === "folder" || $type === "root") {
			$filename .= "-" . date("Y.m.d");
			$targetPath = WORKSPACE . "/";

			//////////////////////////////////////////////////////////////////80
			// Check system() command and a non windows OS
			//////////////////////////////////////////////////////////////////80
			if (false && Common::isAvailable("system") && stripos(PHP_OS, "win") === false) {
				# Execute the tar command and save file
				$filename .= ".tar.gz";
				$downloadFile = $targetPath.$filename;
				$cmd = "tar -pczf ". escapeshellarg($downloadFile) . " -C " . escapeshellarg($pathInfo["dirname"]) . " " . escapeshellarg($pathInfo["basename"]);
				Common::execute($cmd);
			} elseif (extension_loaded("zip")) {
				//Check if zip-Extension is availiable

				$filename .= ".zip";
				$downloadFile = $targetPath . $filename;
				Common::zip($path, $downloadFile);
			} else {
				Common::send("error", "Could not zip folder, zip-extension missing");

			}
		} elseif ($type === "file") {
			$downloadFile = WORKSPACE . "/" . $filename;
			copy($path, WORKSPACE . "/" . $filename);
		}
		Common::send("success", array("download" => $downloadFile));
	}

	//////////////////////////////////////////////////////////////////////////80
	// Upload
	//////////////////////////////////////////////////////////////////////////80
	public function upload($path = false) {

		// Check that the path exists and is a directory
		if (!file_exists($path) || is_file($path)) {
			Common::send("error", "Invalid path.");
		}
		// Handle upload
		$info = array();
// 		while (list($key, $value) = each($_FILES["upload"]["name"])) {
		foreach ($_FILES["upload"]["name"] as $key => $value) {
			if (!empty($value)) {
				$filename = $value;
				$add = $path."/$filename";
				if (@move_uploaded_file($_FILES["upload"]["tmp_name"][$key], $add)) {
					$info[] = array(
						"name" => $value,
						"size" => filesize($add),
						"url" => $add,
						"thumbnail_url" => $add,
						"delete_url" => $add,
						"delete_type" => "DELETE"
					);
				}
			}
		}
		Common::send("success", array("data" => $info));
	}
}