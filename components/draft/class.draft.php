<?php

//////////////////////////////////////////////////////////////////////////////80
// Draft Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class Draft {

	//////////////////////////////////////////////////////////////////////////80
	// PROPERTIES
	//////////////////////////////////////////////////////////////////////////80
	private $activeUser = null;
	private $db = null;

	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Construct
	//////////////////////////////////////////////////////////////////////////80
	public function __construct($activeUser) {
		$this->activeUser = $activeUser;
		$this->db = Common::getObjStore("drafts");
		if (!is_dir(DATA . "/drafts")) {
			mkdir(DATA . "/drafts");
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Check
	//////////////////////////////////////////////////////////////////////////80
	public function check($path) {
		$where = array(["user", "==", $this->activeUser], ["path", "==", $path]);
		$results = $this->db->select($where);
		if (empty($results)) {
			Common::send("notice", "No drafts.");
		} else {
			Common::send("success", $results[0]);
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Delete
	//////////////////////////////////////////////////////////////////////////80
	public function delete($path) {
		$where = array(["user", "==", $this->activeUser], ["path", "==", $path]);
		$results = $this->db->select($where);
		if (empty($results)) {
			Common::send("warning", "No drafts.");
		}

		$name = $results[0]["name"];
		$draft = DATA . "/drafts/$name";
		if (is_file($draft)) {
			unlink($draft);
		}

		$this->db->delete($where);
		Common::send("success");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Open
	//////////////////////////////////////////////////////////////////////////80
	public function open($path) {
		$where = array(["user", "==", $this->activeUser], ["path", "==", $path]);
		$results = $this->db->select($where);
		if (empty($results)) {
			Common::send("warning", "No drafts.");
		}

		$name = $results[0]["name"];
		$draft = DATA . "/drafts/$name";
		
		if (!is_file($draft)) {
			$this->db->delete($where);
			Common::send("error", "Draft file missing.");
		}

		$output = file_get_contents($draft);
		unlink($draft);
		Common::send("success", array("content" => $output));
	}

	//////////////////////////////////////////////////////////////////////////80
	// Save (Modifies a file name/contents or directory name)
	//////////////////////////////////////////////////////////////////////////80
	public function save($path, $content = false) {
		// Change content
		if (!$content) {
			$file = fopen($path, 'w');
			fclose($file);
			Common::send("success");
		}

		if ($content === ' ') {
			$content = ''; // Blank out file
		}

		$name = md5($path . $this->activeUser);
		$draft = DATA . "/drafts/$name";

		if ($file = fopen($draft, 'w')) {
			if (fwrite($file, $content)) {

				$where = array(["user", "==", $this->activeUser], ["path", "==", $path]);
				$value = array("user" => $this->activeUser, "path" => $path, "name" => $name, "time" => time());
				$this->db->update($where, $value, true);

				Common::send("success");
			} else {
				Common::send("error", "Client does not have access.");
			}

			fclose($file);
		} else {
			Common::send("error", "Client does not have access.");
		}
	}
}