<?php


trait Helpers {

	//////////////////////////////////////////////////////////////////////////80
	// Check If WIN based system
	//////////////////////////////////////////////////////////////////////////80
	public static function isWINOS() {
		return (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN');
	}

	//////////////////////////////////////////////////////////////////////////80
	// Check Function Availability
	//////////////////////////////////////////////////////////////////////////80
	public static function isAvailable($func) {
		if (ini_get('safe_mode')) return false;
		$disabled = ini_get('disable_functions');
		if ($disabled) {
			$disabled = explode(',', $disabled);
			$disabled = array_map('trim', $disabled);
			return !in_array($func, $disabled);
		}
		return true;
	}

	function rDelete($target) {
		// Unnecessary, but rather be safe that sorry.
		if ($target === "." || $target === "..") {
			return;
		}
		if (is_dir($target)) {
			$files = glob($target . "{*,.[!.]*,..?*}", GLOB_BRACE|GLOB_MARK); //GLOB_MARK adds a slash to directories returned

			foreach ($files as $file) {
				Common::rDelete($file);
			}
			if (file_exists($target)) {
				rmdir($target);
			}
		} elseif (is_file($target)) {
			unlink($target);
		}
	}

	function compareVersions($v1, $v2) {
		// Src: https://helloacm.com/the-javascript-function-to-compare-version-number-strings/
		if (!is_string($v1) || !is_string($v2)) {
			return false;
		}

		$v1 = explode(".", $v1);
		$v2 = explode(".", $v2);

		$k = min(count($v1), count($v2));

		for ($i = 0; $i < $k; $i++) {
			$v1[$i] = (int)$v1[$i];
			$v2[$i] = (int)$v1[$i];
			if ($v1[$i] > $v2[$i]) {
				return 1;
			}
			if ($v1[$i] < $v2[$i]) {
				return -1;
			}
		}
		return count($v1) === count($v2) ? 0 : (count($v1) < count($v2) ? -1 : 1);
	}

}