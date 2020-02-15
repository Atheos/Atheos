<?php
include "libs/breadcrumbs.php";

echo "<ul class=\"breadcrumbs\">";
echo breadcrumbs();
echo "</ul>";

if (file_exists("$request.md")) {
	$markdown = file_get_contents("$request.md");
	echo $Parsedown->text($markdown);
} else {
	$markdown = file_get_contents("docs/docs.md");
	echo $Parsedown->text($markdown);
}
?>