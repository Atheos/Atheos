<?php


trait Initialize {

	public function init($path, $type) {
		if (!is_dir($path)) return false;
		chdir($path);

		$result = false;

		if ($type === "repo") {
			$result = $this->execute("git init");
		}

		if ($result["code"] === 0) {
			Common::send(200, i18n("git_init_success"));
		} else {
		    Common::send(500, i18n("git_init_failed") . "\n\n" . implode("\n", $result["text"] ?? []));
		}
	}

	public function cloneRepo($path, $repoURL, $init_submodules = false) {
		if (!is_dir($path)) {
			Common::send(418, i18n("path_missing"));
		}
		chdir($path);

		$pattern = "/^([A-Za-z0-9]+@|http(|s)\:\/\/)([A-Za-z0-9.]+(:\d+)?)(?::|\/)([\d\/\w.-]+?)(\.git)?$/i";
		if (!preg_match($pattern, $repoURL)) {
			Common::send(418, i18n("git_repoURL_invalid"));
		}

		$command = "git clone $repoURL";

		if ($init_submodules == "true") {
			$command = $command . " --recursive";
		}

		$result = $this->execute($command);

		if ($result["code"] === 0) {
			Common::send(200, i18n("git_clone_success"));
		} else {
		    Common::send(500, i18n("git_clone_failed") . "\n\n" . implode("\n", $result["text"] ?? []));
		}
	}
}