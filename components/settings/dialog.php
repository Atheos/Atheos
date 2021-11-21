<?php

//////////////////////////////////////////////////////////////////////////////80
// Settings Dialog
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

switch ($action) {

	//////////////////////////////////////////////////////////////////////////80
	// Main Settings Window
	//////////////////////////////////////////////////////////////////////////80
	case "openDialog":
		?>
		<label class="title"><i class="fas fa-cog"></i><?php echo i18n("settings"); ?></label>

		<div class="settings">
			<menu>

				<?php if (Common::checkAccess("configure")) {
					?>
					<li>
						<a data-panel="analytics"><i class="fas fa-chart-bar"></i><?php echo i18n("analytics"); ?></a>
					</li>
					<?php
				} ?>

				<li>
					<a data-panel="codegit"><i class="fas fa-code-branch"></i><?php echo i18n("codegit"); ?></a>
				</li>
				
				<li>
					<a data-panel="draft"><i class="fas fa-save"></i><?php echo i18n("draft"); ?></a>
				</li>
				
				<li>
					<a data-panel="editor" class="active"><i class="fas fa-home"></i><?php echo i18n("editor"); ?></a>
				</li>
				
				<li>
					<a data-panel="feedback"><i class="fas fa-comments"></i><?php echo i18n("feedback"); ?></a>
				</li>
				
				<li>
					<a data-panel="keybindings"><i class="fas fa-keyboard"></i><?php echo i18n("keybindings"); ?></a>
				</li>
				
				<li>
					<a data-panel="system"><i class="fas fa-sliders-h"></i><?php echo i18n("system"); ?></a>
				</li>


				<?php if (Common::checkAccess("configure")) {
					?>
					<li>
						<a data-panel="textmode"><i class="fas fa-pencil-alt"></i><?php echo i18n("textmodes"); ?></a>
					</li>
					<?php
				} ?>

				<hr>
				<?php
				global $plugins;
				foreach ($plugins as $plugin) {
					if (file_exists(PLUGINS . "/" . $plugin . "/plugin.json")) {
						$data = json_decode(file_get_contents(PLUGINS . "/" . $plugin . "/plugin.json"), true);
						if (isset($data["config"])) {
							$config = $data["config"][0];
							if (isset($config['icon']) && isset($config['title'])) {
								echo('<li><a data-panel="' . $plugin . '"><i class="' . $config['icon'] . '"></i>' . i18n($config['title']) . '</a></li>');
							}
						}

					}
				}
				?>
			</menu>
			<panel>
				<?php include("panels/editor.php"); ?>
			</panel>

		</div>
		<toolbar>
			<?php echo i18n("settings_autosave"); ?>
		</toolbar>
		<?php
		break;


	case "loadPanel":
		$panel = POST("panel");
		if (file_exists(__DIR__ . "/panels/$panel.php")) {
			include(__DIR__ . "/panels/$panel.php");
		} elseif (file_exists("plugins/$panel/settings.php")) {
			include("plugins/$panel/settings.php");
		} else {
			echo $panel;
		}

		break;

	//////////////////////////////////////////////////////////////////////////80
	// Default: Invalid Action
	//////////////////////////////////////////////////////////////////////////80
	default:
		Common::send("error", "Invalid action.");
		break;
}