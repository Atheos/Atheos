<?php


class HubUpdater {

	protected $include = array(
		"*/README.md",
		"components",
		"favicons",
		"fonts",
		"lib",
		"modules",
		"public/class.sourcesmanager.php",
		"themes/atheos",
		"traits",

		"CODE_OF_CONDUCT.md",
		"common.php",
		"controller.php",
		"dialog.php",
		"index.php",
		"LICENSE.md",
		"README.md",
		"SECURITY.md"
	);

	protected $url = null;
	protected $title = null;

	protected $cache = DATA . "/update";
	protected $backup = DATA . "/update/backup.zip";
	protected $latest = DATA . "/update/latest.zip";

	public function __construct($url, $title) {
		// ini_set("user_agent", "Atheos");
		$this->url = $url;
		$this->title = $title;
	}

	public function update() {
		// MAKE A BACKUP ZIP, NAMED WITH CURRENT VERSION
		// DELETE OLD ZIP FILE CONTAINING PRIOR RELEASE
		// DOWNLOAD NEW RELEASE ZIP
		// UNZIP NEW RELEASE INTO CACHE

		$result = $this->clear();
		if ($result !== "success") return $result;

		$result = $this->download();
		if ($result !== "success") return $result;

		$result = $this->extract();
		if ($result !== "success") return $result;

		return "success";
	}

	protected function clear() {
		if (file_exists($this->backup)) unlink($this->backup);
		if (file_exists($this->latest)) unlink($this->latest);
		return "success";
	}

	protected function backup() {
		Common::zip(BASE_PATH, $this->backup);
		return "success";
	}

	protected function download() {
		$file = @fopen($this->repo, 'r');
		if ($file === false) return "exception: bad download";

		file_put_contents($this->latest, $file);
		fclose($file);
		return "success";
	}

	protected function extract() {
		$zip = new ZipArchive();
		if ($zip->open($this->latest) !== true) return "exception: unable open";

		$cutLength = strlen($zip->getNameIndex(0));
		for ($i = 1; $i < $zip->numFiles; $i++) {
			$name = $this->options['save'] . substr($zip->getNameIndex($i), $cutLength);

			if ($this->shouldBeCopied($name)) {
				$stat = $zip->statIndex($i);
				if ($stat["crc"] == 0) {
					//is dir
					if (!file_exists($name)) {
						mkdir($name);
					}
					continue;
				}
				copy("zip://" . $path . "#" . $zip->getNameIndex($i), $name);
			}
		}
		return $zip->close();
	}

	protected function shouldBeCopied($file) {
		static $updateIgnore = array();
		if (empty($updateIgnore) && file_exists($this->options['updateignore'])) {
			$updateIgnore = file($this->options['updateignore']);
			foreach ($updateIgnore as &$ignore) {
				$ignore = $this->options['save'] . trim($ignore);
			}
		}
		foreach ($updateIgnore as $ignore) {
			if (substr($file, 0, strlen($ignore)) == $ignore) {
				return false;
			}
		}
		return true;
	}


}