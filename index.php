<?php

//////////////////////////////////////////////////////////////////////////////80
// Index
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once("common.php");

if (defined("HEADERS") && HEADERS) {
	foreach (unserialize(HEADERS) as $val) {
		header($val);
	}
}

require_once("traits/cls.source.php");

$SourceManager = new SourceManager;

?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title><?php if (defined("DOMAIN") && DOMAIN) echo(DOMAIN . " | ") ?>Atheos IDE</title>
	<meta name="author" content="Liam Siira">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="description" content="A Web-Based IDE with a small footprint and minimal requirements">
	<!-- FAVICONS -->
	<?php
	require_once("templates/favicons.php");

	// Load THEME
	echo("<!-- THEME -->\n");
	echo("\t<link rel=\"stylesheet\" href=\"theme/main.min.css\">\n");

	// LOAD FONTS
	$SourceManager->linkResource("css", "fonts", DEVELOPMENT);

	// LOAD LIBRARIES
	$SourceManager->linkResource("js", "libraries", DEVELOPMENT);

	// LOAD MODULES
	$SourceManager->linkResource("js", "modules", DEVELOPMENT);

	// LOAD PLUGINS
	$SourceManager->linkResource("css", "plugins", DEVELOPMENT);

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
			<div id="contextmenu"></div>

			<?php require_once('components/sidebars/sb-left.php'); ?>

			<div id="ACTIVE">
				<ul id="active_file_tabs" class="tabList"></ul>
				<a id="tab_dropdown" class="fas fa-chevron-circle-down"></a>
				<a id="tab_close" class="fas fa-times-circle"></a>
				<ul id="active_file_dropdown" style="display: none;"></ul>
			</div>

			<div id="EDITOR">
				<div id="root-editor-wrapper"></div>
			</div>

			<div id="BOTTOM">
				<a id="split"><i class="fas fa-columns"></i><?php echo i18n("split"); ?></a>
				<a id="current_mode"><i class="fas fa-code"></i><span></span></a>
				<span id="current_file"></span>
				<span id="codegit_file_status"></span>
				<div id="changemode_menu" style="display:none;" class="options-menu"></div>
				<ul id="split_menu" style="display:none;" class="options-menu">
					<li id="split-horizontally"><a><i class="fas fa-arrows-alt-h"></i><?php echo i18n("split_h"); ?> </a></li>
					<li id="split-vertically"><a><i class="fas fa-arrows-alt-v"></i><?php echo i18n("split_v"); ?> </a></li>
					<li id="merge-all"><a><i class="fas fa-compress-arrows-alt"></i><?php echo i18n("merge_all"); ?> </a></li>
				</ul>
				<span id="cursor-position"><?php echo i18n("ln"); ?>: 0 &middot; <?php echo i18n("col"); ?>: 0</span>
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
		$SourceManager->linkResource("js", "components", DEVELOPMENT);

		// LOAD PLUGINS
		$SourceManager->linkResource("js", "plugins", DEVELOPMENT);

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
	<overlay class=""></overlay>
	<toaster></toaster>
	<output></output>
</body>
</html>