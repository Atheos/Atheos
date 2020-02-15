<?php

function createSelect($array, $id) {
	if (count($array) > 3) {
		echo "<select id=\"blog_sel_$id\">";
		foreach ($array as $key => $value):
		if (!($value == '.' || $value == '..')) {
			$value = pathinfo($value, PATHINFO_FILENAME);
			echo '<option value="'.$value.'">'.$value.'</option>';
		}
		endforeach;
		echo "</select>";
	}
}
if ($request == 'raw') {
	$type = $_GET['type'];
	$file = $_GET['file'];
	if ($type && $file) {
		if (file_exists("blog/$type/$file.md")) {
			echo $Parsedown->text(file_get_contents("blog/$type/$file.md"));
		} else {
			echo "invalid file";
		}
	} else {
		echo "false params";
	}
} elseif (file_exists("$request.md")) {
	$markdown = file_get_contents("$request.md");
	echo $Parsedown->text($markdown);
} else {
	$disclaimer = file_get_contents('blog/disclaimer.md');
	$overview = scandir('blog/overview', SCANDIR_SORT_DESCENDING);
	$frontend = scandir('blog/frontend', SCANDIR_SORT_DESCENDING);
	$backend = scandir('blog/backend', SCANDIR_SORT_DESCENDING);
	$infrastructure = scandir('blog/infrastructure', SCANDIR_SORT_DESCENDING);
	$misc = scandir('blog/misc', SCANDIR_SORT_DESCENDING);

	?>
	<h1>Developement Blog</h1>
	<?php echo $Parsedown->text($disclaimer); ?>

	<h2>Overview</h2>
	<?php createSelect($overview, 'overview'); ?>
	<hr />
	<div id="blog_p_overview">
		<?php echo $Parsedown->text(file_get_contents("blog/overview/$overview[0]")); ?>
	</div>

	<h2>FrontEnd</h2>
	<?php createSelect($frontend, 'frontend'); ?>

	<hr />
	<div id="blog_p_frontend">
		<?php echo $Parsedown->text(file_get_contents("blog/frontend/$frontend[0]")); ?>
	</div>

	<h2>BackEnd</h2>
	<?php createSelect($backend, 'backend'); ?>

	<hr />
	<div id="blog_p_backend">

		<?php echo $Parsedown->text(file_get_contents("blog/backend/$backend[0]")); ?>
	</div>

	<h2>Infrastructure</h2>
	<?php createSelect($infrastructure, 'infrastructure'); ?>

	<hr />
	<div id="blog_p_infrastructure">

		<?php echo $Parsedown->text(file_get_contents("blog/infrastructure/$infrastructure[0]")); ?>
	</div>

	<h2>Misc</h2>
	<?php createSelect($misc, 'misc'); ?>

	<hr />
	<div id="blog_p_misc">
		<?php echo $Parsedown->text(file_get_contents("blog/misc/$misc[0]")); ?>
	</div>


	<?php
}
?>