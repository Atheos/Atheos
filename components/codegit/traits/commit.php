<?php


trait Commit {

	public function add($path, $file) {
		$path = Common::getWorkspacePath($path);
		if (!is_dir($path)) return false;
		$cwd = getcwd();
		chdir($path);
		$result = $this->executeCommand("git add --all " . $file);
		chdir($cwd);
		if ($result === 0) {
			return true;
		} else {
			return false;
		}
	}

	public function commit($path, $msg) {
		$path = Common::getWorkspacePath($path);
		if (!is_dir($path)) return false;
		chdir($path);
		if ($this->setGitSettings($path)) {
			$result = $this->executeCommand("git commit -m\"" . $msg . "\"");
			if ($result === 0) {
				return true;
			} else {
				return false;
			}
			// return $this->parseShellResult($result, "Changes commited", "Failed to commit changes!");
		}
		return $this->parseShellResult(-1, null, "Failed to set settings!");
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