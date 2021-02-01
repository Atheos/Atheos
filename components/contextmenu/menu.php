<div id="contextmenu" data-path="" data-type="">
	<?php

	// Context Menu
	$context_menu = file_get_contents(COMPONENTS . "/contextmenu/context_menu.json");
	$context_menu = json_decode($context_menu, true);

	////////////////////////////////////////////////////////////
	// Load Context Menu
	////////////////////////////////////////////////////////////
	echo("\t\t\t");
	foreach ($context_menu as $menuItem => $data) {
		if ($data['enabled']) {
			if (isset($data['title'])) {
				echo('<a class="'.$data['applies-to'].'" onclick="'.$data['onclick'].'"><i class="'.$data['icon'].'"></i>'.i18n($data['title'], 'return')."</a>\n\t\t\t\t");
			} else {
				echo('<hr class="'.$data['applies-to']."\">\n\t\t\t\t");
			}
		}
	}

	foreach ($plugins as $plugin) {
		if (file_exists(PLUGINS . "/" . $plugin . "/plugin.json")) {
			$pdata = file_get_contents(PLUGINS . "/" . $plugin . "/plugin.json");
			$pdata = json_decode($pdata, true);
			if (isset($pdata['contextmenu'])) {
				foreach ($pdata['contextmenu'] as $contextmenu) {
					if ((!isset($contextmenu['admin']) || ($contextmenu['admin']) && Common::checkAccess("configure")) || !$contextmenu['admin']) {
						if (isset($contextmenu['applies-to']) && isset($contextmenu['action']) && isset($contextmenu['icon']) && isset($contextmenu['title'])) {
							echo('<hr class="'.$contextmenu['applies-to']."\">\n\t\t\t\t");
							echo('<a class="'.$contextmenu['applies-to'].'" onclick="'.$contextmenu['action'].'"><i class="'.$contextmenu['icon'].'"></i>'.$contextmenu['title']."</a>\n\t\t\t\t");
						}
					}
				}
			}
		}
	} ?>
</div>