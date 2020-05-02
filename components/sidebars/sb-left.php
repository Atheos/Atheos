<div id="sb_left" class="sidebar">

	<div class="handle">
		<span>|||</span>
	</div>

	<div class="title">
		<h2> <?php i18n("File Manager"); ?> </h2>

		<div id="filter_wrapper">
			<i id="filter_options" class="fas fa-cog"></i>
			<i id="filter_close" class="fas fa-times-circle"></i>

			<input id="filter_input" placeholder="<?php i18n("Filter Tree") ?>" type="text">

			<ul id="filter_strategy" class="options-menu" style="display:none;">
				<li class="active"><a data-option="left_prefix"><?php i18n("Prefix"); ?></a></li>
				<li><a data-option="substring"><?php i18n("Substring"); ?></a></li>
				<li><a data-option="regexp"><?php i18n("Regular expression"); ?></a></li>
				<!--<li><a data-action="search"><?php i18n("Search File Contents"); ?></a></li>-->
			</ul>
		</div>

		<i class="lock fas fa-lock"></i>
		<i id="open_probe" class="fas fa-search"></i>
		<i id="filter_open"class="fas fa-filter"></i>

	</div>

	<div class="content">

		<div id="file-manager"></div>

	</div>

	<div id="project_list">

		<div class="title">
			<h2><?php i18n("Projects"); ?></h2>
			<i id="projects-collapse" class="fas fa-chevron-circle-down" alt="<?php i18n("Collapse"); ?>"></i>
			<?php if (Common::checkAccess("configure")) {
				?>
				<i id="projects-manage" class="fas fa-archive"></i>
				<i id="projects-create" class="fas fa-plus-circle" alt="<?php i18n("Create Project"); ?>"></i>
				<?php
			} ?>
		</div>

		<div class="content"></div>

	</div>



</div>