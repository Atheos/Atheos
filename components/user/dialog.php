<?php

//////////////////////////////////////////////////////////////////////////////80
// User
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

switch ($_GET['action']) {

	//////////////////////////////////////////////////////////////
	// List Projects
	//////////////////////////////////////////////////////////////

	case 'list':

		$projects_assigned = false;
		if (!checkAccess()) {
			?>
			<label><?php i18n("Restricted"); ?></label>
			<pre><?php i18n("You can not edit the user list"); ?></pre>
			<button onclick="atheos.modal.unload();return false;"><?php i18n("Close"); ?></button>
			<?php
		} else {
			?>
			<h1><i class="fas fa-user-alt"></i><?php i18n("User List"); ?></h1>

			<table width="100%" style="word-wrap: break-word;word-break: break-all;">
				<th width="150"><?php i18n("Username"); ?></th>
				<th width="85"><?php i18n("Password"); ?></th>
				<th width="75"><?php i18n("Projects"); ?></th>
				<th width="70"><?php i18n("Delete"); ?></th>
				<?php

				// Get projects JSON data
				$users = getJSON('users.php');
				foreach ($users as $user => $data) {
					?>
					<tr>
						<td><?php echo($data['username']); ?></td>
						<td class="action"><a onclick="atheos.user.changePassword('<?php echo($data['username']); ?>');" class="fas fa-key"></a></td>
						<td class="action"><a onclick="atheos.user.showUserACL('<?php echo($data['username']); ?>');" class="fas fa-archive"></a></td>
						<?php
						if ($_SESSION['user'] == $data['username']) {
							?>
							<td class="action"><a onclick="atheos.toast.show('error', 'You Cannot Delete Your Own Account');" class="fas fa-ban"></a></td>
							<?php
						} else {
							?>
							<td class="action"><a onclick="atheos.user.delete('<?php echo($data['username']); ?>');" class="fas fa-trash-alt"></a></td>
							<?php
						}
						?>
					</tr>
					<?php
				}
				?>
			</table>
			<button class="btn-left" onclick="atheos.user.create();"><?php i18n("New Account"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload();return false;"><?php i18n("Close"); ?></button>
			<?php
		}

		break;

	//////////////////////////////////////////////////////////////////////
	// Create New User
	//////////////////////////////////////////////////////////////////////

	case 'create':

		?>
		<form>
			<label><?php i18n("Username"); ?></label>
			<input type="text" name="username" autofocus="autofocus" autocomplete="off">
			<label><?php i18n("Password"); ?></label>
			<input type="password" name="password1">
			<label><?php i18n("Confirm Password"); ?></label>
			<input type="password" name="password2">
			<button class="btn-left"><?php i18n("Create Account"); ?></button>
			<button class="btn-right" onclick="atheos.user.list();return false;"><?php i18n("Cancel"); ?></button>
		</form>
		<?php
		break;

	//////////////////////////////////////////////////////////////////////
	// Set Project Access
	//////////////////////////////////////////////////////////////////////

	case 'projects':

		// Get project list
		$projects = getJSON('projects.php');
		$users = Common::readJSON("users");
		$username = Common::data("username");
		// Get control list (if exists)
		$projects_assigned = false;
		if (file_exists(BASE_PATH . "/data/" . $username . '_acl.php')) {
			$projects_assigned = getJSON($username . '_acl.php');
		}

		$userACL = false;
		foreach ($users as $user => $data) {
			if ($username === $data['username']) {
				$userACL = $data['userACL'] == "full" ? false : $data["userACL"];
			}
		}

		?>
		<form>
			<input type="hidden" name="username" value="<?php echo($username); ?>">
			<label><?php i18n("Project Access for "); ?><?php echo(ucfirst($username)); ?></label>
			<select id="aclSelect" name="acl" onchange="atheos.user.toggleACL()">
				<option value="false" <?php if (!$userACL) { echo('selected="selected"'); } ?>><?php i18n("Access ALL Projects"); ?></option>
				<option value="true" <?php if ($userACL) { echo('selected="selected"'); } ?>><?php i18n("Only Selected Projects"); ?></option>
			</select>
			<div id="projectSelect" <?php if (!$userACL) { echo('style="display: none;"'); } ?>>
				<table>
					<?php
					// Build list
					foreach ($projects as $project => $data) {
						$sel = '';
						if ($userACL && in_array($data['path'], $userACL)) {
							$sel = 'checked="checked"';
						}
						echo('<tr><td width="5"><input type="checkbox" name="project" '.$sel.' id="'.$data['path'].'" value="'.$data['path'].'"></td><td>'.$data['name'].'</td></tr>');
					}
					?>
				</table>
			</div>
			<button class="btn-left"><?php i18n("Confirm"); ?></button>
			<button class="btn-right" onclick="atheos.user.list();return false;"><?php i18n("Close"); ?></button>
		</form>
		<?php
		break;

	//////////////////////////////////////////////////////////////////////
	// Delete User
	//////////////////////////////////////////////////////////////////////

	case 'delete':

		?>
		<form>
			<input type="hidden" name="username" value="<?php echo($_GET['username']); ?>">
			<label><?php i18n("Confirm User Deletion"); ?></label>
			<pre><?php i18n("Account:"); echo($_GET['username']); ?></pre>
			<button class="btn-left"><?php i18n("Confirm"); ?></button>
			<button class="btn-right" onclick="atheos.user.list();return false;"><?php i18n("Cancel"); ?></button>
		</form>
		<?php
		break;

	//////////////////////////////////////////////////////////////////////
	// Change Password
	//////////////////////////////////////////////////////////////////////

	case 'password':
		$username = Common::data("username");
		
		if (!$username || $username === "undefined") {
			$username = Common::data("user", "session");
		}

		$username = ucfirst($username);

		?>
		<form>
			<input type="hidden" name="username" value="<?php echo($username); ?>">
			<label><?php i18n("New Password"); ?></label>
			<input type="password" name="password1" autofocus="autofocus">
			<label><?php i18n("Confirm Password"); ?></label>
			<input type="password" name="password2">
			<button class="btn-left"><?php i18n("Change %{username}%&apos;s Password", array("username" => $username)) ?></button>
			<button class="btn-right" onclick="atheos.modal.unload();return false;"><?php i18n("Cancel"); ?></button>
		</form>
		<?php
		break;

}

?>