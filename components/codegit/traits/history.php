<?php


trait History {

	public function loadLog($repo, $path) {
		if (!is_dir($repo)) return false;
		chdir($repo);
		$cmd = "git log --relative-date --pretty=format:\"%H|%an|%ae|%ar|%s\" -500";
		if ($path) {
			$cmd .= " -- " . $path;
		}

		$result = $this->execute($cmd);
		if (!$result) {
			return "Error loading log";
		}

		// $result = $this->resultArray;
		$pivot = array();
		foreach ($result as $i => $item) {
			$item = explode('\\|', $item);
			$pivot[] = array(
				"hash" => $item[0],
				"author" => $item[1],
				"email" => $item[2],
				"date" => $item[3],
				"message" => $item[4]
			);
		}

		return $pivot;
	}

	public function loadDiff($repo, $path) {

		if (!is_dir($repo)) return false;
		chdir($repo);

		$result = $this->execute("git status --branch --porcelain");

		if ($result) {
			$status = $this->parseChanges($result);
		} else {
			return false;
		}

		if (in_array($path, $status['untracked'])) {
			$this->resultArray = $this->untrackedDiff($path);
			
		} else if (in_array($path, $status['modified'])) {
			$this->executeCommand('git diff ' . $path);
			array_push($this->resultArray, "\n");
			
		} else if (in_array($path, $status['added'])) {
			$this->executeCommand('git diff --cached ' . $path);
			array_push($this->resultArray, "\n");
			
		} else if (in_array($path, $status['renamed'])) {
			$this->executeCommand('git diff ' . $path);
			if ($this->result == "") {
				$this->executeCommand('git status --branch --porcelain');
				foreach ($this->resultArray as $i => $line) {
					if (strpos($line, $path) !== false) {
						$name = substr($line, 2);
						$this->resultArray = array("Renamed: " . $name . "\n");
						break;
					}
				}
			} else {
				array_push($this->resultArray, "\n");
			}
		} else if (in_array($path, $status['deleted'])) {
			$this->executeCommand('git diff -- ' . $path);
			array_push($this->resultArray, "\n");
		} else {
			return $this->returnMessage("notice", "No changes!");
		}

		foreach ($this->resultArray as $i => $line) {
			$line = str_replace ("\t", "    ", $line);
			$this->resultArray[$i] = htmlentities($line);
		}

		return $this->resultArray;
	}

	private function untrackedDiff($path) {
		$result = array();
		if (is_dir($path)) {
			foreach (scandir($path) as $file) {
				if ($file == '.' || $file == '..') {
					continue;
				}
				if (ereg("/$", $path) === false) {
					$path .= "/";
				}
				$res = $this->untrackedDiff($path . $file);
				foreach ($res as $line) {
					array_push($result, $line);
				}
			}
		} else {
			$this->executeCommand('cat ' . $path);
			array_push($result, "diff --git a/". $path . " b/" . $path);
			foreach ($this->resultArray as $i => $line) {
				array_push($result, "+" . $line);
			}
			array_push($result, "\n");
		}
		return $result;
	}


	public function loadBlame($repo, $path) {

		if (!is_dir($repo)) return false;
		chdir($repo);

		$result = $this->executeCommand("git blame -c " . $path);
		$result = $this->executeCommand("git blame -c --date=format:'%b %d, %Y %H:%M' " . $path);

		if ($result !== 0) {
			return $this->returnMessage("error", "Failed to get git blame");
		} else {
			return $this->resultArray;
		}
	}
}