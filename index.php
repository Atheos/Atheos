<?php
header("Access-Control-Allow-Origin: *");


$request = parse_url($_SERVER['REQUEST_URI']);
$request = array_key_exists("path", $request) ? $request["path"] : false;
if ($request) {
	$request = str_replace(' ', '', $request);
	$request = strtolower(trim($request, '/'));
	$request = !empty($request) ? $request : 'home';
}
include "libs/parsedown/Parsedown.php";
$Parsedown = new Parsedown();

if ($request == 'raw') {
	$destination = $_GET['des'];
	include "$destination.php";
} elseif ($request == 'market/json' || $request == 'market/stats') {
	include "$request.php";
} elseif ($request == 'update') {
	include "update/index.php";
} else {
	?>
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<?php include "assets/php/meta.php"; ?>
		<?php echo "<!--" . $request . "-->"; ?>

	</head>
	<body>
		<canvas id="synthetic"></canvas>
		<sidebar>
			<div class="background">
				<div class="trigger">
					<i class="icon-menu"></i>
					<h1>Atheos</h1>
				</div>
				<header>
					<a id="logo" href="/"><img src="/assets/images/logo-new.png"></a>
					<h1>Atheos<small id="version_tag">v.1.0</small></h1>
					<h2>Web Based, Cloud IDE</h2>
				</header>
				<?php include "assets/php/navagation.php"; ?>
			</div>
		</sidebar>
		<?php include "assets/php/main.php"; ?>

		<?php include "assets/php/footer.php"; ?>
		<?php include "assets/php/scripts.php"; ?>
	</body>
</html>
<?php
}