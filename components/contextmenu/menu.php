<div id="contextmenu" data-path="" data-type="">

	<?php

	////////////////////////////////////////////////////////////
	// Load Context Menu
	////////////////////////////////////////////////////////////

	foreach ($context_menu as $menuItem => $data) {
		if ($data['enabled']) {
			if ($data['title'] == 'Break') {
				echo('<hr class="'.$data['applies-to'].'">');
			} else {
				echo('<a class="'.$data['applies-to'].'" onclick="'.$data['onclick'].'"><i class="'.$data['icon'].'"></i>'.i18n($data['title'], 'return').'</a>');
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
							echo('<hr class="'.$contextmenu['applies-to'].'">');
							echo('<a class="'.$contextmenu['applies-to'].'" onclick="'.$contextmenu['action'].'"><i class="'.$contextmenu['icon'].'"></i>'.$contextmenu['title'].'</a>');
						}
					}
				}
			}
		}
	} ?>

</div>