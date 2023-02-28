<?php


trait Transfer {


	public function push($remote, $branch) {
		$result = $this->execute("git push $remote $branch");
		if ($result["code"] === 0) {
            Common::send("success", implode("\n", $result["text"]));
		} else {
		    Common::send("error", i18n("git_undo_failed") . "\n\n" . implode("\n", $result["text"] ?? []));
		}
	}

	public function pull($remote, $branch) {
		$result = $this->execute("git pull $remote $branch");
		if ($result["code"] === 0) {
		    Common::send("success", implode("\n", $result["text"]));
		} else {
		    Common::send("error", i18n("git_undo_failed") . "\n\n" . implode("\n", $result["text"] ?? []));
		}
	}

	public function fetch($remote, $branch) {
		$result = $this->execute("git fetch $remote $branch");
		if ($result["code"] === 0) {
		    Common::send("success", implode("\n", $result["text"]));
		} else {
		    Common::send("error", i18n("git_undo_failed") . "\n\n" . implode("\n", $result["text"] ?? []));
		}
	}
}