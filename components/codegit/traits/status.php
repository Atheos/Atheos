<?php


trait Status {

	public function status($path) {
		if (!is_dir($path)) return false;
		chdir($path);
		$result = $this->executeCommand("git status --branch --porcelain");
		if ($result !== 0) {
			return false;
		}
		return $this->parseGitStatus();
	}

	public function branchStatus($repo) {
		if (!is_dir($repo)) return false;
		chdir($repo);
		$result = $this->execute("git status --branch --porcelain");
		if ($result["code"]) {
			$data = $result["data"];
			preg_match('/(?<=\[).+?(?=\])/', $data[0], $status);
			
			$int = (int)preg_replace("/(ahead|behind)/", "", $status);
			
			if(strpos($status, "ahead") !== false) {
				$status = "Ahead " . $int . ($int > 1 ? " Commits" : " Commit");
			} elseif(strpos($status, "behind")  !== false) {
				$status = "Behind " . $int . ($int > 1 ? " Commits" : " Commit");
			}
		
			$result = array("status" => $status, "changes" => $data);
		} else {
			$result = false;
		}
		return $result;
	}

	public function loadChanges($path) {
		if (!is_dir($path)) return false;
		chdir($path);
		$result = $this->execute("git status --branch --porcelain");
		if ($result["code"]) {
			$result = $this->parseChanges($result["data"]);
		} else {
			$result = "Git Status Failed";
		}
		return $result;
	}

	public function fileStatus($path) {
		if (file_exists($path)) {
			$dirname = dirname($path);
			$filename = basename($path);
			chdir($dirname);

			$result = $this->execute("git diff --numstat " . $filename);
			if ($result["code"]) {
				if (count($result["data"]) > 0) {
					$stats = explode("\t", $result["data"][0]);
					$additions = $stats[0];
					$deletions = $stats[1] ?? 0;

				} else {
					$result = $this->execute("git status --branch --porcelain");

					if ($result["code"] && count($result["data"]) > 0) {
						$status = $this->parseChanges($result["data"]);
						if (in_array($filename, $status['untracked'])) {
							$file = file_get_contents($filename);
							$file = explode("\n", $file);
							$additions = count($file);
							$deletions = 0;
						}
					}



					$additions = 0;
					$deletions = 0;
				}
			}

			$result = array("branch" => $this->getCurrentBranch(), "insertions" => $additions, "deletions" => $deletions);
			return $result;
		} else {
			return $this->returnMessage("error", "File Does Not Exist");
		}
	}
}