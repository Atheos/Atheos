<?php


trait Execute {

	private function execute($cmd) {
		$cmd = escapeshellcmd($cmd);
		//Allow #
		$cmd = str_replace("\#", "#", $cmd);
		$cmd = str_replace("\(", "(", $cmd);
		$cmd = str_replace("\)", ")", $cmd);
		$result = Common::execute($cmd . ' 2>&1');
		$code = $result["code"];
		
		if ($code === 0) {
			return explode("\n", $result["text"]);
		} else {
			Common::log('Git error for ' . $cmd . ' : ' . print_r($result,true), "git");
			return false;
		}
	}

		debug($cmd);
		debug($result);

		$result = $this->parseReturn($result);
		
		// TODO: Result Text needs to be either imploded or exploded into an array

		// Update files to match new return:
		//?	Branches
		//	Commit
		//	Execute
		//	History
		//	Initialize
		//	Remotes
		//	Settings
		//?	Status
		//?	Transfer

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