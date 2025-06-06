<?php


trait Settings {

	public function settings($repo, $data = false) {
		$db = Common::getObjStore("codegit", "users/" . $this->activeUser);
		$activeUser = SESSION("user");

		$results = $db->select("*");
		$settings = array();

		if (!empty($results)) {
			foreach ($results as $res) {
				if ($res["path"] === "global") {
					$settings["global"] = $res;
				} elseif ($res["path"] === $repo) {
					$settings["local"] = $res;
				}
			}

			// FIXME: could be a race between different users
			if (isset($settings["local"])) {
				Common::safe_execute("git config user.name '?'", $settings["local"]["name"]);
				Common::safe_execute("git config user.email '?'", $settings["local"]["email"]);
			} elseif (isset($settings["global"])) {
				Common::safe_execute("git config user.name '?'", $settings["global"]["name"]);
				Common::safe_execute("git config user.email '?'", $settings["global"]["email"]);
			}
		}

		if ($data) {
			$type = $data["type"];
			$name = isset($data["name"]) ? $data["name"] : false;
			$email = isset($data["email"]) ? $data["email"] : false;

			if (strpos($type, "clear_") === 0) {
				$type = str_replace("clear_", "", $type);
				$type = $type === "local" ? $repo : "global";

				$where = array(["path", "==", $type]);
				$db->delete($where);
				
				Common::safe_execute("git config --unset user.name");
				Common::safe_execute("git config --unset user.email");
			} else {
				$type = $type === "local" ? $repo : "global";

				$where = array(["path", "==", $type]);
				$value = array("user" => $activeUser, "path" => $type);

				if ($name) $value["name"] = $name;
				if ($email) $value["email"] = $email;

				$db->update($where, $value, true);
			}
		}

		return $settings;
	}
}