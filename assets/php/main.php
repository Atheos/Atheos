<main>
	<?php include "assets/php/dropdown.php"; ?>
	<section id="content">
		<?php

		if (explode('/', $request)[0] == 'blog') {
			include "blog.php";
		} elseif (explode('/', $request)[0] == 'docs') {
			include "docs.php";
		} elseif (file_exists("$request.php")) {
			include "$request.php";
		} elseif (file_exists("$request.md")) {
			$markdown = file_get_contents("$request.md");
			echo $Parsedown->text($markdown);
		} else {
			include "home.php";
		}


		// if (in_array($request, $pages)) {
		// 	if (file_exists("pages/$request.md")) {
		// 		$markdown = file_get_contents("pages/$request.md");
		// 		echo $Parsedown->text($markdown);
		// 	} elseif (file_exists("pages/$request.php")) {
		// 		include "pages/$request.php";
		// 	}
		// } elseif (file_exists("$request.md")) {

		// 	echo "<ul class=\"breadcrumbs\">";

		// 	include "templates/breadcrumbs.php";
		// 	echo breadcrumbs();

		// 	echo "</ul>";

		// 	$markdown = file_get_contents("$request.md");
		// 	echo $Parsedown->text($markdown);
		// } else {
		// 	include "pages/home.php";

		// }

		?>
	</section>
</main>