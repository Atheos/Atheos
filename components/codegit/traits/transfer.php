<?php


trait Transfer {


	public function push($repo, $remote, $branch) {
		$command = "git push $remote $branch";
		$result = $this->execute($command);
		$result["text"] = implode("\n", $result["data"]);

		if ($result["status"]) {
			Common::sendJSON("success", $result);
		} else {
			Common::sendJSON("error", $result);
		}
	}

	public function pull($repo, $remote, $branch) {
		$command = "git push $remote $branch";
		$result = $this->execute($command);
		$result["text"] = implode("\n", $result["data"]);

		if ($result["status"]) {
			Common::sendJSON("success", $result);
		} else {
			Common::sendJSON("error", $result);
		}
	}

	public function fetch($repo, $remote) {
		$command = "git fetch $remote $branch";
		$result = $this->execute($command);
		$result["text"] = implode("\n", $result["data"]);

		if ($result["status"]) {
			Common::sendJSON("success", $result);
		} else {
			Common::sendJSON("error", $result);
		}
		// return $this->parseShellResult($result, "Repository fetched!", "Failed to fetch repo!");
	}

	public function checkUserInfo($command) {
		$username = Common::data("username");
		$password = Common::data("password");
		$passphrase = Common::data("passphrase");

		if ($username) {
			$command = $command . ' -u "' . $username . '"';
		}
		if ($password) {
			$command = $command . ' -p "' . $password . '"';
		}
		if ($passphrase) {
			$command = $command . ' -k "' . $passphrase . '"';
		}

		return $command;
	}
}