<?php

//////////////////////////////////////////////////////////////////////////////80
// Settings Dialog
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once("../../common.php");

//////////////////////////////////////////////////////////////////////////////80
// Verify Session or Key
//////////////////////////////////////////////////////////////////////////////80
Common::checkSession();

$action = Common::data("action");
if (!$action) {
	Common::sendJSON("E401m"); die;
}

switch ($action) {

	//////////////////////////////////////////////////////////////////////////80
	// Settings iFrame
	//////////////////////////////////////////////////////////////////////////80
	case "iframe":
		?>
		<script>
			/*
                 *  Storage Event:
                 *  Note: Event fires only if change was made in different window and not in this one
                 *  Details: http://dev.w3.org/html5/webstorage/#dom-localstorage
                 */
			window.addEventListener('storage',
				function(e) {
					if (/^atheos/.test(e.key)) {
						var obj = {
							key: e.key,
							oldValue: e.oldValue,
							newValue: e.newValue
						};
						/* Notify listeners */
						window.parent.amplify.publish('settings.changed', obj);
					}
				},
				false);
		</script>
		<?php
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Main Settings Window
	//////////////////////////////////////////////////////////////////////////80
	case "settings":
		?>
		<label class="title"><i class="fas fa-cog"></i><?php i18n("Settings"); ?></label>

		<div class="settings">
			<!--<div class="panels-components">-->
			<menu>
				<li>
					<a name="editor-settings" data-file="components/settings/settings.editor.php" class="active"><i class="fas fa-home"></i><?php i18n("Editor"); ?></a>
				</li>
				<li>
					<a name="system-settings" data-file="components/settings/settings.system.php"><i class="fas fa-sliders-h"></i><?php i18n("System"); ?></a>
				</li>
				<li>
					<a name="codegit-settings" data-file="components/settings/settings.codegit.php"><i class="fas fa-code-branch"></i><?php i18n("CodeGit"); ?></a>
				</li>
				<?php
				if (Common::checkAccess("configure")) {
					?>
					<li>
						<a name="textmode-settings" data-file="components/textmode/dialog.php?action=settings"><i class="fas fa-pencil-alt"></i><?php i18n("Extensions"); ?></a>
					</li>
					<?php
				}
				?>
				<hr>
				<?php
				$plugins = Common::readDirectory(PLUGINS);

				foreach ($plugins as $plugin) {
					if (file_exists(PLUGINS . "/" . $plugin . "/plugin.json")) {
						$data = json_decode(file_get_contents(PLUGINS . "/" . $plugin . "/plugin.json"), true);
						if (isset($data['config'])) {
							foreach ($data['config'] as $config) {
								if (isset($config['file']) && isset($config['icon']) && isset($config['title'])) {
									echo('<li><a data-file="plugins/' . $plugin . '/' .$config['file'].'" data-name="'. $data['name'] .'"><i class="' . $config['icon'] . '"></i>' . $config['title'] . '</a></li>');
								}
							}
						}

					}
				}
				?>
			</menu>
			<panel>
				<?php include('settings.editor.php'); ?>
			</panel>

		</div>
		<toolbar>
			<button class="btn-right" onclick="save(); return false;"><?php i18n("Save"); ?></button>
			<button class="btn-left" onclick="codiad.modal.unload(); return false;"><?php i18n("Close"); ?></button>
		</toolbar>
		<?php
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Default: Invalid Action
	//////////////////////////////////////////////////////////////////////////80
	default:
		Common::sendJSON("E401i");
		break;
}