<?php

//////////////////////////////////////////////////////////////////////////////80
// Index
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

header("Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");
header("X-Frame-Options: SAMEORIGIN");
header("X-XSS-Protection: 1; mode=block");
header("X-Content-Type-Options: nosniff");
// header("Content-Security-Policy: script-src 'self' blob: 'unsafe-inline'");
header("Referrer-Policy: no-referrer");
header("Feature-Policy: sync-xhr 'self'");
// header("Access-Control-Allow-Origin: https://www.atheos.io");
header("Access-Control-Allow-Origin: *");

require_once("common.php");

require_once("public/class.sourcemanager.php");

$SourceManager = new SourceManager;

// Read Components, Plugins, Themes
$components = Common::readDirectory(COMPONENTS);
$plugins = Common::readDirectory(PLUGINS);
$themes = Common::readDirectory(THEMES);

// Theme
$theme = SESSION("theme") ?: THEME;

?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>Atheos IDE</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="description" content="A Web-Based IDE with a small footprint and minimal requirements">

	<!-- FAVICONS -->
	<link rel="icon" type="image/png" sizes="32x32" href="favicons/favicon-32x32.png?v=2">
	<link rel="icon" type="image/png" sizes="16x16" href="favicons/favicon-16x16.png?v=2">
	<link rel="manifest" href="favicons/site.webmanifest">
	<link rel="mask-icon" href="favicons/safari-pinned-tab.svg?v=2" color="#5bbad5">
	<link rel="shortcut icon" href="favicons/favicon.ico?v=2">
	<meta name="msapplication-TileColor" content="#111111">
	<meta name="msapplication-config" content="favicons/browserconfig.xml">
	<meta name="theme-color" content="#ffffff">

	<?php

	// Load THEME
	echo("<!-- THEME: $theme -->\n");
	echo("\t<link rel=\"stylesheet\" href=\"themes/$theme/main.min.css\">\n\n");

	// LOAD FONTS
	$SourceManager->echo("css", "fonts", DEVELOPMENT);

	// LOAD MODULES
	$SourceManager->echo("js", "modules", DEVELOPMENT);

	// LOAD PLUGINS
	$SourceManager->echo("css", "plugins", DEVELOPMENT);

	?>
</head>

<body>

	<?php

	//////////////////////////////////////////////////////////////////
	// LOGGED IN
	//////////////////////////////////////////////////////////////////

	if (SESSION("user")) {
		?>

		<div id="workspace">
			<?php require_once('components/contextmenu/menu.php'); ?>

			<?php require_once('components/sidebars/sb-left.php'); ?>


			<div id="editor-region">
				<div id="editor-top-bar">
					<ul id="tab-list-active-files" class="tabList"></ul>
					<a id="tab_dropdown" class="fas fa-chevron-circle-down"></a>
					<a id="tab_close" class="fas fa-times-circle"></a>
					<ul id="dropdown-list-active-files" style="display: none;"></ul>
				</div>

				<div id="root-editor-wrapper"></div>

				<div id="editor-bottom-bar">
					<a id="split"><i class="fas fa-columns"></i><?php echo i18n("split"); ?></a>
					<a id="current_mode"><i class="fas fa-code"></i><span></span></a>
					<span id="current_file"></span>
					<span id="codegit_file_status"></span>
					<div id="changemode-menu" style="display:none;" class="options-menu"></div>
					<ul id="split-options-menu" style="display:none;" class="options-menu">
						<li id="split-horizontally"><a><i class="fas fa-arrows-alt-h"></i><?php echo i18n("split_h"); ?> </a></li>
						<li id="split-vertically"><a><i class="fas fa-arrows-alt-v"></i><?php echo i18n("split_v"); ?> </a></li>
						<li id="merge-all"><a><i class="fas fa-compress-arrows-alt"></i><?php echo i18n("merge_all"); ?> </a></li>
					</ul>
					<span id="cursor-position"><?php echo i18n("ln"); ?>: 0 &middot; <?php echo i18n("col"); ?>: 0</span>
				</div>

			</div>
			<?php require_once('components/sidebars/sb-right.php'); ?>

		</div>


		<iframe id="download" title="download"></iframe>

		<!-- ACE -->
		<script src="components/editor/ace-editor/ace.js"></script>
		<script src="components/editor/ace-editor/ext-language_tools.js"></script>
		<script src="components/editor/ace-editor/ext-beautify.js"></script>

		<?php
		// LOAD COMPONENTS
		echo("\n");
		$SourceManager->echo("js", "components", DEVELOPMENT);

		// LOAD PLUGINS
		$SourceManager->echo("js", "plugins", DEVELOPMENT);

	} else {
		$path = __DIR__ . "/data/";

		$users = file_exists($path . "users.json");
		$projects = file_exists($path . "projects.json");

		if (!$users && !$projects) {
			// Installer
			require_once('components/install/view.php');
		} else {
			// Login form
			require_once('components/user/login.php');
		}
	}

	?>
	<toaster class="bottom right"></toaster>
</body>
</html>