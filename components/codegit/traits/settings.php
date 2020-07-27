<?php


trait Settings {

	public function settings($repo, $data = false) {
		$activeUser = Common::data("user", "session");
		$users = Common::readJSON("codegit");
		$settings = false;

		if (isset($users[$activeUser])) {
			$settings = $users[$activeUser];

			if (isset($settings[$repo])) {
				$this->execute("git config user.name " . $settings[$repo]["name"]);
				$this->execute("git config user.email " . $settings[$repo]["email"]);
			} elseif (isset($settings["global"])) {
				$this->execute("git config user.name " . $settings["global"]["name"]);
				$this->execute("git config user.email " . $settings["global"]["email"]);
			}
		}

		if ($data) {
			$settings = is_array($settings) ? $settings : array();

			$type = $data["type"];
			$name = $data["name"];
			$email = $data["email"];

			if (strpos($type, "clear_") > -1) {
				$type = str_replace("clear_", "", $type);
				$type = $type === "local" ? $repo : "global";

				unset($settings[$type]);
				$this->execute("git config --unset user.name");
				$this->execute("git config --unset user.email");
			} else {
				$type = $type === "local" ? $repo : "global";
				if ($data["name"]) $settings[$type]["name"] = $data["name"];
				if ($data["email"]) $settings[$type]["email"] = $data["email"];
			}

			$users[$activeUser] = $settings;

			Common::saveJSON("codegit", $users);
		}

		return $settings;
	}
}