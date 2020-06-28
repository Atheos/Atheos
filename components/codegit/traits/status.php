<?php


trait Status {

	public function repoStatus() {
		$result = $this->execute("git status --branch --porcelain");

		if (!$result) {
			Common::sendJSON("error", i18n("codegit_error_statusFail")); die;
		}

		$result = $this->parseChanges($result);
		$status = "Unknown";

		if (!empty($result["added"]) ||
			!empty($result["deleted"]) ||
			!empty($result["modified"]) ||
			!empty($result["renamed"])) {
			$status = 'Uncommitted';
		} else if (!empty($result["untracked"])) {
			$status = 'Untracked';
		} else {
			$status = 'Committed';
		}

		Common::sendJSON("success", $status);
	}

	public function fileStatus($path) {
		if (file_exists($path)) {
			$dirname = dirname($path);
			$filename = basename($path);
			chdir($dirname);

			$result = $this->execute("git diff --numstat " . $filename);
			
			if (!$result) {
				Common::sendJSON("error", i18n("codegit_error_statusFail")); die;
			}
			
			if (count($result) > 0) {
				$stats = explode("\t", $result[0]);
				$additions = $stats[0];
				$deletions = $stats[1] ?? 0;

			} else {
				$result = $this->execute("git status --branch --porcelain");

				if ($result["code"] && count($result) > 0) {
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
			$result = array("branch" => $this->getCurrentBranch(), "insertions" => $additions, "deletions" => $deletions);
			Common::sendJSON("success", $result);



		} else {
			Common::sendJSON("error", i18n("path_missing"));
		}
	}

	public function branchStatus($repo) {
		$result = $this->execute("git status --branch --porcelain");
		if ($result) {
			preg_match('/(?<=\[).+?(?=\])/', $result[0], $status);

			if (!is_string($status)) return false;

			$int = (int)preg_replace("/(ahead|behind)/", "", $status);
			if (strpos($status, "ahead") !== false) {
				$status = "Ahead " . $int . ($int > 1 ? " Commits" : " Commit");
			} elseif (strpos($status, "behind") !== false) {
				$status = "Behind " . $int . ($int > 1 ? " Commits" : " Commit");
			}

			$result = array("status" => $status, "changes" => $data);
			return $result;
		}
		return false;
	}

	public function loadChanges($repo) {
		$result = $this->execute("git status --branch --porcelain");
		if ($result) {
			$result = $this->parseChanges($result);
		} else {
			$result = i18n("codegit_error_statusFail");
		}
		return $result;
	}
}