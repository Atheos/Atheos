<?php


trait Commit {

	public function add($file) {
		return $this->execute("git add --all " . $file);
	}

	public function commit($message, $files) {
		$files = explode(',', $files);

		foreach ($files as $file) {
			$result = $this->add($file);
			if (!$result["status"]) {
				Common::sendJSON("error", i18n("git_addFailed", $file)); die;
			}
		}

		$result = $this->execute("git commit -m\"" . $message . "\"");
		if ($result["status"]) {
			Common::sendJSON("success", i18n("git_commit_success"));
		} else {
			Common::sendJSON("success", i18n("git_commit_failed"));
		}
	}
}