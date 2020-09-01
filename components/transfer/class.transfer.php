<?php

//////////////////////////////////////////////////////////////////////////////80
// Transfer Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
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
			Common::sendJSON("E402i");
			die;
		}
		if (preg_match('#^[\\\/]?$#i', trim($path)) || preg_match('#[\:*?\"<>\|]#i', $path) || substr_count($path, './') > 0) {
		//  Attempting to download all Projects	  or illegal characters in filepaths
			Common::sendJSON("error", "Invalid Path.");
			die;
		}
		
		if (!$type) {
			Common::sendJSON("E403m", "Type");
			die;
		} elseif (($type === "directory" && !is_dir($path)) || ($type === "file" && !is_file($path))) {
			Common::sendJSON("E403i", "Type");
			die;
		}

		$pathInfo = pathinfo($path);

		$filename = $pathInfo["basename"];

		if ($type === 'directory' || $type === 'root') {
			$filename .= "-" . date('Y.m.d');
			$targetPath = WORKSPACE . '/';

			//////////////////////////////////////////////////////////////////80
			// Check system() command and a non windows OS
			//////////////////////////////////////////////////////////////////80
			if (Common::isAvailable('system') && stripos(PHP_OS, 'win') === false) {
				# Execute the tar command and save file
				$filename .= '.tar.gz';
				$downloadFile = $targetPath.$filename;
				$cmd = "tar -pczf ". escapeshellarg($downloadFile) . " -C " . escapeshellarg($pathInfo["dirname"]) . " " . escapeshellarg($pathInfo["basename"]);
				exec($cmd);
			} elseif (extension_loaded('zip')) {
				//Check if zip-Extension is availiable
				//build zipfile

				$filename .= '.zip';
				$downloadFile = $targetPath . $filename;
				$this->zipDir($path, $downloadFile);
			} else {
				Common::sendJSON("error", "Could not zip folder, zip-extension missing");

			}
		} elseif ($type === "file") {
			$downloadFile = WORKSPACE . '/' . $filename;
			copy($path, WORKSPACE . "/" . $filename);
		}
		Common::sendJSON("success", array("download" => $downloadFile));
	}

	/**
	* @author umbalaconmeogia at NOSPAM dot gmail dot com
	* @link http://www.php.net/manual/de/class.ziparchive.php#110719*
	* Add files and sub-directories in a folder to zip file.
	* @param string $folder
	* @param ZipArchive $zipFile
	* @param int $exclusiveLength Number of text to be exclusived from the file path.
	*/
	private static function folderToZip($folder, &$zipFile, $exclusiveLength) {
		$handle = opendir($folder);
		while ($file = readdir($handle)) {
			if ($file !== '.' && $file !== '..') {
				$filePath = "$folder/$file";
				// Remove prefix from file path before add to zip.
				$localPath = substr($filePath, $exclusiveLength);
				if (is_file($filePath)) {
					$zipFile->addFile($filePath, $localPath);
				} elseif (is_dir($filePath)) {
					// Add sub-directory.
					$zipFile->addEmptyDir($localPath);
					self::folderToZip($filePath, $zipFile, $exclusiveLength);
				}
			}
		}
		closedir($handle);
	}

	/**
	* @author umbalaconmeogia at NOSPAM dot gmail dot com
	* @link http://www.php.net/manual/de/class.ziparchive.php#110719*
	* Zip a folder (include itself).
	* Usage:
	*   DirZip::zipDir('/path/to/sourceDir', '/path/to/out.zip');
	*
	* @param string $sourcePath Path of directory to be zip.
	* @param string $outZipPath Path of output zip file.
	*/
	public static function zipDir($sourcePath, $outZipPath) {
		$pathInfo = pathInfo($sourcePath);
		$parentPath = $pathInfo['dirname'];
		$dirName = $pathInfo['basename'];

		$archive = new ZipArchive();
		$archive->open($outZipPath, ZIPARCHIVE::CREATE);
		$archive->addEmptyDir($dirName);
		self::folderToZip($sourcePath, $archive, strlen("$parentPath/"));
		$archive->close();
	}

	//////////////////////////////////////////////////////////////////////////80
	// Upload
	//////////////////////////////////////////////////////////////////////////80
	public function upload($path = false) {

		// Check that the path exists and is a directory
		if (!file_exists($path) || is_file($path)) {
			Common::sendJSON("error", "Invalid Path");
			die;
		}
		// Handle upload
		$info = array();
		while (list($key, $value) = each($_FILES['upload']['name'])) {
			if (!empty($value)) {
				$filename = $value;
				$add = $path."/$filename";
				if (@move_uploaded_file($_FILES['upload']['tmp_name'][$key], $add)) {
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
		Common::sendJSON("success", array("data" => $info));
	}
}