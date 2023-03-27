<?php


trait Commit {

	public function add($file) {
		return $this->execute("git add --all " . $file);
	}

	public function commit($message, $files) {
		$files = explode(",", $files);
		
		foreach ($files as $file) {
			$result = $this->add($file);
			if ($result["code"] !== 0) {
			    Common::send("error", i18n("git_addFailed", $file) . "\n\n" . implode("\n", $result["text"] ?? []));
			}
		}

		$confData = file_get_contents(DATA . "/users/" . SESSION("user") . "/codegit.db.json");
		$confData = json_decode($confData, TRUE)[0];

		$result = $this->execute("git commit --author=\"{$confData["name"]} <{$confData["email"]}>\""
				. " -m\"" . $message . "\"");
		
		if ($result["code"] === 0) {
			Common::send("success", i18n("git_commit_success"));
		} else {
			Common::send("error", i18n("git_commit_failed") . "\n\n" . implode("\n", $result["text"] ?? []));
		}
	}
	
	public function amend($message, $files) {
		$files = explode(",", $files);

		foreach ($files as $file) {
			$result = $this->add($file);
			if ($result["code"] !== 0) {
			    Common::send("error", i18n("git_addFailed", $file) . "\n\n" . implode("\n", $result["text"] ?? []));
			}
		}

		$confData = file_get_contents(DATA . "/users/" . SESSION("user") . "/codegit.db.json");
		$confData = json_decode($confData, TRUE)[0];

		if ($message!=="") {
		    $result = $this->execute("git commit --amend --author=\"{$confData["name"]} <{$confData["email"]}>\"" . " -m\"" . $message . "\"");
		} else {
		    $result = $this->execute("git commit --amend --no-edit --author=\"{$confData["name"]} <{$confData["email"]}>\"");
		}
		
		if ($result["code"] === 0) {
			Common::send("success", i18n("git_amend_success"));
		} else {
		    Common::send("error", i18n("git_amend_failed") . "\n\n" . implode("\n", $result["text"] ?? []));
		}
	}
}
