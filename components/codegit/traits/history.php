<?php


trait History {

	public function loadLog($path) {

		$cmd = "git log --relative-date --pretty=format:\"%H|%an|%ae|%ar|%s\" -500";
		if ($path) {
			$cmd .= " -- " . $path;
		}

		$result = $this->execute($cmd);
		if ($result["code"] !== 0) {
			return "Error loading log";

		}
		
		$pivot = array();
		foreach ($result["text"] as $item) {
			$item = str_replace ("\\", "", $item);
			$item = explode('|', $item);
			$pivot[] = array(
				"hash" => $item[0] ?? '',
				"author" => $item[1] ?? '',
				"email" => $item[2] ?? '',
				"date" => $item[3] ?? '',
				"message" => $item[4] ?? ''
			);
		}
		return $pivot;
	}

	public function loadDiff($path) {

		$result = $this->execute("git status --branch --porcelain");

		if ($result["code"] !== 0) return false;
		$status = $this->parseChanges($result["text"]);

		$result = array();

		if (in_array($path, $status['untracked'])) {
			$result = $this->untrackedDiff($path);

		} else if (in_array($path, $status['modified'])) {
			$result = $this->execute('git diff ' . $path)["text"];
			$result[] = "\n";

		} else if (in_array($path, $status['added'])) {
			$result = $this->execute('git diff --cached ' . $path)["text"];
			$result[] = "\n";

		} else if (in_array($path, $status['deleted'])) {
			$result = $this->execute('git diff -- ' . $path)["text"];
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
			$temp = $this->execute('cat ' . $path)["text"];
			array_push($result, "diff --git a/". $path . " b/" . $path);
			foreach ($temp as $line) {
				array_push($result, "+" . $line);
			}
			array_push($result, "\n");
		}
		return $result;
	}


	public function loadBlame($path) {
		$result = $this->execute("git blame -c --date=format:'%b %d, %Y %H:%M' " . $path);
		return $result["text"];
	}

	public function checkout($file) {
		$result = $this->execute("git checkout -- " . $file);
		if ($result["code"] === 0) {
			Common::send(200, i18n("git_checkout_success"));
		} else {
			Common::send(500, i18n("git_checkout_failed"));
		}
	}
}