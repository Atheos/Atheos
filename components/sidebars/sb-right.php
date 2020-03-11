<?php
// Right Bar
$right_bar = file_get_contents(COMPONENTS . "/sidebars/right_bar.json");
$right_bar = json_decode($right_bar, true);
?>
<div id="sb-right" class="sidebar">

	<div id="sb-right-handle">
		<span>|||</span>
	</div>

	<div id="sb-right-title">
		<i id="sb-right-lock" class="fas fa-unlock"></i>
	</div>

	<div class="sb-right-content">

		<?php

		////////////////////////////////////////////////////////////
		// Load Right Bar
		////////////////////////////////////////////////////////////

		foreach ($right_bar as $item_rb => $data) {
			if (!isset($data['admin'])) {
				$data['admin'] = false;
			}
			if ($data['title'] == 'break') {
				if (!$data['admin'] || $data['admin'] && checkAccess()) {
					echo("<hr>");
				}
			} elseif ($data['title'] != 'break' && $data['title'] != 'pluginbar' && $data['onclick'] == '') {
				if (!$data['admin'] || $data['admin'] && checkAccess()) {
					echo("<div class=\"sb-right-category\">" . i18n($data["title"], "return") . "</div>");
				}
			} elseif ($data['title'] == 'pluginbar') {
				if (!$data['admin'] || $data['admin'] && checkAccess()) {
					foreach ($plugins as $plugin) {
						if (file_exists(PLUGINS . "/" . $plugin . "/plugin.json")) {
							$pdata = file_get_contents(PLUGINS . "/" . $plugin . "/plugin.json");
							$pdata = json_decode($pdata, true);
							if (isset($pdata[0]['rightbar'])) {
								foreach ($pdata[0]['rightbar'] as $rightbar) {
									if ((!isset($rightbar['admin']) || ($rightbar['admin']) && checkAccess()) || !$rightbar['admin']) {
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
				if (!$data['admin'] || $data['admin'] && checkAccess()) {
					echo('<a onclick="'.$data['onclick'].'"><i class="'.$data['icon'].'"></i>'.i18n($data['title'], "return").'</a>');
				}
			}
		} ?>

	</div>

	<!--<div class="sidebar-handle">-->
	<!--	<span>|||</span>-->
	<!--</div>-->
</div>