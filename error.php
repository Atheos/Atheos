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

$errortitle = $codes[$status][0];

$request = @parse_url($_SERVER["HTTP_HOST"]);
$file = "/" . trim(basename($_SERVER["REQUEST_URI"]));

$documents = array(
	"/robots.txt",
	"/humans.txt",
	"/keybase.txt",
	"/security.txt",
	"/sitemap.xml",
	"/license.md"
);

if (in_array($file, $documents) && file_exists(".$file")) {
	header($_SERVER["SERVER_PROTOCOL"] . " 200 OK");
	if ($file === "/sitemap.xml") {
		header("Content-Type: application/xml; charset=utf-8");
	} else {
		header("Content-Type: text/plain; charset=utf-8");
	}
	readfile(".$file");
	die();
}

?>

<!DOCTYPE html>
<html lang="en">

<!-- Copyright (C) 2020-Present  Liam Siira <Liam@Siira.us>	-->
<!-- This file is part of https://www.siira.us				-->
<!-- This code can not be copied and/or distributed			-->
<!-- without the express permission of Liam Siira			-->

<head>
	<meta charset="utf-8">
	<title><?php echo $errortitle; ?></title>

	<meta http-equiv="X-UA-Compatible" content="chrome=1">
	<meta name="description" content="Atheos is an open source, web-based, cloud IDE and code editor with minimal footprint and requirements, built on top of Codiad by Fluidbyte" />
	<meta name=”keywords” content=”atheos, code anywhere, programming, synthax highlighting, extendable, themes, plugins, ide, cloud, open source, code editor, minimal footprint, codiad, php, javascript, html, web-based, web-development, firefox, chrome, safari, linux, windows, apache, nginx, docker” />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="author" content="Liam Siira, Liam@Siira.io">

	<!-- Facebook and Twitter integration -->
	<meta property="og:title" content="Atheos Cloud IDE" />
	<meta property="og:image" content="assets/images/atheos.jpg" />
	<meta property="og:url" content="https://www.atheos.io" />
	<meta property="og:site_name" content="Atheos Cloud IDE" />
	<meta property="og:type" content="website" />
	<meta property="og:description" content="Atheos is an open source, web-based, cloud IDE and code editor with minimal footprint and requirements, built on top of Codiad by Fluidbyte" />
	<meta name="twitter:title" content="Atheos Cloud IDE" />
	<meta name="twitter:image" content="assets/images/atheos.jpg" />
	<meta name="twitter:description" content="Atheos is an open source, web-based, cloud IDE and code editor with minimal footprint and requirements, built on top of Codiad by Fluidbyte" />
	<meta name="twitter:url" content="https://www.atheos.io" />
	<meta name="twitter:card" content="summary_large_image" />

	<!-- Theme CSS -->
	<link rel="preload" as="style" href="/assets/style.min.css">
	<link rel="stylesheet" type="text/css" href="/assets/style.min.css" media="screen">

	<!--Preload Fonts-->
	<link rel="preload" as="font" href="/fonts/ubuntu/Ubuntu-Bold.woff2" type="font/woff2" crossorigin="anonymous">
	<link rel="preload" as="font" href="/fonts/ubuntu/Ubuntu-Regular.woff2" type="font/woff2" crossorigin="anonymous">

	<!-- Favicon -->
	<link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">
	<link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">
	<link rel="manifest" href="/favicons/site.webmanifest">
	<link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#5bbad5">
	<link rel="shortcut icon" href="/favicons/favicon.ico">
	<meta name="msapplication-TileColor" content="#111111">
	<meta name="msapplication-config" content="/favicons/browserconfig.xml">
	<meta name="theme-color" content="#ffffff">

	<!-- Style -->
	<style type="text/css">
		<?php include("assets/embed.css");
		?>
		
		#logo {
			max-width: 480px;
		}
	</style>

	<!-- Javascript -->
	<script defer type="text/javascript" src="/assets/javascript.php"></script>
</head>

<body>
	<!-- Background -->
	<canvas id="synthetic"></canvas>

	<!-- Logo -->
	<div id="logo">
		<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="40 147.5 320 387.5" width="640" height="670">
			<path class="delay0" id="backdrop" d="M200.42 460.36L65.67 384.02V231.34L200.42 155l134.75 76.34v152.68l-134.75 76.34z" />
			<path class="delay1" id="alpha" d="M255 350l-55-95-55 95" />

			<path class="delay2" id="leftWing" d="M40 400V220l80 40v100l60 35v85L40 400z" />
			<path class="delay2" id="leftBar" d="M120 360l-80 40" />
			<path class="delay2" id="rightWing" d="M360 400V220l-80 40v100l-60 35v85l140-80z" />
			<path class="delay2" id="rightBar" d="M280 360l80 40" />

			<path class="delay4" id="center" d="M200 490l20-10v-85l60-35V260l-80-50-80 50v100l60 35v85l20 10z" />
		</svg>
	</div>
</body>

</html>