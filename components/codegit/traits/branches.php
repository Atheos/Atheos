<?php


trait Branches {

	public function getBranches($path) {
		if (!is_dir($path)) return false;
		chdir($path);
		$result = $this->execute("git branch");
		$current = "";
		
		foreach ($result["data"] as $i => $line) {
			$array[$i] = trim($line);
			if (strpos($line, "* ") === 0) {
				$current = substr($line, 2);
				$array[$i] = $current;
			}
		}
		
		return array("branches" => $array, "current" => $current);
	}

	public function getCurrentBranch() {
		if (!is_dir($this->repo)) return false;
		chdir($this->repo);
		$result = $this->execute("git rev-parse --abbrev-ref HEAD");
		if ($result["code"]) {
			return $result["data"][0];
		}
		return false;
	}
}