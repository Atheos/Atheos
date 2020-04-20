<?php

/*
*  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
*  as-is and without warranty under the MIT License. See
*  [root]/license.txt for more. This information must remain intact.
*/

require_once('../../lib/diff_match_patch.php');
require_once('../../common.php');

class Filemanager extends Common
{

	//////////////////////////////////////////////////////////////////
	// PROPERTIES
	//////////////////////////////////////////////////////////////////

	public $root = WORKSPACE;
	public $project = "";
	private $relativePath = "";
	private $path = "";
	private $patch = "";
	private $type = "";
	private $newName = "";
	private $content = "";
	private $dest = "";
	private $upload = "";
	private $controller = "";
	private $upload_json = "";

	// JSEND Return Contents
	private $status = "";
	private $data = "";
	private $message = "";

	//////////////////////////////////////////////////////////////////
	// METHODS
	//////////////////////////////////////////////////////////////////

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////
	// Construct
	//////////////////////////////////////////////////////////////////

	public function __construct($get, $post) {
		foreach (array('type', 'newName') as $key) {
			$temp = Common::data($key);
			if ($temp) {
				$this->$key = $temp;
			}
		}

		foreach (array('path', 'dest') as $key) {
			$temp = Common::data($key);
			if ($temp) {
				$this->$key = Common::cleanPath($temp);
			} else {
				$this->$key = false;
			}
		}
		$this->relativePath = Common::cleanPath($this->path);


		if ($this->relativePath !== "/") {
			$this->relativePath .= "/";
		}

		if (!Common::isAbsPath($this->path)) {

			$this->root .= '/';
			$this->path = $this->root . $this->path;

			// Duplicate
			if ($this->dest) {
				$this->dest = $this->root . $this->dest;
			}
		}

		foreach (array('content', 'modifyTime', 'patch') as $key) {
			$temp = Common::data($key);
			if ($temp) {
				if (get_magic_quotes_gpc()) {
					$this->$key = stripslashes($temp);
				} else {
					$this->$key = $temp;
				}
			} else {
				$this->$key = false;
			}
		}
	}

	//////////////////////////////////////////////////////////////////
	// INDEX (Returns list of files and directories)
	//////////////////////////////////////////////////////////////////

	public function index() {
		if (!file_exists($this->path)) {
			Common::sendJSON("E402m");
			die;
		}

		$index = array();
		if (!is_dir($this->path) || !($handle = opendir($this->path))) {
			Common::sendJSON("error", "Not a valid directory.");
			die;
		}

		while (false !== ($object = readdir($handle))) {
			if ($object === "." || $object === ".." || $object === $this->controller) {
				continue;
			}

			if (is_dir($this->path.'/'.$object)) {
				$type = "directory";
				$size = count(glob($this->path.'/'.$object.'/*'));
			} else {
				$type = "file";
				$size = @filesize($this->path.'/'.$object);
			}

			$index[] = array(
				"name" => $this->relativePath . $object,
				"path" => $this->relativePath . $object,
				"type" => $type,
				"size" => $size
			);
		}

		//////////////////////////////////////////////////////////////////
		// The name return should be removed soon as it's only here currently for backwards compatability
		//////////////////////////////////////////////////////////////////
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
	public function open() {
		if (!is_file($this->path)) {
			Common::sendJSON("error", "Not a valid file.");
			die;
		}
		$output = file_get_contents($this->path);

		if (extension_loaded('mbstring')) {
			if (!mb_check_encoding($output, 'UTF-8')) {
				if (mb_check_encoding($output, 'ISO-8859-1')) {
					$output = utf8_encode($output);
				} else {
					$output = mb_convert_encoding($content, 'UTF-8');
				}
			}
		}

		$modifyTime = filemtime($this->path);
		Common::sendJSON("success", array("content" => $output, "modifyTime" => $modifyTime));

	}

	//////////////////////////////////////////////////////////////////
	// OPEN IN BROWSER (Return URL)
	//////////////////////////////////////////////////////////////////
	public function openinbrowser() {
		$protocol = ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
		$domainName = $_SERVER['HTTP_HOST'];
		$url = $protocol.WSURL.'/'.$this->relativePath;
		Common::sendJSON("success", array("url" => rtrim($url, "/")));
	}

	//////////////////////////////////////////////////////////////////
	// CREATE (Creates a new file or directory)
	//////////////////////////////////////////////////////////////////
	public function create() {

		if (file_exists($this->path)) {
			Common::sendJSON("error", "Path already exists.");
			die;
		}

		if ($this->type === "directory" && mkdir($this->path)) {
			Common::sendJSON("S2000");
		} elseif ($this->type === "file" && $file = fopen($this->path, 'w')) {
			if ($this->content) {
				fwrite($file, $this->content);
			}
			$modifyTime = filemtime($this->path);
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
	public function delete() {

		function rDelete($target) {
			// Unnecessary, but rather be safe that sorry.
			if ($target === "." || $target === "..") {
				return;
			}
			if (is_dir($target)) {
				Common::debug($target);
				$files = glob($target . "{*,.[!.]*,..?*}", GLOB_BRACE|GLOB_MARK); //GLOB_MARK adds a slash to directories returned

				foreach ($files as $file) {
					rDelete($file);
				}

				rmdir($target);
			} elseif (is_file($target)) {
				unlink($target);
			}
		}

		if (!file_exists($this->path)) {
			Common::sendJSON("E402i");
			die;
		}

		rDelete($this->path);

		Common::sendJSON("S2000");

	}

	//////////////////////////////////////////////////////////////////
	// MODIFY (Modifies a file name/contents or directory name)
	//////////////////////////////////////////////////////////////////
	public function modify() {

		// Change name
		if ($this->newName) {
			$explode = explode('/', $this->path);
			array_pop($explode);
			$new_path = implode("/", $explode) . "/" . $this->newName;
			if (!file_exists($new_path)) {
				if (rename($this->path, $new_path)) {
					//unlink($this->path);
					$this->status = "success";
				} else {
					$this->status = "error";
					$this->message = "Could Not Rename";
				}
			} else {
				$this->status = "error";
				$this->message = "Path Already Exists";
			}
		} else {
			// Change content
			if ($this->content || $this->patch) {
				if ($this->content == ' ') {
					$this->content = ''; // Blank out file
				}
				if ($this->patch && ! $this->modifyTime) {
					$this->status = "error";
					$this->message = "modifyTime parameter not found";
					$this->respond();
					return;
				}
				if (is_file($this->path)) {
					$servermodifyTime = filemtime($this->path);
					$fileContents = file_get_contents($this->path);

					if ($this->patch && $this->modifyTime != $servermodifyTime) {
						$this->status = "error";
						$this->message = "Client is out of sync";
						//DEBUG : file_put_contents($this->path.".conflict", "SERVER modifyTime :".$servermodifyTime.", CLIENT modifyTime :".$this->modifyTime);
						$this->respond();
						return;
					} elseif (strlen(trim($this->patch)) == 0 && ! $this->content) {
						// Do nothing if the patch is empty and there is no content
						$this->status = "success";
						$this->data = '"modifyTime":'.$servermodifyTime;
						$this->respond();
						return;
					}

					if ($file = fopen($this->path, 'w')) {
						if ($this->patch) {
							$dmp = new diff_match_patch();
							$p = $dmp->patch_apply($dmp->patch_fromText($this->patch), $fileContents);
							$this->content = $p[0];
							//DEBUG : file_put_contents($this->path.".orig",$fileContents );
							//DEBUG : file_put_contents($this->path.".patch", $this->patch);
						}

						if (fwrite($file, $this->content) === false) {
							$this->status = "error";
							$this->message = "could not write to file";
						} else {
							// Unless stat cache is cleared the pre-cached modifyTime will be
							// returned instead of new modification time after editing
							// the file.
							clearstatcache();
							$this->data = '"modifyTime":'.filemtime($this->path);
							$this->status = "success";
						}

						fclose($file);
					} else {
						$this->status = "error";
						$this->message = "Cannot Write to File";
					}
				} else {
					$this->status = "error";
					$this->message = "Not A File";
				}
			} else {
				$file = fopen($this->path, 'w');
				fclose($file);
				$this->data = '"modifyTime":'.filemtime($this->path);
				$this->status = "success";
			}
		}

		$this->respond();
	}

	//////////////////////////////////////////////////////////////////
	// DUPLICATE (Creates a duplicate of the object - (cut/copy/paste)
	//////////////////////////////////////////////////////////////////

	public function duplicate() {

		if (!file_exists($this->path)) {
			Common::sendJSON("error", "Invalid source: " . $this->path);
			die;
		}

		if (file_exists($this->dest)) {
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

		if (is_file($this->path)) {
			copy($this->path, $this->dest);
			Common::sendJSON("success", "File Duplicated");
		} else {
			rCopyDirectory($this->path, $this->dest);
			Common::sendJSON("success", "Folder Duplicated");
		}
	}

	//////////////////////////////////////////////////////////////////
	// UPLOAD (Handles uploads to the specified directory)
	//////////////////////////////////////////////////////////////////

	public function upload() {
		// Check that the path is a directory
		if (!file_exists($this->path) || is_file($this->path)) {
			Common::sendJSON("error", "Invalid Path");
			die;
		}
		// Handle upload
		$info = array();
		while (list($key, $value) = each($_FILES['upload']['name'])) {
			if (!empty($value)) {
				$filename = $value;
				$add = $this->path."/$filename";
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
		Common::sendJSON("success", "Invalid Path");

		$this->upload_json = json_encode($info);

		$this->respond();
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