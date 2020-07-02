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

switch ($action) {

	//////////////////////////////////////////////////////////////////////////80
	// Main Settings Window
	//////////////////////////////////////////////////////////////////////////80
	case "settings":
		?>
		<label class="title"><i class="fas fa-cog"></i><?php echo i18n("settings"); ?></label>

		<div class="settings">
			<!--<div class="panels-components">-->
			<menu>
				<li>
					<a name="editor-settings" data-file="components/settings/settings.editor.php" class="active"><i class="fas fa-home"></i><?php echo i18n("editor"); ?></a>
				</li>
				<li>
					<a name="system-settings" data-file="components/settings/settings.system.php"><i class="fas fa-sliders-h"></i><?php echo i18n("system"); ?></a>
				</li>
				<li>
					<a name="codegit-settings" data-file="components/settings/settings.codegit.php"><i class="fas fa-code-branch"></i><?php echo i18n("codegit"); ?></a>
				</li>
				<li>
					<a name="keybindings" data-file="components/settings/settings.keybindings.php"><i class="fas fa-keyboard"></i><?php echo i18n("keybindings"); ?></a>
				</li>
				<?php
				if (Common::checkAccess("configure")) {
					?>
					<li>
						<a name="textmode-settings" data-file="components/textmode/dialog.php?action=settings"><i class="fas fa-pencil-alt"></i><?php echo i18n("textmodes"); ?></a>
					</li>
					<?php
				}
				?>
				<hr>
				<?php
				global $plugins;
				foreach ($plugins as $plugin) {
					if (file_exists(PLUGINS . "/" . $plugin . "/plugin.json")) {
						$data = json_decode(file_get_contents(PLUGINS . "/" . $plugin . "/plugin.json"), true);
						if (isset($data['config'])) {
							foreach ($data['config'] as $config) {
								if (isset($config['file']) && isset($config['icon']) && isset($config['title'])) {
									echo('<li><a data-file="plugins/' . $plugin . '/' .$config['file'].'" data-name="'. $data['name'] .'"><i class="' . $config['icon'] . '"></i>' . i18n($config['title']) . '</a></li>');
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
			<?php echo i18n("settings_autosave"); ?>
			<!--	<button class="btn-right" onclick="atheos.settings.saveAll(); return false;"><?php echo i18n("save"); ?></button>-->
			<!--	<button class="btn-left" onclick="atheos.modal.unload(); return false;"><?php echo i18n("close"); ?></button>-->
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