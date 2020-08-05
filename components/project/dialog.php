<?php

//////////////////////////////////////////////////////////////////////////////80
// Project Dialog
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

$user = Common::data("user", "session");

$path = Common::data("path");
$name = Common::data("name");

switch ($action) {

	//////////////////////////////////////////////////////////////
	// List Projects Mini Sidebar
	//////////////////////////////////////////////////////////////
	case 'projectDock':

		// Get access control data
		$userACL = Common::readJSON("users")[$user]["userACL"];
		// Get projects JSON data
		$projects = Common::readJSON('projects');
		asort($projects);
		$projectList = '';
		foreach ($projects as $projectPath => $projectName) {
			if ($userACL === "full" || in_array($projectPath, $userACL)) {
				$projectList .= "<li data-project=\"$projectPath\"><i class=\"fas fa-archive\"></i> $projectName</li>" . PHP_EOL;
			}
		}
		?>

		<ul>
			<?php echo($projectList); ?>
		</ul>

		<?php break;

	//////////////////////////////////////////////////////////////
	// List Projects
	//////////////////////////////////////////////////////////////

	case 'list':

		$userACL = Common::readJSON("users")[$user]["userACL"];
		// Get projects JSON data
		$projects = Common::readJSON('projects');
		asort($projects);
		$projectList = array();
		foreach ($projects as $projectPath => $projectName) {
			if ($userACL === "full" || in_array($projectPath, $userACL)) {
				$projectList[$projectPath] = $projectName;
			}
		}

		?>
		<label class="title"><i class="fas fa-archive"></i><?php echo i18n("project_list"); ?></label>
			<table id="project-list">
				<tr>
					<th class="action"><?php echo i18n("open"); ?></th>
					<th><?php echo i18n("project_name"); ?></th>
					<th><?php echo i18n("path"); ?></th>
					<?php if (Common::checkAccess("configure")) {
						?>
						<th class="action"><?php echo i18n("delete"); ?></th>
						<th class="action"><?php echo i18n("rename"); ?></th>
						<?php
					} ?>
				</tr>
				<?php
				$activeProject = Common::data("project", "session");
				foreach ($projectList as $projectPath => $projectName) {
					?>
					<tr>
						<td class="action"><a onclick="atheos.project.open('<?php echo($projectPath); ?>');" class="fas fa-archive blue"></a></td>
						<td><?php echo($projectName); ?></td>
						<td><?php echo($projectPath); ?></td>
						<?php
						if (Common::checkAccess("configure")) {
							if ($activeProject == $projectPath) {
								?>
								<td class="action"><a onclick="atheos.toast.show('error, 'Active Project Cannot Be Removed');" class="fas fa-ban"></a></td>
								<?php
							} else {
								?>
								<td class="action"><a onclick="atheos.project.delete('<?php echo($projectName); ?>','<?php echo($projectPath); ?>');" class="fas fa-trash-alt metal"></a></td>
								<?php
							}
							?>
							<td class="action"><a onclick="atheos.project.rename('<?php echo($projectName); ?>','<?php echo($projectPath); ?>');" class="fas fa-pencil-alt orange"></a></td>
							<?php
						}
						?>
					</tr>
					<?php

				}
				?>
			</table>
			<?php if (Common::checkAccess("configure")) {
				?>
				<toolbar>
					<button class="btn-left" onclick="atheos.project.create();"><?php echo i18n("project_new"); ?></button>
				</toolbar>
				<?php
			} ?>
		<?php break;

	//////////////////////////////////////////////////////////////////////
	// Create New Project
	//////////////////////////////////////////////////////////////////////
	case 'create': ?>
		<form style="width: 500px;">
			<label><?php echo i18n("project_name"); ?></label>
			<input name="projectName" autofocus="autofocus" autocomplete="off">
			<label><?php echo i18n("folderNameOrAbsolutePath"); ?></label>
			<input name="projectPath" autofocus="off" pattern="[A-Za-z0-9 \-\._\/]+" autocomplete="off" title="Please input a valid file path.">

			<!-- Clone From GitHub -->
			<table style="display: none;" id="git_options">
				<tr>
					<td>
						<label><?php echo i18n("gitRepository"); ?></label>
						<input name="gitRepo">
					</td>
					<td width="5%">&nbsp;</td>
					<td width="25%">
						<label><?php echo i18n("branch"); ?></label>
						<input name="gitBranch" value="master">
					</td>
				</tr>
				<tr>
					<td colspan="3" class="note"><?php echo i18n("project_gitnote"); ?></td>
				</tr>
			</table>
			<!--// </div>-->
			<button class="btn-left"><?php echo i18n("project_create"); ?></button>
			<button id="show_git_options" class="btn-mid"><?php echo i18n("market_install_gitRepo"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php echo i18n("cancel"); ?></button>
		</form>
		<?php break;

	//////////////////////////////////////////////////////////////////
	// Rename
	//////////////////////////////////////////////////////////////////
	case 'rename': ?>
		<form>
			<label><i class="fas fa-pencil-alt"></i><?php echo i18n("project_rename"); ?></label>
			<input type="text" name="projectName" autofocus="autofocus" autocomplete="off" value="<?php echo($name); ?>">
			<button class="btn-left"><?php echo i18n("rename"); ?></button>&nbsp;<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php echo i18n("cancel"); ?></button>
		</form>
		<?php break;

	//////////////////////////////////////////////////////////////////////
	// Delete Project
	//////////////////////////////////////////////////////////////////////
	case 'delete': ?>
		<form>
			<label><i class="fas fa-trash-alt"></i><?php echo i18n("project_confirm"); ?></label>
			<pre><?php echo i18n("name"); ?> <?php echo($name); ?>, <?php echo i18n("path") ?> <?php echo($path); ?></pre>
			<button class="btn-left"><?php echo i18n("confirm"); ?></button><button class="btn-right" onclick="atheos.project.list();return false;"><?php echo i18n("cancel"); ?></button>
		</form>
		<?php break;

}
?>
