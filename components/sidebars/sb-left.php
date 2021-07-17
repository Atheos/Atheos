<div id="SBLEFT" class="sidebar">

	<div class="handle">
		<span>|||</span>
	</div>

	<div class="title">
		<h2> <?php echo i18n("fileManager"); ?> </h2>

		<div id="filter_wrapper">
			<i id="filter_options" class="fas fa-cog"></i>
			<i id="filter_exit" class="fas fa-times-circle"></i>

			<input id="filter_input" placeholder="<?php echo i18n("filterTree") ?>" type="text">

			<ul id="filter_strategy" class="options-menu" style="display:none;">
				<li class="active"><a data-option="left_prefix"><?php echo i18n("prefix"); ?></a></li>
				<li><a data-option="substring"><?php echo i18n("substring"); ?></a></li>
				<li><a data-option="regexp"><?php echo i18n("regex"); ?></a></li>
			</ul>
		</div>

		<i class="lock fas fa-lock"></i>
		<i id="fm_toggle_hidden" class="fas fa-eye"></i>
		<i id="search_open" class="fas fa-search"></i>
		<i id="filter_open"class="fas fa-filter"></i>

	</div>

	<div class="content">

		<div id="file-manager"></div>

	</div>

	<div id="project_list">

		<div class="title">
			<h2><?php echo i18n("projects"); ?></h2>
			<i id="projects-collapse" class="fas fa-chevron-circle-down"></i>
			<?php if (Common::checkAccess("configure")) {
				?>
				<i id="projects-manage" class="fas fa-archive"></i>
				<i id="projects-create" class="fas fa-plus-circle" alt="<?php echo i18n("project_create"); ?>"></i>
				<?php


				if (DEVELOPMENT) {
					?>
					<i id="project-atheos" class="fas fa-code"></i>
					<?php

				}
			} ?>
		</div>

		<div class="content"></div>

	</div>



</div>