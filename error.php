<?php
$status = $_SERVER["REDIRECT_STATUS"];
$codes = array(
	400 => array("400 Bad Request", "The request cannot be fulfilled due to bad syntax."),
	401 => array("401 Login Error", "It appears that the username/password was incorrect."),
	403 => array("403 Forbidden", "The server has refused to fulfill your request."),
	404 => array("404 Not Found", "The document requested was not found on this server."),
	405 => array("405 Method Not Allowed", "The method specified in the Request-Line is not allowed for the specified resource."),
	408 => array("408 Request Timeout", "Client browser failed to send a request in the time allowed by the server."),
	414 => array("414 URL Too Long", "The URL you entered is longer than the maximum length."),
	500 => array("500 Internal Server Error", "The request was unsuccessful due to an unexpected condition encountered by the server."),
	502 => array("502 Bad Gateway", "The server received an invalid response from the upstream server while trying to fulfill the request."),
	504 => array("504 Gateway Timeout", "The upstream server failed to send a request in the time allowed by the server."),
);
$title = $codes[$status][0];
$message = $codes[$status][1];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
	die(json_encode(array(
		"status" => $title,
		"text" => $message
	)));
}

?>

<!DOCTYPE html>
<html lang="en">

<!-- Copyright (C) 2020-Present Liam Siira <Liam@Siira.io>	-->
<!-- This file is part of the Atheos include				-->
<!-- This code can not be copied and/or distributed			-->
<!-- without the express permission of Liam Siira			-->

<head>
	<meta charset="utf-8">
	<title><?php echo $title; ?></title>
	<meta name="author" content="Liam Siira">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="description" content="A Web-Based IDE with a small footprint and minimal requirements">

	<!-- FONTS -->
	<link rel="stylesheet" href="/fonts/file-icons/webfont.min.css">
	<link rel="stylesheet" href="/fonts/fontawesome/webfont.css">
	<link rel="stylesheet" href="/fonts/ubuntu/webfont.css">

	<!-- FAVICONS -->
	<?php require_once("templates/favicons.php"); ?>

	<!-- THEME -->
	<link rel="stylesheet" href="/theme/main.min.css">

	<style>
		p {
			font-family: "UBUNTU-FIRA";
			font-size: 1.5rem;
		}
	</style>

</head>

<body>
	<canvas id="synthetic"></canvas>
	<?php require_once("templates/logo.php"); ?>

	<form id="error">
		<fieldset>
			<legend><?php echo $title; ?></legend>
			<p class="center">
				<?php echo $message; ?>
			</p>
		</fieldset>

	</form>

	<script type="text/javascript" src="/libraries/synthetic.js"></script>
	<script type="text/javascript">
		document.addEventListener("DOMContentLoaded", function () {
			synthetic.init();
		});
	</script>
</body>

</html>