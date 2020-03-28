<div id="sb-left" class="sidebar">
	<div id="sb-left-title">
		<h2> <?php i18n("File Manager"); ?> </h2>

		<div id="filter_wrapper">
			<i id="filter_options" class="fas fa-cog"></i>
			<i id="filter_close" class="fas fa-times-circle"></i>

			<input id="filter_input" placeholder="<?php i18n("Filter Tree") ?>" type="text">

			<ul id="filter_strategy" class="options-menu">
				<li class="active"><a data-option="left_prefix"><?php i18n("Prefix"); ?></a></li>
				<li><a data-option="substring"><?php i18n("Substring"); ?></a></li>
				<li><a data-option="regexp"><?php i18n("Regular expression"); ?></a></li>
				<!--<li><a data-action="search"><?php i18n("Search File Contents"); ?></a></li>-->
			</ul>
		</div>

		<i id="sb-left-lock" class="fas fa-lock"></i>
		<i id="open_probe" class="fas fa-search"></i>
		<i id="filter_open"class="fas fa-filter"></i>

	</div>

	<div class="sb-left-content">

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