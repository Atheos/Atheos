<div id="sb-left" class="sidebar">
	<div id="sb-left-title">
		<i id="sb-left-lock" class="fas fa-lock"></i>
		<?php if (!common::isWINOS()) {
			?>
			<i id="finder-quick" class="fas fa-search"></i>
			<i id="tree-search" class="fas fa-search"></i>
			<h2 id="finder-label"> <?php i18n("Explore"); ?> </h2>
			<div id="finder-wrapper">
				<i id="finder-options" class="fas fa-cog"></i>
				<div id="finder-inner-wrapper">
					<input type="text" id="finder"></input>
			</div>
			<ul id="finder-options-menu" class="options-menu">
				<li class="chosen"><a data-option="left_prefix"><?php i18n("Prefix"); ?></a></li>
				<li><a data-option="substring"><?php i18n("Substring"); ?></a></li>
				<li><a data-option="regexp"><?php i18n("Regular expression"); ?></a></li>
				<li><a data-action="search"><?php i18n("Search File Contents"); ?></a></li>
			</ul>
		</div>
		<?php
	} ?>
</div>

<div class="sb-left-content">
	<div id="context-menu" data-path="" data-type="">

		<?php

		////////////////////////////////////////////////////////////
		// Load Context Menu
		////////////////////////////////////////////////////////////

		foreach ($context_menu as $menu_item => $data) {
			if ($data['title'] == 'Break') {
				echo('<hr class="'.$data['applies-to'].'">');
			} else {
				echo('<a class="'.$data['applies-to'].'" onclick="'.$data['onclick'].'"><i class="'.$data['icon'].'"></i>'.i18n($data['title'],'return').'</a>');
			}
		}

		foreach ($plugins as $plugin) {
			if (file_exists(PLUGINS . "/" . $plugin . "/plugin.json")) {
				$pdata = file_get_contents(PLUGINS . "/" . $plugin . "/plugin.json");
				$pdata = json_decode($pdata, true);
				if (isset($pdata[0]['contextmenu'])) {
					foreach ($pdata[0]['contextmenu'] as $contextmenu) {
						if ((!isset($contextmenu['admin']) || ($contextmenu['admin']) && checkAccess()) || !$contextmenu['admin']) {
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

	<div id="file-manager"></div>

	<ul id="list-active-files"></ul>

</div>

<div id="side-projects" class="sb-left-projects">
	<div id="project-list" class="sb-project-list">

		<div class="project-list-title">
			<h2><?php i18n("Projects"); ?></h2>
			<a id="projects-collapse" class="fas fa-chevron-circle-down" alt="<?php i18n("Collapse"); ?>"></a>
			<?php if (checkAccess()) {
				?>
				<a id="projects-manage" class="fas fa-archive"></a>
				<a id="projects-create" class="fas fa-plus-circle" alt="<?php i18n("Create Project"); ?>"></a>
				<?php
			} ?>
		</div>

		<div class="sb-projects-content"></div>

	</div>
</div>

<div id="sb-left-handle">
	<span>|||</span>
</div>

</div>