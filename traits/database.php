<?php

//////////////////////////////////////////////////////////////////////////////80
// Database Traits & Scroll Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80

trait Database {
	//////////////////////////////////////////////////////////////////////////80
	// Open a DB Store
	//////////////////////////////////////////////////////////////////////////80
	public static function getDB($table = false, $namespace = "") {
		$path = DATA . "/" . $namespace . "/";
		$path = preg_replace('#/+#', '/', $path);
		$db = new Scroll($table, $path);
		return $db;
	}
}

class Scroll {

	private $table;
	private $path;
	private $data;

	function __construct($table = "index", $path) {

		if (!is_dir($path)) {
			mkdir($path);
		}

		$path = $path . $table . ".db.json";

		if (is_readable($path)) {
			$json = file_get_contents($path);
			$data = json_decode($json, true);
		} else {
			$data = array();
		}

		$this->table = $table;
		$this->path = $path;
		$this->data = $data;
	}

	// Saving the file is goig to require some sort of lock
	// There could be collisions since once the DB is loaded, it doesn't refresh it's own information
	// Two processes could interect with the same DB File
	// Could add a read-only type object to prevent such a thing but how would I remove the locks
	// Locks could be named DB-Username and logging in deletes all locks
	private function save() {
		$data = json_encode($this->data, JSON_PRETTY_PRINT);
		$write = fopen($this->path, 'w') or die("can't open file: " . $this->path);
		fwrite($write, $data);
		fclose($write);
	}

	/* Create a new entry into the data base. */
	public function insert($value) {
		if (!$value) return "missing_parameter";

		$this->data[] = $value;
		$this->data = array_unique($this->data, SORT_REGULAR);
		$this->data = array_values($this->data);
		$this->save();
	}

	/* Get the content for the given query. */
	public function select($where) {
		if (!$where) return "missing_parameter";
		if ($where === "*") return $this->data;

		$temp = array();

		foreach ($this->data as &$item) {
			$match = true;

			foreach ($where as $k => $v) {
				if (!array_key_exists($k, $item)) return "invalid_key";
				if ($v !== "*" && $item[$k] !== $v) $match = false;
			}

			if ($match) $temp[] = $item;
		}
		return $temp;
	}

	/* Select all entries into the given group. */
	public function update($where = false, $value = false) {
		if (!$where && !$value) return "missing_parameter";

		if ($where === "*") {
			foreach ($this->data as &$item) {
				foreach ($value as $k => $v) {
					$item[$k] = $v;
				}
			}
		} else {

			foreach ($this->data as &$item) {
				$match = true;

				foreach ($where as $k => $v) {
					if (!array_key_exists($k, $item)) return "invalid_key";
					if ($v !== "*" && $item[$k] !== $v) $match = false;
				}
				if ($match) {
					foreach ($value as $k => $v) {
						$item[$k] = $v;
					}
				}
			}
		}
		$this->save();
	}

	public function delete($where = false) {
		if (!$where) return "missing_parameter";

		$temp = array();

		if ($where !== "*") {
			foreach ($this->data as $key => $item) {
				foreach ($where as $k => $v) {
					if (!array_key_exists($k, $item)) return "invalid_key";
					if ($v !== "*" && $item[$k] !== $v) $temp[] = $item;
				}
			}
		}
		$this->data = $temp;
		$this->save();
	}
}