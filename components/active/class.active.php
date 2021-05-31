<?php

//////////////////////////////////////////////////////////////////////////////80
// Active Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class Active {

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
	public function __construct() {
		$this->activeUser = SESSION("user");
		$this->db = Common::getObjStore("active");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Add File
	//////////////////////////////////////////////////////////////////////////80
	public function add($path) {
		$where = array(["user", "==", $this->activeUser], ["path", "==", $path], ["status", "==", "*"]);
		$value = array("user" => $this->activeUser, "path" => $path, "status" => "active");
		$this->db->update($where, $value, true);
		Common::send("success");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Check File
	//////////////////////////////////////////////////////////////////////////80
	public function check($path) {
		$where = array(["user", "!=", $this->activeUser], ["path", "==", $path]);
		$result = $this->db->select($where);

		if (count($result) > 0) {
			$activeUsers = array();
			foreach ($result as $item) {
				if ($item["user"] !== $this->activeUser) $activeUsers[] = $item["user"];
			}
			Common::send("warning", i18n("warning_fileOpen", implode(", ", $activeUsers)));
		} else {
			Common::send("success");
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// List User's Active Files
	//////////////////////////////////////////////////////////////////////////80
	public function listActive() {
		$where = array(["user", "==", $this->activeUser]);
		$result = $this->db->select($where);

		$temp = array(
			"inFocus" => false
		);
		foreach ($result as $file) {
			$path = $file["path"];

			if (file_exists(Common::getWorkspacePath($path))) {
				if ($file["status"] === "inFocus") $temp["inFocus"] = $path;

				$temp[] = $file;
			} else {

				// Invalid file path
				$where = array(["user", "==", $this->activeUser], ["path", "==", $path]);
				$this->db->delete($where);
			}
		}

		Common::send("success", $temp);
	}

	//////////////////////////////////////////////////////////////////////////80
	// Rename File
	//////////////////////////////////////////////////////////////////////////80
	public function rename($oldPath, $newPath) {
		$where = array(["user", "==", $this->activeUser], ["path", "==", $oldPath]);
		$value = array("path" => $newPath);
		$this->db->update($where, $value);
		Common::send("success");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Remove File
	//////////////////////////////////////////////////////////////////////////80
	public function remove($path) {
		$where = array(["user", "==", $this->activeUser], ["path", "==", $path]);
		$this->db->delete($where);
		Common::send("success");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Remove All Files
	//////////////////////////////////////////////////////////////////////////80
	public function removeAll() {
		$where = array(["user", "==", $this->activeUser]);
		$this->db->delete($where);
		Common::send("success");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Mark File As Focused
	//  All other files will be marked as non-focused.
	//////////////////////////////////////////////////////////////////////////80
	public function setFocus($path) {
		$where = array(["user", "==", $this->activeUser], ["path", "==", "*"]);
		$value = array("status" => "active");
		$this->db->update($where, $value);
		$where = array(["user", "==", $this->activeUser], ["path", "==", $path]);
		$value = array("status" => "inFocus");
		$this->db->update($where, $value);
		Common::send("success");
	}
}