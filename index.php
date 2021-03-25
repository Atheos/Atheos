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

	<!-- PreConnects -->
	<link rel="preconnect" href="https://api.github.com">

	<!-- Theme CSS -->
	<link rel="preload" as="style" href="assets/style.min.css">
	<link rel="stylesheet" type="text/css" href="assets/style.min.css" media="screen">

	<!-- Preconnect -->
	<link rel="preconnect" href="https://api.github.com">

	<!-- Font CSS -->
	<link rel="stylesheet" media="print" onload="this.media='all'" type="text/css" href="fonts/loader.php">

	<!--Preload Fonts-->
	<link rel="preload" as="font" href="fonts/ubuntu/Ubuntu-Bold.woff2" type="font/woff2" crossorigin="anonymous">
	<link rel="preload" as="font" href="fonts/ubuntu/Ubuntu-Regular.woff2" type="font/woff2" crossorigin="anonymous">

	<!-- Fallback for Font CSS -->
	<noscript>
		<link rel="preload" as="style" href="fonts/loader.php">
		<link rel="stylesheet" type="text/css" href="fonts/loader.php">
	</noscript>


	<!-- Favicon -->
	<link rel="apple-touch-icon" sizes="180x180" href="favicons/apple-touch-icon.png">
	<link rel="icon" type="image/png" sizes="32x32" href="favicons/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="16x16" href="favicons/favicon-16x16.png">
	<link rel="manifest" href="favicons/site.webmanifest">
	<link rel="mask-icon" href="favicons/safari-pinned-tab.svg" color="#5bbad5">
	<link rel="shortcut icon" href="favicons/favicon.ico">
	<meta name="msapplication-TileColor" content="#111111">
	<meta name="msapplication-config" content="favicons/browserconfig.xml">
	<meta name="theme-color" content="#ffffff">

	<!-- Style -->
	<style type="text/css">
		html {
			font-size: 16px;
			-ms-text-size-adjust: 100%;
			-webkit-text-size-adjust: 100%;
		}

		body {
			background-color: #000;
			max-width: 1280px;
			margin: auto;

			font-family: sans-serif;
			font-weight: 400;
			line-height: 1.5;
			color: #F5F9F9;
			text-rendering: optimizeLegibility;
			-webkit-font-smoothing: antialiased;
			-moz-osx-font-smoothing: grayscale;

			padding: 2px;
		}

@media (min-width: 768px) {
			body {
				padding: 15px;
			}
		}

		main {
			/*margin-left: 315px;*/
			/*margin-top: 0;*/
		}

		.fonts-loaded body {
			font-family: 'Ubuntu', sans-serif;
		}

		.fonts-loaded pre,
		.fonts-loaded code,
		.fonts-loaded pre code {
			font-family: 'Ubuntu-Fira', monospace;
		}
	</style>

	<!-- Javascript -->
	<script defer type="text/javascript" src="assets/javascript.php"></script>
</head>
<body id="aeon">
	<canvas id="synthetic"></canvas>

	<sidebar>
		<div class="trigger">
			<svg class="icon manu" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><path d="M15 2H0V1h15v1zm0 4H0V5h15v1zm0 4H0V9h15v1zm0 4H0v-1h15v1z" /></svg>
			<name>Atheos<small class="version_tag">v.1.0</small></name>
		</div>
		<header>
			<a id="logo" title="home" href="https://www.atheos.io">
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="40 147.5 320 387.5" width="320" height="335">
					<defs>
						<path id="backdrop" class="delay-0" d="M200.42 460.36L65.67 384.02V231.34L200.42 155l134.75 76.34v152.68l-134.75 76.34z" />
						<path id="leftWing" class="delay-3" d="M40 400V220l80 40v100l60 35v85L40 400z" />
						<path id="leftBar" class="delay-3" d="M120 360l-80 40" />
						<path id="rightWing" class="delay-3" d="M360 400V220l-80 40v100l-60 35v85l140-80z" />
						<path id="rightBar" class="delay-3" d="M280 360l80 40" />
						<path id="alpha" class="delay-2" d="M255 355l-55-115-55 115" />
						<path id="center" class="delay-3" d="M200 490l20-10v-85l60-35V260l-80-50-80 50v100l60 35v85l20 10z" />
						<clipPath id="i" class="delay-2">
							<use xlink:href="#alpha" />
						</clipPath>
					</defs>
					<use xlink:href="#backdrop" fill="#001F3F" />
					<use xlink:href="#leftWing" fill-opacity="0" stroke="#0074D9" stroke-width="15" />
					<use xlink:href="#leftBar" fill-opacity="0" stroke="#0074D9" stroke-width="15" />
					<use xlink:href="#rightWing" fill-opacity="0" stroke="#0074D9" stroke-width="15" />
					<use xlink:href="#rightBar" fill-opacity="0" stroke="#0074D9" stroke-width="15" />
					<use xlink:href="#center" fill-opacity="0" stroke="#0074D9" stroke-width="15" />
					<g clip-path="url(#i)">
						<use xlink:href="#alpha" fill-opacity="0" stroke="#F5F9F9" stroke-width="30" />
					</g>
				</svg>
			</a>
			<name>Atheos<small class="version_tag">v.1.0</small></name>
			<tagline>Web Based, Cloud IDE</tagline>
		</header>

		<nav>
			<a title="download" href="https://github.com/Atheos/Atheos/releases" id="download-zip">
				<svg class="icon" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><path d="M7 9V1h1v8l2-2 1 1-3 3-4-3 1-1 2 2zm-5 4V7H1v7h13V7h-1v6H2z" /></svg>
				<span>Download</span>
			</a>
			<a title="github" href="https://github.com/Atheos/Atheos" id="view-on-github">
				<svg class="icon" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><path d="M9 2a8 8 0 00-3 0L4 1a2 2 0 00-1 0v1-1a1 1 0 000 1 3 3 0 000 2 3 3 0 00-1 2l1 3 2 1a2 2 0 000 1v1H4l-1-1a9 9 0 000-1H2V9l-1 1h1v1l1 1 1 1h1v2a1 1 0 001 0h4v-4-1l2-1 1-3a3 3 0 00-1-2 3 3 0 000-2 1 1 0 000-1v0a2 2 0 00-1 0L9 2z" /></svg>
				<span>Github</span>
			</a>
		</nav>

	</sidebar>
	<!-- Main -->
	<main class="aeon" itemscope itemtype="http://schema.org/SoftwareApplication">
		<section>
			<h1>Atheos Cloud Based IDE</h1>

			<p>
				Atheos is a web-based IDE framework with a small footprint and minimal requirements, built on top of Codiad by FluidByte and the Codiad Team.
				Keep up to date with the latest changes and news on <strong><a rel="noreferrer" title="github" href="https://github.com/Atheos/Atheos">Github</a></strong>
			</p>
		</section>
		<section>
			<h2>Features</h2>
			<p>
				Atheos was built with simplicity in mind, allowing for fast, interactive development without the massive overhead of some of the larger desktop editors. That being said even users of IDE's
				such as Eclipse, NetBeans and Aptana are finding Atheos's simplicity to be a huge benefit. While simplicity was key, we didn't skimp on features and have a team of dedicated developers actively adding more.
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
		</section>
		<section>
			<h2>Interface</h2>

			<p>
				Atheos consists of three panels; a left panel which houses the file manager and active files, center panel which is where editors reside, and a right panel which contains system and other controls. The right &amp; left side panels collapse providing maximum real-estate to the editor.
			</p>

			<img src="assets/images/atheos.jpg" alt="Atheos Screenshot">
		</section>
		<section>
			<h2>Requirements</h2>

			<p>
				Atheos requires a minimal server installation with Apache2, PHP 7+ and basic R/W access to several directories. Atheos has been tested to work on PHP 5.4, however PHP 7 is where active development takes place. There is no database requirement.
			</p>

			<p>
				The application will work in modern browsers including Chrome, Firefox, and IE9+, though it is developed in Chrome
			</p>
		</section>
		<section>
			<h2>Getting Started</h2>

			<p>
				Installation of Atheos requires uploading the files and making several directories and a config file writeable. There is no database and no other server components are required. PHP 5.3 or above is recommended, however, the system will work with any version of PHP over v.5.
			</p>

			<p>
				For more information please <strong><a title="installation" href="docs/installation/">read the installation instructions</a></strong> on the Wiki.
			</p>
		</section>
		<section>
			<h2>Support the Atheos Project</h2>

			<p>
				Hey, this is <a href="https://www.siira.io/" rel="noreferrer" title="Developer blog">@HLSiira</a>.
				<br>
				If you want to support Codiad, and all the hard work that they did, please donate to them on <a title="codiad" rel="noreferrer" href="https://www.codiad.com">Codiad</a>.
				I am maintaining my fork of Atheos out of my own personal desire on my own personal time. I am just a dude who likes to program whenever I can as the job that I have has nothing to do with fun.
				<br>
				If you want to see Atheos be developed further, don't worry, it most likely will as I love working on it and want to see it succeed. The Codiad folks really created a piece of art.
				<br>
				A nice supportive email would do me just fine.
			</p>
		</section>
	</main>

	<!-- Footer -->
	<footer>
		<p>
			Atheos is maintained by <a title="Github HLSiira" href="https://github.com/HLSiira">Liam Siira</a><br>
		</p>
	</footer>

	<!-- Shadow -->
	<shadow class="fade6"></shadow>

</body>
</html>