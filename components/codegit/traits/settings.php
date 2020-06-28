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

	public function getSettings($path) {
		$activeUser = Common::data("user", "session");
		$settings = Common::readJSON("git.$activeUser", "config");

		if (empty($settings)) {
			$settings['username'] = Common::data("user", "session");
			$settings['email'] = "";
		}
		if (isset($settings[$path])) {
			foreach ($settings[$path] as $i => $item) {
				$settings['local_' . $i] = $item;
			}
		}

		return $settings;
	}

	public function setSettings($update, $path) {
		$activeUser = Common::data("user", "session");
		$settings = Common::readJSON("git.$activeUser", "config");

		foreach ($update as $i => $item) {
			if (strlen($item) == 0) {
				unset($update[$i]);
				unset($settings[$i]);

				if (strpos($i, "local_") !== false) {
					unset($settings[$path]);
				}
				continue;
			}

			if (strpos($i, "local_") !== false) {
				if (!isset($settings[$path])) {
					$settings[$path] = array();
				}
				$index = str_replace("local_", "", $i);
				$settings[$path][$index] = $item;
				unset($settings[$i]);
				unset($update[$i]);
			}

			if (isset($update[$i])) {
				$settings[$i] = $update[$i];
			}
		}

		Common::saveJSON("git.$activeUser", $settings, "config");
	}
}