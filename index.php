<?php

header("Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");
header("X-Frame-Options: SAMEORIGIN");
header("X-XSS-Protection: 1; mode=block");
header("X-Content-Type-Options: nosniff");
// header("Content-Security-Policy: script-src 'self' blob: 'unsafe-inline'");
header("Referrer-Policy: no-referrer");
header("Feature-Policy: sync-xhr 'self'");
// header("Access-Control-Allow-Origin: https://www.atheos.io");
header("Access-Control-Allow-Origin: *");

require_once('common.php');

require_once('public/class.sourcemanager.php');
$SourceManager = new SourceManager;

// Context Menu
$context_menu = file_get_contents(COMPONENTS . "/contextmenu/context_menu.json");
$context_menu = json_decode($context_menu, true);

// Read Components, Plugins, Themes
$components = Common::readDirectory(COMPONENTS);
$plugins = Common::readDirectory(PLUGINS);
$themes = Common::readDirectory(THEMES);

// Theme
$theme = Common::data("theme", "session") ?: THEME;

?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Atheos IDE</title>
	<link defer rel="stylesheet" href="fonts/fontawesome/css/webfont.css">
	<link defer rel="stylesheet" href="fonts/ubuntu/webfont.css">
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

	<script>
		var i18n = (function(lang) {
			return function(word, args) {
				var x;
				var returnw = (word in lang) ? lang[word]: word;
				for (x in args) {
					returnw = returnw.replace("%{"+x+"}%", args[x]);
				}
				return returnw;
			}
		})(<?php echo json_encode($lang); ?>)
	</script>

	<?php
	// Load System CSS Files
	echo('<link rel="stylesheet" href="themes/' . $theme . '/main.min.css">');



	//////////////////////////////////////////////////////////////////
	// LOAD MODULES
	//////////////////////////////////////////////////////////////////
	$SourceManager->echoScripts("modules", true);


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
	$activeUser = Common::data("user", "session");
	//////////////////////////////////////////////////////////////////
	// LOGGED IN
	//////////////////////////////////////////////////////////////////

	if ($activeUser) {
		?>

		<div id="workspace">
			<?php require_once('components/contextmenu/menu.php'); ?>

			<?php require_once('components/sidebars/sb-left.php'); ?>


			<div id="editor-region">
				<div id="editor-top-bar">
					<ul id="tab-list-active-files" class="customSortable"></ul>
					<a id="tab_dropdown" class="fas fa-chevron-circle-down"></a>
					<a id="tab_close" class="fas fa-times-circle"></a>
					<ul id="dropdown-list-active-files" style="display: none;"></ul>
				</div>

				<div id="root-editor-wrapper"></div>

				<div id="editor-bottom-bar">
					<!--<a id="settings_open" class="ico-wrapper"><i class="fas fa-cogs"></i><?php i18n("Settings"); ?></a>-->
					<!--<div class="divider"></div>-->
					<a id="split"><i class="fas fa-columns"></i><?php i18n("Split"); ?></a>
					<div class="divider"></div>
					<a id="current_mode"><i class="fas fa-code"></i><span></span></a>

					<?php

					////////////////////////////////////////////////////////////
					// Load Plugins
					////////////////////////////////////////////////////////////

					foreach ($plugins as $plugin) {
						if (file_exists(PLUGINS . "/" . $plugin . "/plugin.json")) {
							$pdata = file_get_contents(PLUGINS . "/" . $plugin . "/plugin.json");
							$pdata = json_decode($pdata, true);
							if (isset($pdata['bottombar'])) {
								foreach ($pdata['bottombar'] as $bottommenu) {
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
					<span id="current_file"></span>
					<span id="cursor-position"><?php i18n("Ln"); ?>: 0 &middot; <?php i18n("Col"); ?>: 0</span>
					<div id="changemode-menu" style="display:none;" class="options-menu"></div>
					<ul id="split-options-menu" style="display:none;" class="options-menu">
						<li id="split-horizontally"><a><i class="fas fa-arrows-alt-h"></i><?php i18n("Split Horizontally"); ?> </a></li>
						<li id="split-vertically"><a><i class="fas fa-arrows-alt-v"></i><?php i18n("Split Vertically"); ?> </a></li>
						<li id="merge-all"><a><i class="fas fa-compress-arrows-alt"></i><?php i18n("Merge all"); ?> </a></li>
					</ul>
				</div>

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

		<?php
		//////////////////////////////////////////////////////////////////
		// LOAD COMPONENTS
		//////////////////////////////////////////////////////////////////
		$SourceManager->echoScripts("components", true);

		//////////////////////////////////////////////////////////////////
		// LOAD PLUGINS
		//////////////////////////////////////////////////////////////////
		$SourceManager->echoScripts("plugins", true);
	} else {
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
	}

	?>
</body>
</html>