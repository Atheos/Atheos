<?php


trait Remotes {

	public function getRemotes() {
		$result = $this->execute("git remote -v");
		if ($result["code"] === 0) {
			return $result["text"];
		} else {
			return "Error loading remotes";
		}
	}

	public function addRemote($name, $url) {
		$result = $this->execute("git remote add $name $url");
		if ($result["code"] === 0) {
			return $result["text"];
		} else {
			return "Error adding remotes";
		}
	}
}