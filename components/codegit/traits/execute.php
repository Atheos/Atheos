<?php


trait Execute {

	private function execute($cmd) {
		$cmd = escapeshellcmd($cmd);
		//Allow #
		$cmd = str_replace("\#", "#", $cmd);
		$cmd = str_replace("\(", "(", $cmd);
		$cmd = str_replace("\)", ")", $cmd);
		$result = Common::execute($cmd . ' 2>&1');

		$result = $this->parseReturn($result);
		return $result;
	}

	private function parseReturn($result) {

		if ($result["code"] === 0) {
			// Success
			$result["status"] = "success";
		} elseif ($result["code"] === 128) {
			// Host key error
			$result["status"] = "warning";
		} else {
			// Generic error
			$result["status"] = "error";
		}

		$result["text"] = explode("\n", $result["text"]);
		return $result;
	}
}