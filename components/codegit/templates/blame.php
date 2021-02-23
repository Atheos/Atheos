<?php
$repo = Common::getWorkspacePath($repo);
$files = POST('files');
if ($files) {
	$files = explode(',', $files);
} else {
	$files = array($path);
	echo "<label class=\"title\"><i class=\"fas fa-code-branch\"></i>" . i18n("codegit_blame") . "</label>";
}

$blames = array();
foreach ($files as $i => $file) {
	$blames[] = $CodeGit->loadBlame($repo, $file);
}

echo "<div id=\"codegit_blame\" class=\"content\">";


foreach ($blames as $i => $blame) {

	$element = $files[$i];
	$element = pathinfo($element, PATHINFO_BASENAME);
	echo "<h4 class=\"file-info\">File Name: $element</h4>";
	echo "<ul>";

	$lineNumber = 1;

	if (is_array($blame) && count($blame) > 0) {
		foreach ($blame as $i => $item) {
			// preg_replace("","",$item);
			$item = htmlentities($item);

			$info = explode("\t", $item);


			$hash = $info[0];
			$author = substr($info[1], 1);
			$date = $info[2];

			$lineString = str_replace("$hash\t($author\t$date\t", "", $item);
			preg_match('/^\d+(?=(\)))/', $lineString, $lineNumber);
			$lineNumber = $lineNumber[0];
			$reg = '/^' . $lineNumber . '\)/';
			$lineString = preg_replace('/^\d+\)/', "", $lineString);

			$lineNumber = str_pad($lineNumber, strlen(count($blame)), " ", STR_PAD_LEFT);
			// $lineString = strip_tags($lineString);


			$element = "
<li>
	<span class=\"line\">$lineNumber </span>
	<span class=\"code\">$lineString</span>
	<span class=\"blame\">
		<span class=\"hash\">$hash </span> Author:<span class=\"author\"> $author</span>
		<span class=\"date\"> $date</span>
	</span>
</li>";
			echo $element;

		}
	} else {
		echo "<li class=\"context\">  0<span> No Changes Made</span></li>";
	}
	echo "</ul>";


}
echo "</div>";