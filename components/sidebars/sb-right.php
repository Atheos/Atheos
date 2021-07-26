<?php

$access = Common::checkAccess("configure");

// Right Bar
$right_bar = file_get_contents(COMPONENTS . "/sidebars/right_bar.json");
$right_bar = json_decode($right_bar, true);

$pluginHTML = "";

foreach ($plugins as $plugin) {
	if (!file_exists(PLUGINS . "/" . $plugin . "/plugin.json")) continue;

	$data = file_get_contents(PLUGINS . "/" . $plugin . "/plugin.json");
	$data = json_decode($data, true);
	if (!isset($data['rightbar'])) continue;

	foreach ($data['rightbar'] as $rightbar) {
		if (!$access && isset($rightbar['admin']) && $rightbar['admin']) continue;


		if (isset($rightbar['action']) && isset($rightbar['icon']) && isset($rightbar['title'])) {
			$pluginHTML .= '<a onclick="'.$rightbar['action'].'"><i class="'.$rightbar['icon'].'"></i>'.$rightbar['title'].'</a>';
		}
	}

}

?>
<div id="SBRIGHT" class="sidebar">

	<div class="handle">
		<span>|||</span>
	</div>

	<div class="title">
		<i class="lock fas fa-lock"></i>
	</div>

	<div class="content">
		<?php
		////////////////////////////////////////////////////////////
		// Load Right Bar
		////////////////////////////////////////////////////////////
		foreach ($right_bar as $item_rb => $data) {
			$data["admin"] = isset($data["admin"]) ? $data["admin"] : false;

			if ($data['title'] === 'break') {
				if (!$data['admin'] && $access) {
					echo("<hr>");
				}
			} elseif ($data['title'] != 'pluginbar' && $data['onclick'] == '') {
				if (!$data['admin'] || $access) {
					echo("<label class=\"category\">" . i18n($data["title"]) . "</label>");
				}
			} elseif ($data['title'] === 'pluginbar') {
				if (!$data['admin'] || $access) {
					echo($pluginHTML);
				}
			} else {
				if (!$data['admin'] || $access) {
					echo('<a onclick="'.$data['onclick'].'"><i class="'.$data['icon'].'"></i>'.i18n($data['title']).'</a>');
				}
			}
		} ?>
		<hint id="last_login"><i class="fas fa-clock"></i><span>Last Login: DateTime</span></hint>
	</div>
</div>