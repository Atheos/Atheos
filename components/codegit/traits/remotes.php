<?php


trait Remotes {

	public function getRemotes($path) {
		if (!is_dir($path)) return false;
		chdir($path);
		$result = $this->execute("git remote -v");

		if (!$result["code"]) {
			return "Error loading remotes";
		} else {
			return $result["data"];
		}
	}
}