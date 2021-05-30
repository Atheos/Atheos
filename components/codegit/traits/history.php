<?php


trait History {

	public function loadLog($repo, $path) {

		$cmd = "git log --relative-date --pretty=format:\"%H|%an|%ae|%ar|%s\" -500";
		if ($path) {
			$cmd .= " -- " . $path;
		}

		$result = $this->execute($cmd);
		if (!$result) {
			return "Error loading log";
		}

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

		$result = $this->execute("git status --branch --porcelain");

		if ($result) {
			$status = $this->parseChanges($result);
		} else {
			return false;
		}

		$result = array();

		if (in_array($path, $status['untracked'])) {
			$result = $this->untrackedDiff($path);

		} else if (in_array($path, $status['modified'])) {
			$result = $this->execute('git diff ' . $path);
			$result[] = "\n";

		} else if (in_array($path, $status['added'])) {
			$result = $this->execute('git diff --cached ' . $path);
			$result[] = "\n";

		} else if (in_array($path, $status['deleted'])) {
			$result = $this->execute('git diff -- ' . $path);
			$result[] = "\n";

		} else {
			// Come back to
			return false;
		}

		foreach ($result as $i => $line) {
			$line = str_replace ("\t", "    ", $line);
			$result[$i] = htmlentities($line);
		}

		return $result;
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
			$temp = $this->execute('cat ' . $path)["data"];
			array_push($result, "diff --git a/". $path . " b/" . $path);
			foreach ($temp as $i => $line) {
				array_push($result, "+" . $line);
			}
			array_push($result, "\n");
		}
		return $result;
	}


	public function loadBlame($repo, $path) {
		$result = $this->execute("git blame -c --date=format:'%b %d, %Y %H:%M' " . $path);
		return $result;
	}

	public function checkout($repo, $file) {
		$result = $this->execute("git checkout -- " . $file);
		if ($result) {
			Common::send("success", i18n("git_undo_success"));
		} else {
			Common::send("error", i18n("git_undo_failed"));
		}
	}
}