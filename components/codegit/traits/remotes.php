<?php


trait Remotes {

	public function getRemotes() {
		$result = $this->execute("git remote -v");
		return $result["status"] ? $result["data"] : "Error loading remotes";
	}

	public function addRemote($name, $url) {
		$result = $this->execute("git remote add $name $url");
		return $result["status"] ? $result["data"] : "Error loading remotes";
	}
}