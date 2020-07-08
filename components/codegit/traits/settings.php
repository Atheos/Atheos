<?php


trait Settings {

	private function setGitSettings($repo) {
		$settings = $this->settings($repo);
		
		$name = isset($settings["name"]) ? $settings["name"] : false;
		$email = isset($settings["email"]) ? $settings["email"] : false;

		if ($name) {
			$result = $this->execute('git config user.name "' . $name . '"');
			if (!$result["code"]) {
				return false;
			}
		}
		if ($email) {
			$result = $this->execute('git config user.email ' . $email);
			if (!$result["code"]) {
				return false;
			}
		}
		return true;
	}

	public function settings($repo, $data = false) {
		$activeUser = Common::data("user", "session");
		$users = Common::readJSON('users');

		$settings = false;

		if(isset($users[$activeUser]) && isset($users[$activeUser]["git"])) {
			$settings = $users[$activeUser]["git"];
		}
		

		// if (!$settings) {
		// 	$settings = array(
		// 		"username" => $activeUser,
		// 		"email" => false
		// 	);
		// }

		if ($data && false) {
			$settings["name"] = $data["name"] ?: $settings["name"];
			$settings["email"] = $data["email"] ?: $settings["email"];
			Common::saveJSON("git-$activeUser", $settings, "config");
		}

		return $settings;
	}
}