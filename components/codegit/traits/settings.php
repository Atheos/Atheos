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
			
			debug($data);

			if (strpos($type, "clear_") > -1) {
				$type = str_replace("clear_", "", $type);
				
				debug("Repo: $repo");

				$type = $type === "local" ? $repo : "global";

				debug("Type: $type");
				
				unset($settings[$type]);
				$this->execute("git config --unset user.name");
				$this->execute("git config --unset user.email");
			} else {
				$type = $type === "local" ? $repo : "global";
				if ($data["name"]) $settings[$type]["name"] = $data["name"];
				if ($data["email"]) $settings[$type]["email"] = $data["email"];
			}
			
			debug($settings);

			$users[$activeUser] = $settings;

			Common::saveJSON("codegit", $users);
		}

		return $settings;
	}

	public function settingsConfig($repo, $data = false) {
		$activeUser = Common::data("user", "session");
		$users = Common::readJSON('users');

		$settings = array(
			"local" => array(
				"name" => $this->execute("git config user.name"),
				"email" => $this->execute("git config user.email")
			),
			"global" => array(
				"name" => $this->execute("git config --global user.name"),
				"email" => $this->execute("git config  --global user.email")
			)
		);

		foreach ($settings as $scope => $space) {
			foreach ($space as $type => $response) {
				if ($response["status"]) {
					$settings[$scope][$type] = $response["data"];
				} else {
					$settings[$scope][$type] = false;
				}
			}
		}


		if ($data) {
			$cmd = "git config";
			if ($data["type"] === "global") {
				if ($data && false) {
					$settings["name"] = $data["name"] ?: $settings["name"];
					$settings["email"] = $data["email"] ?: $settings["email"];
					Common::saveJSON("git-$activeUser", $settings, "config");
				}
			} else {
				if ($data["name"]) debug($this->execute("$cmd user.name '" .$data["name"] . "'"));
				if ($data["email"]) debug($this->execute("$cmd user.email '" .$data["email"] . "'"));
			}
			debug("CMD:$cmd");
		}

		return $settings;





	}
}