<?php


trait Commit {

	public function add($file) {
		return Common::safe_execute("git add --all -- ?", $file);
	}

	public function commit($message, $files) {
		$confData = file_get_contents(DATA . "/users/" . SESSION("user") . "/codegit.db.json");
		$confData = json_decode($confData, TRUE)[0];

		if (!$confData["name"] || !$confData["email"])
		{
			Common::send(500, i18n("git_error_emailRequired"));
			return;
		}

		$files = explode(",", $files);
		
		foreach ($files as $file) {
			$result = $this->add($file);
			if ($result["code"] !== 0) {
			    Common::send(500, i18n("git_addFailed", $file) . "\n\n" . implode("\n", $result["output"] ?? []));
			}
		}

		$result = Common::safe_execute("git commit --author=\"? <?>\" -m ?", $confData["name"], $confData["email"], $message);
		
		if ($result["code"] === 0) {
			Common::send(200, i18n("git_commit_success"));
		} else {
			Common::send(500, i18n("git_commit_failed") . "\n\n" . implode("\n", $result["output"] ?? []));
		}
	}
	
	public function amend($message, $files) {
		$files = explode(",", $files);

		foreach ($files as $file) {
			$result = $this->add($file);
			if ($result["code"] !== 0) {
			    Common::send(500, i18n("git_addFailed", $file) . "\n\n" . implode("\n", $result["output"] ?? []));
			}
		}

		$confData = file_get_contents(DATA . "/users/" . SESSION("user") . "/codegit.db.json");
		$confData = json_decode($confData, TRUE)[0];

		if ($message!=="") {
    		$result = Common::safe_execute("git commit --amend --no-edit --author=\"? <?>\" -m\"?\"", $confData["name"], $confData["email"], $message);
		} else {
    		$result = Common::safe_execute("git commit --amend --no-edit --author=\"? <?>\"", $confData["name"], $confData["email"]);

		}
		
		if ($result["code"] === 0) {
			Common::send(200, i18n("git_amend_success"));
		} else {
		    Common::send(500, i18n("git_amend_failed") . "\n\n" . implode("\n", $result["output"] ?? []));
		}
	}
}
