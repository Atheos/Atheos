<?php


trait Initialize {

	public function init($path, $type) {
		if (!is_dir($path)) return false;
		chdir($path);

		$result = false;

		if ($type === "repo") {
			$result = $this->execute("git init");
		}

		if ($result) {
			Common::send("success", i18n("git_init_success"));
		} else {
			Common::send("error", i18n("git_init_failed"));
		}
	}

	public function cloneRepo($path, $repoURL, $init_submodules = false) {
		if (!is_dir($path)) {
			Common::send("error", i18n("path_missing"));
		}
		chdir($path);

		$pattern = "/^([A-Za-z0-9]+@|http(|s)\:\/\/)([A-Za-z0-9.]+(:\d+)?)(?::|\/)([\d\/\w.-]+?)(\.git)?$/i";
		if (!preg_match($pattern, $repoURL)) {
			Common::send("error", i18n("git_repoURL_invalid"));
		}

		$command = "git clone $repoURL";

		if ($init_submodules == "true") {
			$command = $command . " --recursive";
		}

		$result = $this->execute($command);

		if ($result) {
			Common::send("success", i18n("git_clone_success"));
		} else {
			Common::send("error", i18n("git_clone_failed"));
		}
	}
}