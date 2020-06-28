<?php


trait Initialize {

	public function initRepo($path) {
		if (!is_dir($path)) return false;
		chdir($path);
		$result = $this->executeCommand("git init");
		if ($result === 0) {
			return true;
		} else {
			return false;
		}

		// $result = $CodeGit->init($repo);
		// if ($result === false) {
		// 	Common::sendJSON("error", "Failed to initialize repo.");
		// } else {
		// 	echo '{"status":"success","message":"Initialized empty Git repository!"}';
		// }
	}
}