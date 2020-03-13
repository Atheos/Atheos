<?php

header("Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");
header("X-Frame-Options: SAMEORIGIN");
header("X-XSS-Protection: 1; mode=block");
header("X-Content-Type-Options: nosniff");
// header("Content-Security-Policy: script-src 'self' blob: 'unsafe-inline'");
header("Referrer-Policy: no-referrer");
header("Feature-Policy: sync-xhr 'self'");

require_once('common.php');

// Context Menu
$context_menu = file_get_contents(COMPONENTS . "/contextmenu/context_menu.json");
$context_menu = json_decode($context_menu, true);

// Read Components, Plugins, Themes
$components = Common::readDirectory(COMPONENTS);
$plugins = Common::readDirectory(PLUGINS);
$themes = Common::readDirectory(THEMES);

// Theme
$theme = THEME;
if (isset($_SESSION['theme'])) {
	$theme = $_SESSION['theme'];
}

?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Atheos IDE</title>
	<link defer rel="stylesheet" href="fonts/fontawesome/css/webfont.css">
	<link defer rel="stylesheet" href="fonts/ubuntu-webfont/webfont.css">
	<!--<link rel="stylesheet" href="fonts/victor-mono/webfont.css">-->
	<link defer rel="stylesheet" href="fonts/file-icons/webfont.css">

	<!--Link favicons-->
	<link rel="apple-touch-icon" sizes="180x180" href="favicons/apple-touch-icon.png?v=2">
	<link rel="icon" type="image/png" sizes="32x32" href="favicons/favicon-32x32.png?v=2">
	<link rel="icon" type="image/png" sizes="16x16" href="favicons/favicon-16x16.png?v=2">
	<link rel="manifest" href="favicons/site.webmanifest">
	<link rel="mask-icon" href="favicons/safari-pinned-tab.svg?v=2" color="#5bbad5">
	<link rel="shortcut icon" href="favicons/favicon.ico?v=2">
	<meta name="msapplication-TileColor" content="#111111">
	<meta name="msapplication-config" content="favicons/browserconfig.xml">
	<meta name="theme-color" content="#ffffff">

	<?php
	// Load System CSS Files
	echo('<link rel="stylesheet" href="themes/' . $theme . '/main.min.css">');


	require_once('public/minify-core-js.php');

	// Load Plugin CSS Files
	foreach ($plugins as $plugin) {
		if (file_exists(PLUGINS . "/" . $plugin . "/screen.css")) {
			echo('<link rel="stylesheet" href="plugins/'.$plugin.'/screen.css">');
		}
	}

	?>

</head>

<body>

	<?php

	//////////////////////////////////////////////////////////////////
	// NOT LOGGED IN
	//////////////////////////////////////////////////////////////////

	if (!isset($_SESSION['user'])) {
		$path = rtrim(str_replace("index.php", "", $_SERVER['SCRIPT_FILENAME']), "/");

		$users = file_exists($path . "/data/users.php") || file_exists($path . "/data/users.json");
		$projects = file_exists($path . "/data/projects.php") || file_exists($path . "/data/projects.json");
		$active = file_exists($path . "/data/active.php") || file_exists($path . "/data/active.json");

		if (!$users && !$projects && !$active) {
			// Installer
			require_once('components/install/view.php');
		} else {
			// Login form
			require_once('components/user/login.php');
		}

		//////////////////////////////////////////////////////////////////
		// AUTHENTICATED
		//////////////////////////////////////////////////////////////////
	} else {
		?>

		<div id="workspace">
			<?php require_once('components/sidebars/sb-left.php'); ?>


			<div id="editor-region">
				<div id="editor-top-bar">
					<ul id="tab-list-active-files">
					</ul>
					<div id="tab-dropdown">
						<a id="tab-dropdown-button" class="fas fa-chevron-circle-down"></a>
					</div>
					<div id="tab-close">
						<a id="tab-close-button" class="fas fa-times-circle" title="<?php i18n("Close All") ?>"></a>
					</div>
					<ul id="dropdown-list-active-files"></ul>
					<div class="bar"></div>
				</div>

				<div id="root-editor-wrapper"></div>

				<div id="editor-bottom-bar">
					<a id="settings_open" class="ico-wrapper"><i class="fas fa-cogs"></i><?php i18n("Settings"); ?></a>

					<?php

					////////////////////////////////////////////////////////////
					// Load Plugins
					////////////////////////////////////////////////////////////

					foreach ($plugins as $plugin) {
						if (file_exists(PLUGINS . "/" . $plugin . "/plugin.json")) {
							$pdata = file_get_contents(PLUGINS . "/" . $plugin . "/plugin.json");
							$pdata = json_decode($pdata, true);
							if (isset($pdata[0]['bottombar'])) {
								foreach ($pdata[0]['bottombar'] as $bottommenu) {
									if ((!isset($bottommenu['admin']) || ($bottommenu['admin']) && checkAccess()) || !$bottommenu['admin']) {
										if (isset($bottommenu['action']) && isset($bottommenu['icon']) && isset($bottommenu['title'])) {
											echo('<div class="divider"></div>');
											echo('<a onclick="'.$bottommenu['action'].'"><i class="'.$bottommenu['icon'].'"></i>'.$bottommenu['title'].'</a>');
										}
									}
								}
							}
						}
					} ?>

					<div class="divider"></div>
					<a id="split" class="ico-wrapper"><i class="fas fa-column"></i><?php i18n("Split"); ?></a>
					<div class="divider"></div>
					<a id="current-mode"><i class="fas fa-column"></i></a>
					<div class="divider"></div>
					<div id="current-file"></div>
					<div id="cursor-position">
						<?php i18n("Ln"); ?>: 0 &middot; <?php i18n("Col"); ?>: 0
					</div>
				</div>
				<div id="changemode-menu" class="options-menu">
				</div>
				<ul id="split-options-menu" class="options-menu">
					<li id="split-horizontally"><a> <?php i18n("Split Horizontally"); ?> </a></li>
					<li id="split-vertically"><a> <?php i18n("Split Vertically"); ?> </a></li>
					<li id="merge-all"><a> <?php i18n("Merge all"); ?> </a></li>
				</ul>
			</div>
			<?php require_once('components/sidebars/sb-right.php'); ?>

		</div>


		<iframe id="download"></iframe>

		<div id="autocomplete">
			<ul id="suggestions"></ul>
		</div>

		<!-- ACE -->
		<script src="components/editor/ace-editor/ace.js"></script>
		<script src="components/editor/ace-editor/ext-language_tools.js"></script>


		<!-- COMPONENTS -->
		<?php

		//////////////////////////////////////////////////////////////////
		// LOAD COMPONENTS
		//////////////////////////////////////////////////////////////////

		// JS
		foreach ($components as $component) {
			if (file_exists(COMPONENTS . "/" . $component . "/init.js")) {
				echo('<script src="components/'.$component.'/init.js"></script>"');
			}
		}

		// require_once('plugins/minify-plugins-js.php');

		foreach ($plugins as $plugin) {
			if (file_exists(PLUGINS . "/" . $plugin . "/init.js")) {
				echo('<script src="plugins/'.$plugin.'/init.js"></script>"');
			}
		}
	}

	?>
</body>
</html>