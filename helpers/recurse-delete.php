<?php

function rDelete($target) {
	// Unnecessary, but rather be safe that sorry.
	if ($target === "." || $target === "..") {
		return;
	}
	if (is_dir($target)) {
		$files = glob($target . "{*,.[!.]*,..?*}", GLOB_BRACE|GLOB_MARK); //GLOB_MARK adds a slash to directories returned

		foreach ($files as $file) {
			rDelete($file);
		}
		if (file_exists($target)) {
			rmdir($target);
		}
	} elseif (is_file($target)) {
		unlink($target);
	}
}


// function rrmdir($path) {
// 	return is_file($path)?
// 	@unlink($path):
// 	@array_map('rrmdir', glob($path.'/*')) == @rmdir($path);
// }