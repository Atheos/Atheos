<?php


trait Transfer {


	public function push($remote, $branch) {
		$result = $this->execute("git push $remote $branch");

		if ($result) {
			Common::send("success", ["text" => implode("\n", $result)]);
		} else {
			Common::send("error", $result);
		}
	}

	public function pull($remote, $branch) {
		$result = $this->execute("git pull $remote $branch");

		if ($result) {
			Common::send("success", ["text" => implode("\n", $result)]);
		} else {
			Common::send("error", $result);
		}
	}

	public function fetch($remote, $branch) {
		$result = $this->execute("git fetch $remote $branch");

		if ($result) {
			Common::send("success", ["text" => implode("\n", $result)]);
		} else {
			Common::send("error", $result);
		}
	}
}
