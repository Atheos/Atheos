<?php

/*
*  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
*  as-is and without warranty under the MIT License. See
*  [root]/license.txt for more. This information must remain intact.
*/

require_once('../../common.php');

class Active {

	//////////////////////////////////////////////////////////////////
	// PROPERTIES
	//////////////////////////////////////////////////////////////////

	public $username = "";
	public $path = "";
	public $new_path = "";
	public $actives = "";

	//////////////////////////////////////////////////////////////////
	// METHODS
	//////////////////////////////////////////////////////////////////

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////
	// Construct
	//////////////////////////////////////////////////////////////////

	public function __construct() {
		$this->actives = Common::readJSON('active');
	}

	//////////////////////////////////////////////////////////////////
	// List User's Active Files
	//////////////////////////////////////////////////////////////////

	public function listActive() {
		$active_list = array();
		$tainted = false;
		$root = WORKSPACE;
		if ($this->actives) {
			foreach ($this->actives as $active => $data) {
				if (is_array($data) && isset($data['username']) && $data['username'] == $this->username) {
					if (Common::isAbsPath($data['path'])) {
						$root = "";
					} else {
						$root = $root.'/';
					}
					if (file_exists($root.$data['path'])) {
						$focused = isset($data['focused']) ? $data['focused'] : false;
						$active_list[] = array('path' => $data['path'], 'focused' => $focused);
					} else {
						unset($this->actives[$active]);
						$tainted = true;
					}
				}
			}
		}

		if ($tainted) {
			Common::saveJSON('active', $this->actives);
		}
		Common::sendJSON("S2000", $active_list);

	}

	//////////////////////////////////////////////////////////////////
	// Check File
	//////////////////////////////////////////////////////////////////

	public function check() {
		$cur_users = array();
		foreach ($this->actives as $active => $data) {
			if (is_array($data) && isset($data['username']) && $data['username'] != $this->username && $data['path'] == $this->path) {
				$cur_users[] = ucfirst($data['username']);
			}
		}
		if (count($cur_users) != 0) {
			Common::sendJSON("warning", "File '".substr($this->path, strrpos($this->path, "/")+1)."' currently opened by: " . implode(", ", $cur_users));
		} else {
			Common::sendJSON("S2000");
		}
	}

	//////////////////////////////////////////////////////////////////
	// Add File
	//////////////////////////////////////////////////////////////////

	public function add() {
		$process_add = true;
		foreach ($this->actives as $active => $data) {
			if (is_array($data) && isset($data['username']) && $data['username'] == $this->username && $data['path'] == $this->path) {
				$process_add = false;
			}
		}
		if ($process_add) {
			$this->actives[] = array("username" => $this->username, "path" => $this->path);
			Common::saveJSON('active', $this->actives);
			Common::sendJSON("S2000");
		}
	}

	//////////////////////////////////////////////////////////////////
	// Rename File
	//////////////////////////////////////////////////////////////////
	public function rename() {
		$revised_actives = array();
		foreach ($this->actives as $active => $data) {
			if (is_array($data) && isset($data['username'])) {
				$revised_actives[] = array("username" => $data['username'], "path" => str_replace($this->path, $this->new_path, $data['path']));
			}
		}

		Common::saveJSON('active', $revised_actives);
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////
	// Remove File
	//////////////////////////////////////////////////////////////////
	public function remove() {
		foreach ($this->actives as $active => $data) {
			if (is_array($data) && isset($data['username']) && $this->username == $data['username'] && $this->path == $data['path']) {
				unset($this->actives[$active]);
			}
		}

		Common::saveJSON('active', $this->actives);
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////
	// Remove All Files
	//////////////////////////////////////////////////////////////////
	public function removeAll() {
		foreach ($this->actives as $active => $data) {
			if (is_array($data) && isset($data['username']) && $this->username == $data['username']) {
				unset($this->actives[$active]);
			}
		}

		Common::saveJSON('active', $this->actives);
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////
	// Mark File As Focused
	//  All other files will be marked as non-focused.
	//////////////////////////////////////////////////////////////////
	public function markFileAsFocused() {
		foreach ($this->actives as $active => $data) {
			if (is_array($data) && isset($data['username']) && $this->username == $data['username']) {
				$this->actives[$active]['focused'] = false;
				if ($this->path == $data['path']) {
					$this->actives[$active]['focused'] = true;
				}
			}
		}

		Common::saveJSON('active', $this->actives);
		Common::sendJSON("S2000");
	}
}