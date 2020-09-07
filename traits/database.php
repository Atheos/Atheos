<?php

//////////////////////////////////////////////////////////////////////////////80
// Database trait & Scroll class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

trait Database {
	public static function getScroll($table = false, $namespace = "") {
		$path = DATA . "/" . $namespace . "/";
		$path = preg_replace('#/+#', '/', $path);
		$db = new Scroll($table, $path);
		return $db;
	}

	public static function getParchment($table = false, $namespace = "") {
		$path = DATA . "/" . $namespace . "/";
		$path = preg_replace('#/+#', '/', $path);
		$db = new Parchment($table, $path);
		return $db;
	}
}

class Codec {

	protected $path;
	protected $data;

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

		$this->path = $path;
		$this->data = $data;
	}

	protected function save($shuffle = false) {
		// $this->data = array_unique($this->data, SORT_REGULAR);

		if ($shuffle) $this->data = array_values($this->data);
		$data = json_encode($this->data, JSON_PRETTY_PRINT);
		$write = fopen($this->path, 'w') or die("can't open file: " . $this->path);
		fwrite($write, $data);
		fclose($write);
	}

}


class Parchment extends Codec {

	public function insert($key = false, $value = false) {
		if (!$key || !$value) return "missing_parameter";
		$this->data[$key] = $value;
		$this->save();
	}

	public function select($key = false, $value = false) {
		if (!$key) return "missing_parameter";

		if (is_array($key)) {
			return array_intersect_key($this->data, array_flip($key));
		} elseif ($key === "*") {
			if ($value) {
				$key = array_search($value, $this->data);
				return $key ? $this->data[$key] : null;
			} else {
				return $this->data;
			}
		} else {
			return array_key_exists($key, $this->data) ? $this->data[$key] : null;
		}
	}

	/* Select all entries into the given group. */
	public function update($key = null, $value = null, $insert = false) {
		if (empty($key) || empty($value)) return "missing_parameter";

		if (is_array($key)) {
			$count = count($key);
			if (!is_array($value) || $count !== count($value)) return "invalid_parameter";

			foreach ($this->data as $k => $v) {
				for ($x = 0; $x < $count; $x++) {
					if ($insert || $k === $key[$x]) $this->data[$key[$x]] = $value[$x];
				}
			}

			$this->save();
		} elseif ($key === "*") {
			foreach ($this->data as $k => $v) {
				$this->data[$k] = $value;
			}
			$this->save();

		} elseif ($insert || array_key_exists($key, $this->data)) {
			$this->data[$key] = $value;
			$this->save();
		}
	}

	public function delete($key = false, $value = false) {
		if (!$key) return "missing_parameter";

		if (is_array($key)) {
			foreach ($key as $k) {
				if (array_key_exists($k, $this->data)) unset($this->data[$k]);
			}

			$this->save();
		} elseif ($key === "*") {
			if ($value) {
				$key = array_search($value, $this->data);
				if ($key) unset($this->data[$key]);
			} else {
				$this->data = [];
			}
			$this->save();
		} elseif (array_key_exists($key, $this->data)) {
			unset($this->data[$key]);
			$this->save();
		}


	}
}

class Scroll extends Codec {

	/* Create a new entry into the data base. */

	// Could make the where clause explode on periods and then use each part of the array as a key.
	// So search on key[k1][k2][k3];
	public function insert($value = false) {
		if (!$value) return "missing_parameter";
		$this->data[] = $value;
		$this->save(true);
	}

	/* Get the content for the given query. */
	public function &filter($where = false, $reverse = false) {
		if (!$where) return "missing_parameter";
		if ($where === "*") return $this->data;

		$positive = array();
		$negative = array();

		foreach ($this->data as &$item) {
			$match = true;

			foreach ($where as $w) {
				if (!is_array($w) || count($w) !== 3) return "invalid_where";
				$k = $w[0];
				$o = $w[1];
				$v = $w[2];
				if (!array_key_exists($k, $item)) {
					$match = false;
				} else {
					switch ($o) {
						case "==": if ($v !== "*" && $item[$k] !== $v) $match = false; break;
						case "!=": if (($v === "*" && isset($item[$k])) || $item[$k] === $v) $match = false; break;
						case ">=": if ((int)$item[$k] < $v) $match = false; break;
						case "<=": if ((int)$item[$k] > $v) $match = false; break;
						case "RX": if (!preg_match($v, $item[$k])) $match = false; break;
					}
				}
			}

			if ($match) $positive[] =& $item;
			if (!$match) $negative[] =& $item;
		}
		$result = $reverse ? $negative : $positive;
		return $result;
	}

	public function select($where = false) {
		if (!$where) return "missing_parameter";
		$result = array();
		$temp = $this->filter($where);
		foreach ($temp as $item) {
			$result[] = $item;
		}
		return $result;
	}

	/* Select all entries into the given group. */
	public function update($where = false, $value = false, $insert = false) {
		if (!$where && !$value) return "missing_parameter";
		$data =& $this->filter($where);
		if (empty($data) && $insert) {
			$this->data[] = $value;
		} else {
			foreach ($data as &$item) {
				foreach ($value as $k => $v) {
					$item[$k] = $v;
				}
			}}

		$this->save(true);
	}

	public function delete($where = false) {
		if (!$where) return "missing_parameter";

		$temp = array();

		if ($where !== "*") {
			$temp =& $this->filter($where, true);
		}

		$this->data = $temp;
		$this->save(true);
	}
}