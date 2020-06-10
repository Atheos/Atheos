<?php

//////////////////////////////////////////////////////////////////////////////80
// User Dialog
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once('../../common.php');

//////////////////////////////////////////////////////////////////////////////80
// Verify Session or Key
//////////////////////////////////////////////////////////////////////////////80
Common::checkSession();

$action = Common::data("action");
$activeUser = Common::data("user", "session");
$username = Common::data("username");

if (!$action) {
	Common::sendJSON("E401m");
	die;
}

switch ($action) {

	//////////////////////////////////////////////////////////////////////////80
	// Change Password
	//////////////////////////////////////////////////////////////////////////80
	case 'changePassword':
		if (!$username || $username === "undefined") {
			$username = $activeUser;
		}

		if (!Common::checkAccess("configure") && $username !== $activeUser) {
			Common::sendJSON("E430u");
			die;
		}

		?>
		<label class="title"><i class="fas fa-key"></i><?php i18n("Change Password"); ?></label>
		<form>
			<label><?php i18n("New Password"); ?></label>
			<input type="password" name="password1" autofocus="autofocus">
			<i for="password1"  class="fas fa-eye-slash merged-icon togglePassword"></i>
			<label><?php i18n("Confirm Password"); ?></label>
			<input type="password" name="password2">
			<i for="password2" class="fas fa-eye-slash merged-icon togglePassword"></i>
			<button class="btn-left"><?php i18n("Change %{username}%&apos;s Password", array("username" => ucfirst($username))) ?></button>
			<button class="btn-right" onclick="atheos.modal.unload();return false;"><?php i18n("Cancel"); ?></button>
		</form>
		<?php
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Create New User
	//////////////////////////////////////////////////////////////////////////80
	case 'create':
		?>
		<label class="title"><i class="fas fa-plus-circle"></i><?php i18n("Create New User"); ?></label>
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

	//////////////////////////////////////////////////////////////////////////80
	// Delete User
	//////////////////////////////////////////////////////////////////////////80
	case 'delete':
		?>
		<label class="title"><i class="fas fa-trash-alt"></i><?php i18n("Confirm User Deletion"); ?></label>
		<form>
			<pre><?php i18n("Account:"); echo(ucfirst($username)); ?></pre>
			<toolbar>
				<button class="btn-left"><?php i18n("Confirm"); ?></button>
			</toolbar>

		</form>
		<?php
		break;

	//////////////////////////////////////////////////////////////////////////80
	// List Projects
	//////////////////////////////////////////////////////////////////////////80
	case 'list':

		if (!Common::checkAccess("configure")) {
			?>
			<h1><?php i18n("Restricted"); ?></h1>
			<pre><?php i18n("You can not edit the user list"); ?></pre>
			<button onclick="atheos.modal.unload();return false;"><?php i18n("Close"); ?></button>
			<?php
		} else {
			?>
			<label class="title"><i class="fas fa-user-alt"></i><?php i18n("User List"); ?></label>

			<table width="100%" style="word-wrap: break-word;word-break: break-all;">
				<th width="150"><?php i18n("Username"); ?></th>
				<th width="85"><?php i18n("Password"); ?></th>
				<th width="75"><?php i18n("Projects"); ?></th>
				<th width="70"><?php i18n("Delete"); ?></th>
				<?php

				$users = Common::readJSON('users');
				foreach ($users as $user => $data) {
					?>
					<tr>
						<td><?php echo(ucfirst($user)); ?></td>
						<td class="center"><a onclick="atheos.user.changePassword('<?php echo($user); ?>');" class="fas fa-key orange"></a></td>
						<td class="center"><a onclick="atheos.user.showUserACL('<?php echo($user); ?>');" class="fas fa-archive blue"></a></td>
						<?php
						if ($activeUser == $user) {
							?>
							<td class="center"><a onclick="atheos.toast.show('error', 'You Cannot Delete Your Own Account');" class="fas fa-ban"></a></td>
							<?php
						} else {
							?>
							<td class="center"><a onclick="atheos.user.delete('<?php echo($user); ?>');" class="fas fa-trash-alt metal"></a></td>
							<?php
						}
						?>
					</tr>
					<?php
				}
				?>
			</table>
			<toolbar>
				<button class="btn-left" onclick="atheos.user.create();"><?php i18n("New Account"); ?></button>
			</toolbar>
			<?php
		}
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Set Project Access
	//////////////////////////////////////////////////////////////////////////80
	case 'showUserACL':

		// Get project list
		$projects = Common::readJSON('projects');
		$users = Common::readJSON("users");
		$userACL = $users[$username]["userACL"];
		// Get control list (if exists)

		?>
		<label class="title"><i class="fas fa-user-alt"></i><?php i18n("User Project Access"); ?></label>
		<form>
			<label><?php i18n("Project Access for "); ?><?php echo(ucfirst($username)); ?></label>
			<select id="aclSelect" name="userACL" onchange="atheos.user.toggleACL()">
				<option value="full" <?php if ($userACL === "full") { echo('selected="selected"'); } ?>><?php i18n("Access ALL Projects"); ?></option>
				<option value="limited" <?php if ($userACL !== "full") { echo('selected="selected"'); } ?>><?php i18n("Only Selected Projects"); ?></option>
			</select>
			<div id="projectSelect" <?php if ($userACL === "full") { echo('style="display: none;"'); } ?>>
				<table>
					<?php
					// Build list
					foreach ($projects as $projectPath => $projectName) {
						$sel = '';
						if ($userACL !== "full" && in_array($projectPath, $userACL)) {
							$sel = 'checked="checked"';
						}
						echo("<tr><td width=\"5\"><input type=\"checkbox\" class=\"large\" name=\"project\" $sel value=\"$projectPath\"></td><td>$projectName</td></tr>");
					}
					?>
				</table>
			</div>
			<toolbar>
				<button class="btn-left"><?php i18n("Update"); ?></button>
			</toolbar>
		</form>
		<?php
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Default: Invalid Action
	//////////////////////////////////////////////////////////////////////////80
	default:
		Common::sendJSON("E401i");
		break;
}