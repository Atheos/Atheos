<?php

//////////////////////////////////////////////////////////////////////////////80
// Project Dialog
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once("class.project.php");

$path = POST("path");
$name = POST("name");

$Project = new Project();

$projects = $Project->listProjects();


switch ($action) {

	//////////////////////////////////////////////////////////////
	// List Projects Mini Sidebar
	//////////////////////////////////////////////////////////////
	case "projectDock":
		$projectList = "";
		ksort($projects);
		foreach ($projects as $projectName => $projectPath) {
			$projectList .= "<li data-project=\"$projectPath\"><i class=\"fas fa-archive\"></i>$projectName</li>" . PHP_EOL;
		}
		echo("<ul>$projectList</ul>");

		break;

	//////////////////////////////////////////////////////////////
	// List Projects
	//////////////////////////////////////////////////////////////

	case "list":

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
			$activeName = SESSION("projectName");
			foreach ($projects as $projectName => $projectPath) {
				?>
				<tr>
					<td class="action"><a onclick="atheos.project.open('<?php echo("$projectName', '$projectPath"); ?>');" class="fas fa-archive blue"></a></td>
					<td><?php echo($projectName); ?></td>
					<td><?php echo($projectPath); ?></td>
					<?php
					if (Common::checkAccess("configure")) {
						if ($activeName === $projectName) {
							?>
							<td class="action"><a onclick="atheos.toast.show('error', 'Active Project Cannot Be Removed');" class="fas fa-ban"></a></td>
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
	case "create": ?>
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
	case "rename": ?>
		<label class="title"><i class="fas fa-pencil-alt"></i><?php echo i18n("project_rename"); ?></label>
		<form>
			<input type="text" name="projectName" autofocus="autofocus" autocomplete="off" value="<?php echo($name); ?>">
			<button class="btn-left"><?php echo i18n("rename"); ?></button>&nbsp;<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php echo i18n("cancel"); ?></button>
		</form>
		<?php break;

	//////////////////////////////////////////////////////////////////////
	// Delete Project
	//////////////////////////////////////////////////////////////////////
	case "delete": ?>
		<label class="title"><i class="fas fa-trash-alt"></i><?php echo i18n("project_confirm"); ?></label>
		<form>
			<table class="project-delete">
				<tr>
					<td width="50%"><?php echo i18n("name"); ?></td>
					<td>
						<pre><?php echo($name); ?></pre>

					</td>
				</tr>
				<tr>
					<td><?php echo i18n("path"); ?></td>
					<td>
						<pre><?php echo($path); ?></pre>
					</td>
				</tr>
				<tr>
					<td><?php echo i18n("delete_scope"); ?></td>
					<td>
						<toggle>
							<input id="delete_hard" value="hard" name="scope" type="radio" />
							<label for="delete_hard"><?php echo i18n("true"); ?></label>
							<input id="delete_soft" value="soft" name="scope" type="radio" checked />
							<label for="delete_soft"><?php echo i18n("false") ?></label>
						</toggle>
					</td>
				</tr>
			</table>
			<toolbar>
				<button class="btn-left"><?php echo i18n("confirm"); ?></button>
				<button class="btn-right" onclick="atheos.project.list();return false;"><?php echo i18n("cancel"); ?></button>
			</toolbar>
		</form>
		<?php break;

}
?>