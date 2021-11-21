<?php

//////////////////////////////////////////////////////////////////////////////80
// Macro Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @daeks, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class Macro {

	//////////////////////////////////////////////////////////////////////////80
	// PROPERTIES
	//////////////////////////////////////////////////////////////////////////80
	private $activeUser = null;
	private $macros = null;
	private $db = null;

	private $defaults = array(
		[
			"uuid" => "macro-947e-4763-b7b6f2",
			"title" => "Execute",
			"type" => "file",
			"fTypes" => ["sh"],
			"command" => "%PATH%",
			"icon" => "fas fa-magic",
			"owner" => "ATHEOS"
		],
		[
			"uuid" => "macro-53a0-4ebb-56e800",
			"title" => "Execute",
			"type" => "file",
			"fTypes" => ["php"],
			"command" => "cd %FOLDER% && php %BASENAME%",
			"icon" => "fas fa-magic",
			"owner" => "ATHEOS"
		],
		[
			"uuid" => "macro-43g6-5fee-1r341",
			"title" => "Compile",
			"type" => "file",
			"fTypes" => ["java"],
			"command" => "cd %FOLDER% && javac %BASENAME%",
			"icon" => "fas fa-magic",
			"owner" => "ATHEOS"
		],
		[
			"uuid" => "macro-asd1-gds3-sdf43",
			"title" => "Execute",
			"type" => "file",
			"fTypes" => ["class"],
			"command" => "cd %FOLDER% && java %FILENAME%",
			"icon" => "fas fa-magic",
			"owner" => "ATHEOS"
		],
	);

	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// ----------------------------------||---------------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Construct
	//////////////////////////////////////////////////////////////////////////80
	public function __construct($activeUser) {
		$this->activeUser = $activeUser;
		$this->db = Common::getObjStore("macros");

		$this->macros = $this->db->select("*");

		if (empty($this->macros)) {
			$this->macros = $this->defaults;
			$this->db->insert($this->macros[0]);
			$this->db->insert($this->macros[1]);
		}

	}

	//////////////////////////////////////////////////////////////////////////80
	// List Macros
	//////////////////////////////////////////////////////////////////////////80
	public function listMacros() {
		return $this->macros;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Load Macros
	//////////////////////////////////////////////////////////////////////////80
	public function load() {
		if (!empty($this->macros)) {
			Common::send("success", $this->macros);
		} else {
			Common::send("error", "No macros found.");
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Save Macros
	//////////////////////////////////////////////////////////////////////////80
	public function save($uuid, $title, $type, $fTypes, $command) {
		$where = array(["uuid", "==", $uuid]);

		$value = array(
			"uuid" => $uuid,
			"title" => $title,
			"type" => $type,
			"fTypes" => $type === "file" ? explode(",", $fTypes) : "N/A",
			"command" => $command,
			"icon" => "fas fa-magic",
			"owner" => $this->activeUser,
		);

		if ($this->db->update($where, $value, true)) {
			Common::send("success", "Macro saved.");
		} else {
			Common::send("error", "Could not save.");
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Delete Macros
	//////////////////////////////////////////////////////////////////////////80
	public function delete($uuid) {
		$where = array(["uuid", "==", $uuid]);

		if ($this->db->delete($where)) {
			Common::send("success", "Macro deleted.");
		} else {
			Common::send("error", "Could not delete.");
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Execute Macro
	//////////////////////////////////////////////////////////////////////////80
	public function execute($uuid, $path) {
		$path = Common::getWorkspacePath($path);
		$where = array(["uuid", "==", $uuid]);
		$macro = $this->db->select($where);

		if (empty($macro)) {
			Common::send("error", "Macro not found.");
		}

		$macro = $macro[0];
		$command = $macro["command"];

		$command = str_replace("%PATH%", $path, $command);
		$command = str_replace("%FOLDER%", dirname($path), $command);
		$command = str_replace("%BASENAME%", basename($path), $command);
		$command = str_replace("%FILENAME%", pathinfo($path, PATHINFO_FILENAME), $command);

		$result = Common::execute($command);
		$text = $result["text"];
		$code = $result["code"];

		if ($text === "") {
			$text = $code === 0 ? "Executed Successfully" : "Execution Failure, reason unknown.";
		}

		if ($code === 0) {
			// Common::send("success", ["text" => implode("\n", $text)]);
			Common::send("success", $text);
		} else {
			Common::send("error", $text);
		}
	}

}