<?php


trait Transfer {


	public function push($remote, $branch) {
		$result = $this->execute("git push $remote $branch");
		if ($result["code"] === 0) {
            Common::send(200, implode("\n", $result["text"]));
		} else {
		    Common::send(500, i18n("git_push_failed") . "\n\n" . implode("\n", $result["text"] ?? []));
		}
	}

	public function pull($remote, $branch) {
		$result = $this->execute("git pull $remote $branch");
		if ($result["code"] === 0) {
		    Common::send(200, implode("\n", $result["text"]));
		} else {
		    Common::send(500, i18n("git_pull_failed") . "\n\n" . implode("\n", $result["text"] ?? []));
		}
	}

	public function fetch($remote, $branch) {
		$result = $this->execute("git fetch $remote $branch");
		if ($result["code"] === 0) {
		    Common::send(200, implode("\n", $result["text"]));
		} else {
		    Common::send(500, i18n("git_fetch_failed") . "\n\n" . implode("\n", $result["text"] ?? []));
		}
	}
}