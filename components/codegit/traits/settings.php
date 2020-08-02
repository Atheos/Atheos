<?php


trait Settings {

	public function settings($repo, $data = false) {
		$db = Common::getDB("codegit");
		$activeUser = Common::data("user", "session");

		$where = array("user" => $activeUser);
		$results = $db->select(where);
		$settings = array();

		if (!empty($results)) {
			foreach ($results as $res) {
				if ($res["path"] === "global") {
					$settings["global"] = $res;
				} elseif ($res["path"] === $repo) {
					$settings["local"] = $res;
				}
			}

			if (isset($settings["local"])) {
				debug($settings);
				$this->execute("git config user.name \"" . $settings["local"]["name"] . "\"");
				$this->execute("git config user.email \"" . $settings["local"]["email"] . "\"");
			} elseif (isset($settings["global"])) {
				$this->execute("git config user.name \"" . $settings["global"]["name"]) . "\"";
				$this->execute("git config user.email \"" . $settings["global"]["email"] . "\"");
			}
		}

		if ($data) {
			$type = $data["type"];
			$name = $data["name"];
			$email = $data["email"];

			if (strpos($type, "clear_") === 0) {
				$type = str_replace("clear_", "", $type);
				$type = $type === "local" ? $repo : "global";

				$where = array("user" => $activeUser, "path" => $type);
				$db->delete($where);
				$this->execute("git config --unset user.name");
				$this->execute("git config --unset user.email");
			} else {
				$type = $type === "local" ? $repo : "global";

				$where = array("user" => $activeUser, "path" => $type);
				$value = array("user" => $activeUser, "path" => $type, "name" => $name, "email" => $email);
				$results = $db->select($where);
				if (empty($results)) {
					$db->insert($value);
				} else {
					$db->update($value, $where);
				}
			}
		}

		return $settings;
	}
}