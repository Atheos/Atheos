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

require_once('../../common.php');

//////////////////////////////////////////////////////////////////
// Verify Session or Key
//////////////////////////////////////////////////////////////////
checkSession();

$action = Common::data("action");
$user = Common::data("user", "session");

$path = Common::data("path");
$name = Common::data("name");

if (!$action) {
	Common::sendJSON("E401m");
	die;
}

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

		<?php

		break;

	//////////////////////////////////////////////////////////////
	// List Projects
	//////////////////////////////////////////////////////////////

	case 'list':

		// Get access control data
		$projects_assigned = false;
		if (file_exists(BASE_PATH . "/data/" . $_SESSION['user'] . '_acl.php')) {
			$projects_assigned = getJSON($_SESSION['user'] . '_acl.php');
		}

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
		<h1><i class="fas fa-archive"></i><?php i18n("Project List"); ?></h1>

		<form>
			<div id="project-list">
				<table>
					<tr>
						<th class="action"><?php i18n("Open"); ?></th>
						<th><?php i18n("Project Name"); ?></th>
						<th><?php i18n("Path"); ?></th>
						<?php if (checkAccess("configure")) {
							?>
							<th class="action"><?php i18n("Delete"); ?></th>
							<th class="action"><?php i18n("Rename"); ?></th>
							<?php
						} ?>
					</tr>
					<?php
					$activeProject = Common::data("project", "session");
					foreach ($projectList as $projectPath => $projectName) {
						?>
						<tr>
							<td class="action"><a onclick="atheos.project.open('<?php echo($projectPath); ?>');" class="fas fa-archive"></a></td>
							<td><?php echo($projectName); ?></td>
							<td><?php echo($projectPath); ?></td>
							<?php
							if (checkAccess()) {
								if ($activeProject == $projectPath) {
									?>
									<td class="action"><a onclick="atheos.toast.show('error, 'Active Project Cannot Be Removed');" class="fas fa-ban"></a></td>
									<?php
								} else {
									?>
									<td class="action"><a onclick="atheos.project.delete('<?php echo($projectName); ?>','<?php echo($projectPath); ?>');" class="fas fa-trash-alt"></a></td>
									<?php
								}
								?>
								<td class="action"><a onclick="atheos.project.rename('<?php echo($projectName); ?>','<?php echo($projectPath); ?>');" class="fas fa-pencil-alt"></a></td>
								<?php
							}
							?>
						</tr>
						<?php

					}
					?>
				</table>
			</div>
			<?php if (checkAccess("configure")) {
				?><button class="btn-left" onclick="atheos.project.create();"><?php i18n("New Project"); ?></button><?php
			} ?>
		</form>
		<?php

		break;

	//////////////////////////////////////////////////////////////////////
	// Create New Project
	//////////////////////////////////////////////////////////////////////

	case 'create':

		?>
		<form style="width: 500px;">
			<label><?php i18n("Project Name"); ?></label>
			<input name="projectName" autofocus="autofocus" autocomplete="off">
			<label><?php i18n("Folder Name or Absolute Path"); ?></label>
			<input name="projectPath" autofocus="off" autocomplete="off">

			<!-- Clone From GitHub -->
			<!--<div style="width: 500px;">-->
				<table style="display: none;" id="git_options">
					<tr>
						<td>
							<label><?php i18n("Git Repository"); ?></label>
							<input name="gitRepo">
						</td>
						<td width="5%">&nbsp;</td>
						<td width="25%">
							<label><?php i18n("Branch"); ?></label>
							<input name="gitBranch" value="master">
						</td>
					</tr>
					<tr>
						<td colspan="3" class="note"><?php i18n("Note: This will only work if your Git repo DOES NOT require interactive authentication and your server has git installed."); ?></td>
					</tr>
				</table>
			<!--// </div>-->
			<button class="btn-left"><?php i18n("Create Project"); ?></button>
			<button id="show_git_options" class="btn-mid"><?php i18n("...From Git Repo"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php i18n("Cancel"); ?></button>
		</form>
		<?php
		break;

	//////////////////////////////////////////////////////////////////
	// Rename
	//////////////////////////////////////////////////////////////////
	case 'rename':
		?>
		<form>
			<label><i class="fas fa-pencil-alt"></i><?php i18n("Rename Project"); ?></label>
			<input type="text" name="projectName" autofocus="autofocus" autocomplete="off" value="<?php echo($projectName); ?>">
			<button class="btn-left"><?php i18n("Rename"); ?></button>&nbsp;<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php i18n("Cancel"); ?></button>
		</form>
		<?php
		break;

	//////////////////////////////////////////////////////////////////////
	// Delete Project
	//////////////////////////////////////////////////////////////////////

	case 'delete':

		?>
		<form>
			<label><?php i18n("Confirm Project Deletion"); ?></label>
			<pre><?php i18n("Name:"); ?> <?php echo($projectName); ?>, <?php i18n("Path:") ?> <?php echo($projectPath); ?></pre>
			<table>
				<tr><td width="5"><input type="checkbox" name="delete" id="delete" value="true"></td><td><?php i18n("Delete Project Files"); ?></td></tr>
				<tr><td width="5"><input type="checkbox" name="follow" id="follow" value="true"></td><td><?php i18n("Follow Symbolic Links "); ?></td></tr>
			</table>
			<button class="btn-left"><?php i18n("Confirm"); ?></button><button class="btn-right" onclick="atheos.project.list();return false;"><?php i18n("Cancel"); ?></button>
		</form>

		<?php
		break;

}

?>