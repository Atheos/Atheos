<?php


trait Remotes {

	public function getRemotes() {
		$result = Common::safe_execute("git remote -v");
		if ($result["code"] === 0) {
			return $result["output"];
		} else {
			return "Error loading remotes";
		}
	}

	public function addRemote($name, $url) {
		$result = Common::safe_execute("git remote add -- ? ?", $name, $url);
		if ($result["code"] === 0) {
			return $result["output"];
		} else {
			return "Error adding remotes";
		}
	}
}