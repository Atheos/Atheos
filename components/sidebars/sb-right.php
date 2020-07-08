<?php
// Right Bar
$right_bar = file_get_contents(COMPONENTS . "/sidebars/right_bar.json");
$right_bar = json_decode($right_bar, true);
?>
<div id="sb_right" class="sidebar">

	<div class="handle unlocked">
		<span>|||</span>
	</div>

	<div class="title">
		<i class="lock fas fa-unlock"></i>
	</div>

	<div class="content">

		<?php

		////////////////////////////////////////////////////////////
		// Load Right Bar
		////////////////////////////////////////////////////////////
		$access = Common::checkAccess("configure");
		foreach ($right_bar as $item_rb => $data) {
			$data["admin"] = isset($data["admin"]) ? $data["admin"] : false;

			if ($data['title'] === 'break') {
				if (!$data['admin'] && $access) {
					echo("<hr>");
				}
			} elseif ($data['title'] != 'pluginbar' && $data['onclick'] == '') {
				if (!$data['admin'] || $access) {
					echo("<label class=\"category\">" . i18n($data["title"], "return") . "</label>");
				}
			} elseif ($data['title'] === 'pluginbar') {
				if (!$data['admin'] || $access) {
					foreach ($plugins as $plugin) {
						if (file_exists(PLUGINS . "/" . $plugin . "/plugin.json")) {
							$pdata = file_get_contents(PLUGINS . "/" . $plugin . "/plugin.json");
							$pdata = json_decode($pdata, true);
							if (isset($pdata['rightbar'])) {
								foreach ($pdata['rightbar'] as $rightbar) {
									if ((!isset($rightbar['admin']) || ($rightbar['admin']) && $access) || !$rightbar['admin']) {
										if (isset($rightbar['action']) && isset($rightbar['icon']) && isset($rightbar['title'])) {
											echo('<a onclick="'.$rightbar['action'].'"><i class="'.$rightbar['icon'].'"></i>'.i18n($rightbar['title'], "return").'</a>');
										}
									}
								}
								//echo("<hr>");
							}
						}
					}
				}
			} else {
				if (!$data['admin'] || $access) {
					echo('<a onclick="'.$data['onclick'].'"><i class="'.$data['icon'].'"></i>'.i18n($data['title'], "return").'</a>');
				}
			}
		} ?>
		<hint id="last_login"><i class="fas fa-clock"></i><span>Last Login: DateTime</span></hint>
	</div>
</div>