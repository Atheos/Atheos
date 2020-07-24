<!DOCTYPE html>
<html lang="en">

<!-- Copyright (C) 2020-Present  Liam Siira <Liam@Siira.us>	-->
<!-- This file is part of https://www.siira.us				-->
<!-- This code can not be copied and/or distributed			-->
<!-- without the express permission of Liam Siira			-->

<head>
	<title>Lumin</title>
	<meta name="description" content="Echo - A concentrated (ES6) library for Ajax requests.">

	<!-- Common Head -->
	<?php include '/var/www/html/util/assets/php/head.php'; ?>

	<!-- Favicon -->
	<?php include '/var/www/html/util/assets/php/favicon.php'; ?>

	<style>
		pre {
			padding: 16px;
			border-top: 1px solid #eee;
			line-height: 1.1;
			font-size: 14px;
		}
	</style>
	<script src="lumin.js"></script>
</head>
<body>
	<canvas id="synthetic"></canvas>
	<header class="fade3">
		<?php include '/var/www/html/util/assets/php/logo.php'; ?>
		<brand>
			<h1>Lumin</h1>
			<span>Lightweight tokenizer and syntax highlighter.</span>
		</brand>
	</header>
	<main class="fade3">
<pre class="lumin">
//////////////////////////////////////////////////////////////////////
// JS: Shorthand for sending to console
//////////////////////////////////////////////////////////////////////
window.log = Function.prototype.bind.call(console.log, console);
window.trace = Function.prototype.bind.call(console.trace, console);
</pre>

<pre class="lumin">
//////////////////////////////////////////////////////////////////////
// JS: Extend / Combine JS objects without modifying the source object
//////////////////////////////////////////////////////////////////////
global.extend = function(obj, src) {
	var temp = JSON.parse(JSON.stringify(obj));
	for (var key in src) {
		if (src.hasOwnProperty(key)) {
			temp[key] = src[key];
		}
	}
	return temp;
};
</pre>
<pre class="lumin">
//////////////////////////////////////////////////////////////////////
// CSS: Class File-Info
//////////////////////////////////////////////////////////////////////		
.file-info {
	background-color: blue;
	font-size: 16px;
	font-weight: bold;
	padding: 5px;
}
</pre>

<pre class="lumin">
//////////////////////////////////////////////////////////////////////
// PHP: Clean File Path
//////////////////////////////////////////////////////////////////////		
function cleanPath($path) {
	// prevent Poison Null Byte injections
	$path = str_replace(chr(0), '', $path);

	// prevent escaping out of the workspace
	while (strpos($path, '../') !== false) {
		$path = str_replace('../', '', $path);
	}

	return $path;
}
</pre>

<pre class="lumin">
//////////////////////////////////////////////////////////////////////
// PHP: Compare Version Strings
//////////////////////////////////////////////////////////////////////	
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
		if ($v1[i] > $v2[i]) {
			return 1;
		}
		if ($v1[i] < $v2[i]) {
			return -1;
		}
	}
	return count($v1) === count($v2) ? 0 : (count($v1) < count($v2) ? -1 : 1);
}
</pre>


	</main>

	<footer class="fade3">
		<small>&copy; Copyright 2020, Liam Siira</small>
		<small>Source: <a href="https://larsjung.de/lolight/">Lars Jung</a></small>
	</footer>

	<shadow class="fade6"></shadow>

	<script type="text/javascript" src="cdn/core.php?js=mn|sc"></script>
	<script type="text/javascript" src="secure.js"></script>

</body>

</html>