<?php


trait Commit {

	public function add($file) {
		return $this->execute("git add --all " . $file);
	}

	public function commit($message, $files) {
		$files = explode(',', $files);

		foreach ($files as $file) {
			$result = $this->add($file);
			debug($result);
			if (!$result) {
				Common::send("error", i18n("git_addFailed", $file));
			}
		}

		$confData = file_get_contents(DATA . '/' . SESSION('user') . '/codegit.db.json');
		$confData = json_decode($confData, TRUE)[0];

		$result = $this->execute("git commit --author=\"{$confData['name']} <{$confData['email']}>\""
				. " -m\"" . $message . "\"");
		
		if ($result) {
			Common::send("success", i18n("git_commit_success"));
		} else {
			Common::send("success", i18n("git_commit_failed"));
		}
	}
}
