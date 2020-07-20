<?php


trait Settings {

	public function settings($repo, $data = false) {
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
			if($data["type"] === "global") $cmd .= " --global";
			if($data["name"]) debug($this->execute("$cmd user.name '" .$data["name"] . "'"));
			if($data["email"]) debug($this->execute("$cmd user.email '" .$data["email"] . "'"));
			debug("CMD: $cmd");
		}

		return $settings;


		// $activeUser = Common::data("user", "session");
		// $users = Common::readJSON('users');

		// $settings = false;

		// if (isset($users[$activeUser]) && isset($users[$activeUser]["git"])) {
		// 	$settings = $users[$activeUser]["git"];
		// }


		// // if (!$settings) {
		// // 	$settings = array(
		// // 		"username" => $activeUser,
		// // 		"email" => false
		// // 	);
		// // }

		// if ($data && false) {
		// 	$settings["name"] = $data["name"] ?: $settings["name"];
		// 	$settings["email"] = $data["email"] ?: $settings["email"];
		// 	Common::saveJSON("git-$activeUser", $settings, "config");
		// }

		// return $settings;
	}
}