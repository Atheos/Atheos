<?php
$repo = Common::getWorkspacePath($repo);
$files = POST('files');

if ($files) {
	$files = explode(',', $files);
} else {
	$files = array($path);
	echo "<label class=\"title\"><i class=\"fas fa-code-branch\"></i>" . i18n("codegit_diff") . "</label>";
}

$diffs = array();
foreach ($files as $i => $file) {
	$diffs[] = $CodeGit->loadDiff($repo, $file);
}

echo "<div id=\"codegit_diff\" class=\"content\">";

foreach ($diffs as $i => $diff) {

	$element = $files[$i];
	$element = pathinfo($element, PATHINFO_BASENAME);
	echo "<h4 class=\"file-info\">File Name: $element</h4>";
	echo "<ul>";

	$lineNumber = 1;

	if (is_array($diff) && count($diff) > 0) {

		foreach ($diff as $i => $item) {
			if ($i === 0) continue;

			$item = preg_replace("/[ ]{2}/", "&nbsp;", $item);
			$lineString = str_pad($lineNumber, strlen(count($diff)), " ", STR_PAD_LEFT);

			$element = '';
			if (trim($item) === "" || strpos($item, '+++') === 0 || strpos($item, '---') === 0 || preg_match("/^index [0-9a-z]{7}..[0-9a-z]{7}/", $item) || preg_match("/^(new||deleted) file mode [0-9]{6}/", $item)) {
				continue;

			} else if (preg_match("/^diff --git a\/.+ b\/.+/", $item)) {} else if (preg_match("/^@@ -[0-9,]+ \+[0-9,]+ @@/", $item)) {

				preg_match("/(?=([\+\-]{0,1}))[\d]+(?=[,])/", $item, $lineNumber);
				$lineNumber = $lineNumber[0];
				$element = "<li class=\"wrapper\">$item </li>";

			} else if (strpos($item, '+') === 0 && strpos($item, '+++') !== 0) {
				$element = "<li class=\"addition\">$lineString<span> $item</span></li>";
				if (array_key_exists($i - 1, $diff) && substr($item, 1, -1) !== substr($diff[$i-1], 1, -1)) {
					$lineNumber++;
				}

			} else if (strpos($item, '-') === 0 && strpos($item, '---') !== 0) {
				$element = "<li class=\"deletion\">$lineString<span> $item</span></li>";
				if (array_key_exists($i - 1, $diff) && substr($item, 1, -1) !== substr($diff[$i-1], 1, -1)) {
					$lineNumber++;
				}

			} else {
				$element = "<li class=\"context\">$lineString<span> $item</span></li>";
				$lineNumber++;
			}

			echo $element;

		}
	} else {
		echo "<li class=\"context\">  0<span> No Changes Made</span></li>";
	}
	echo "</ul>";


}
echo "</div>";
?>