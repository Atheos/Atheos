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
				Common::send("error", i18n("git_addFailed", $file));
			}
		}

		$result = $this->execute("git commit -m\"" . $message . "\"");
		if ($result["status"]) {
			Common::send("success", i18n("git_commit_success"));
		} else {
			Common::send("success", i18n("git_commit_failed"));
		}
	}
}