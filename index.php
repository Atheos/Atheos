<!DOCTYPE html>
<html lang="en">

<!-- Copyright (C) 2020-Present  Liam Siira <Liam@Siira.io>	-->
<!-- This file is part of https://www.siira.io				-->
<!-- This code can not be copied and/or distributed			-->
<!-- without the express permission of Liam Siira			-->
<head>
	<meta charset='utf-8'>
	<title>Atheos Cloud IDE</title>

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
	</style>

	<!-- Javascript -->
	<script defer type="text/javascript" src="assets/javascript.php"></script>
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

	<!-- Main -->
	<main>
		<section>
			<h1>Atheos Cloud Based IDE</h1>

			<p>
				A web-based IDE framework with a small footprint and minimal requirements, built on top of <a title="codiad" href="https://github.com/Codiad/Codiad">Codiad.</a>
			</p>
			<p>
				With simplicity in mind, Atheos is designed to allow for fast, interactive development without the massive overhead of larger desktop editors or skimping on features. Atheos boasts a dedicated team of collaborators and developers, providing features such as:
			</p>
			<ul class="split_left">
				<li>Support for 40+ languages</li>
				<li>Plugin Library &amp; Marketplace</li>
				<li>Error checking &amp; notifications</li>
				<li>Mutliple user support</li>
				<li>Editor screen splitting</li>
				<li>LocalStorage redundancy</li>
				<li>Advanced searching tools</li>
				<li>Smart auto-complete</li>
			</ul>

			<ul class="split_right">
				<li>Real-Time Collaborative editing</li>
				<li>20+ Syntax color themes</li>
				<li>Completely Open-Source</li>
				<li>Easily customized source</li>
				<li>Runs on your own server</li>
				<li>Quick-Download backups</li>
				<li>Maximum editor screen space</li>
				<li>i18n Language Support</li>
			</ul>

			<div style="clear:both;"></div>
			<p class="right">
				...and with a team of passionate collaborators the list keeps growing.
			</p>
			<p>
				Keep up to date with the latest changes and news on <strong><a rel="noreferrer" title="github" href="https://github.com/Atheos/Atheos">Github</a>!</strong>
			</p>
		</section>
		<section>
			<h2>Requirements</h2>

			<p>
				Atheos requires a minimal server installation with Apache2, PHP 7+ and basic R/W access. Atheos has been tested to work on PHP 5.4, however PHP 7 is where active development takes place. There is no database requirement.
			</p>

			<p>
				The application will work in modern browsers including Chrome, Firefox, and IE9+, though it is mostly developed in Chrome.
			</p>
		</section>
		<section>
			<h2>Getting Started</h2>

			<p>
				In order to install Atheos, upload or <code>git clone</code> the latest source files into a directory your web-server has access to, ensure that a few directories and a config file are writeable, and load Atheos in your browser. There is no database and no other server components are required.
			</p>

			<p>
				For more information please <strong><a title="installation" href="https://github.com/Atheos/Atheos/blob/master/docs/installation/index.md">read the installation instructions</a></strong> within source.
			</p>
		</section>
		<section>
			<h2>Interface</h2>

			<p>
				Atheos consists of three panels:
				<ul>
					<li>A left panel which houses the file and project manager.</li>
					<li>A split-able center panel where editors reside.</li>
					<li>A hidden right panel which contains system, plugin and other controls.</li>
				</ul>
			</p>

			<img src="assets/images/atheos.jpg" alt="Atheos Screenshot">
		</section>

		<section>
			<h2>Support the Atheos Project</h2>

			<p>
				Hey, this is <a href="https://www.siira.io/" rel="noreferrer" title="Developer blog">Liam Siira</a>. If you want to see Atheos be developed further, don't worry; Atheos is my main coding environment, and I have no plans on switching. I try to fix bugs and add features as fast as I can, but if you really want to help support this project, I've setup <a href="https://github.com/HLSiira" title="Github Sponsors" rel="noreferrer">Github Sponsors</a>  as well as a <a  href="https://www.buymeacoffee.com/hlsiira" title="BuyMeACoffee" rel="noreferrer">BuyMeACoffee page</a> as a great ways to show your support. I am also a big fan of a reading emails about use cases and seeing Atheos in the real world. Thank you!
			</p>
		</section>
	</main>

</body>
</html>