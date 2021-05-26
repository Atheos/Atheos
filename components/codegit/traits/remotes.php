<?php


trait Remotes {

	public function getRemotes() {
		$result = $this->execute("git remote -v");
		return $result ? $result : "Error loading remotes";
	}

	public function addRemote($name, $url) {
		$result = $this->execute("git remote add $name $url");
		return $result ? $result : "Error loading remotes";
	}
}