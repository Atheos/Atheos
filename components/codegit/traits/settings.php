<?php


trait Settings {

	private function setGitSettings($repo) {
		$settings = $this->settings($repo);
		
		return true;

		$name = isset($settings['name']) ? $settings['name'] : false;
		$name = isset($settings['email']) ? $settings['email'] : false;

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
		$settings = Common::readJSON("git-$activeUser", "config");

		if (!$settings) {
			$settings = array(
				"username" => $activeUser,
				"email" => false
			);
		}

		if ($data) {
			$settings["username"] = $data["username"] ?: $settings["username"];
			$settings["email"] = $data["email"] ?: $settings["email"];
			Common::saveJSON("git-$activeUser", $settings, "config");
		}

		return $settings;
	}
}