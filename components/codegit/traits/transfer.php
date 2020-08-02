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
		$command = "git pull $remote $branch";
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
	}
}