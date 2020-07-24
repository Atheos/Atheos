<?php

class PicoCache extends AbstractPicoPlugin {

	const API_VERSION = 3;

	private $cacheDir = 'config/cache/';
	private $cacheTime = 604800; // 60*60*24*7, seven days
	private $doCache = false;
	private $cacheFileName;

	public function onRequestUrl(&$url) {
		//replace any character except numbers and digits with a '-' to form valid file names
		$this->cacheFileName = $this->cacheDir . preg_replace('/[^A-Za-z0-9_\-]/', '_', $url) . '.html';

		//if a cached file exists and the cacheTime is not expired, load the file and exit
		if ($this->doCache && file_exists($this->cacheFileName) && (time() - filemtime($this->cacheFileName)) < $this->cacheTime) {
			header("Expires: " . gmdate("D, d M Y H:i:s", $this->cacheTime + filemtime($this->cacheFileName)) . " GMT");
			readfile($this->cacheFileName);
			die();
		}
	}

	public function on404ContentLoading() {
		//don't cache error pages. This prevents filling up the cache with non existent pages
		$this->doCache = false;
	}

	public function onMetaParsed(array &$meta) {

		if (isset($meta["Cache"]) && $meta["Cache"] === false) {
			$this->doCache = false;
		}
	}

	public function onPageRendered(&$output) {
		if ($this->doCache) {
			if (!is_dir($this->cacheDir)) {
				mkdir($this->cacheDir, 0755, true);
			}
			file_put_contents($this->cacheFileName, $output);
		}
	}

}