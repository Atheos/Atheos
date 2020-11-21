<?php


trait Transfer {


	public function push($remote, $branch) {
		$command = "git push $remote $branch";
		$result = $this->execute($command);
		$result["text"] = implode("\n", $result["data"]);

		if ($result["status"]) {
			Common::send("success", $result);
		} else {
			Common::send("error", $result);
		}
	}

	public function pull($remote, $branch) {
		$command = "git pull $remote $branch";
		$result = $this->execute($command);
		$result["text"] = implode("\n", $result["data"]);

		if ($result["status"]) {
			Common::send("success", $result);
		} else {
			Common::send("error", $result);
		}
	}

	public function fetch($remote, $branch) {
		$command = "git fetch $remote $branch";
		$result = $this->execute($command);
		$result["text"] = implode("\n", $result["data"]);

		if ($result["status"]) {
			Common::send("success", $result);
		} else {
			Common::send("error", $result);
		}
	}
}
