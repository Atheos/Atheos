<?php


trait Transfer {


	public function push($remote, $branch) {
		$result = $this->execute("git push $remote $branch");
		Common::send($result);
	}

	public function pull($remote, $branch) {
		$result = $this->execute("git pull $remote $branch");
		Common::send($result);
	}

	public function fetch($remote, $branch) {
		$result = $this->execute("git fetch $remote $branch");
		Common::send($result);
		// Common::send("success", ["text" => implode("\n", $result)]);
	}
}