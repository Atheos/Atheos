<?php


trait Branches {

	public function getBranches($path) {
		if (!is_dir($path)) return false;
		chdir($path);
		$result = Common::safe_execute("git branch");
		$current = "";

		if ($result["code"] !== 0) return "Error loading branches";

		$output = $result["output"];
		$branches = [];

		// Loop through and remove blank lines, and the asterix
		foreach ($output as $i => $line) {
			$line = trim($line);

			if (empty($line)) continue;

			if (strpos($line, "* ") === 0) {
				$line = substr($line, 2);
				$current = $line;
			}

			$branches[$i] = $line;
		}

		return array("branches" => $branches, "current" => $current);
	}

	public function getCurrentBranch() {
		if (!is_dir($this->repo)) return false;
		chdir($this->repo);
		$result = Common::safe_execute("git rev-parse --abbrev-ref HEAD");

		if ($result["code"] === 0) {
			return $result["output"][0];
		} else {
			return false;
		}
	}
}