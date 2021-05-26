<?php


trait Commit {

	public function add($file) {
		return $this->execute("git add --all " . $file);
	}

	public function commit($message, $files) {
		$files = explode(',', $files);

		debug("add");


		foreach ($files as $file) {
			$result = $this->add($file);
			debug($result);
			if (!$result) {
				Common::send("error", i18n("git_addFailed", $file));
			}
		}
		debug("commit");

		$result = $this->execute("git commit -m\"" . $message . "\"");
		if ($result) {
			Common::send("success", i18n("git_commit_success"));
		} else {
			Common::send("success", i18n("git_commit_failed"));
		}
	}
}