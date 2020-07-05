<?php


trait Settings {

	private function setGitSettings($path) {
		$settings = $this->getSettings($path);

		$username = $settings['username'];
		if (isset($settings['local_username'])) {
			$username = $settings['local_username'];
		}

		$email = $settings['email'];
		if (isset($settings['local_email'])) {
			$email = $settings['local_email'];
		}

		if (!empty($username)) {
			$result = $this->executeCommand('git config user.name "' . $username . '"');
			if ($result !== 0) {
				return false;
			}
		}
		if (!empty($email)) {
			$result = $this->executeCommand('git config user.email ' . $email);
			if ($result !== 0) {
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
		}

		// if (isset($settings[$path])) {
		// 	foreach ($settings[$path] as $i => $item) {
		// 		$settings['local_' . $i] = $item;
		// 	}
		// }

		Common::saveJSON("git-$activeUser", $settings, "config");

		return $settings;
	}
}