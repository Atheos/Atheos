<?php


trait Commit {

	public function add($file) {
		return $this->execute("git add --all " . $file);
	}

	public function commit($message, $files) {
		$files = explode(',', $files);

		foreach ($files as $file) {
			if ($this->add($file) === 0) {
				Common::sendJSON("error", i18n("git_addFailed", $file)); die;
			}
		}

		$result = $this->execute("git commit -m\"" . $message . "\"");
		if ($result) {
			Common::sendJSON("success", i18n("git_commit_success"));
		} else {
			Common::sendJSON("success", i18n("git_commit_failed"));
		}
	}

	public function showCommit($path, $commit) {
		if (!is_dir($path)) return false;
		chdir($path);
		$result = $this->executeCommand("git show " . $commit);
		if ($result !== 0) {
			return $this->returnMessage("error", "Failed to show commit");
		} else {
			foreach ($this->resultArray as $index => $line) {
				$line = str_replace ("\t", "    ", $line);
				$this->resultArray[$index] = htmlentities($line);
			}
			return json_encode(array("status" => "success", "data" => $this->resultArray));
		}
	}
}