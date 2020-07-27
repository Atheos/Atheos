<?php

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

