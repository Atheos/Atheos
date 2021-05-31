<?php

//////////////////////////////////////////////////////////////////////////////80
// Draft Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
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
		Common::deleteCache($name, "drafts");
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
		$content = Common::loadCache($name, "drafts");

		if (!$content) {
			$this->db->delete($where);
			Common::send("error", "Draft file missing.");
		}

		Common::deleteCache($name, "drafts");
		Common::send("success", array("content" => $content));
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

		$name = Common::saveCache($path . $this->activeUser, $content, "drafts");
		if (!$name) Common::send("error", "Unable to save draft.");

		$where = array(["user", "==", $this->activeUser], ["path", "==", $path]);
		$value = array("user" => $this->activeUser, "path" => $path, "name" => $name, "time" => time());
		$this->db->update($where, $value, true);

		Common::send("success");
	}
}