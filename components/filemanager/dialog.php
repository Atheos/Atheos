<?php

//////////////////////////////////////////////////////////////////////////////80
// Filmanager Dialog
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
$path = Common::data("path");
$name = Common::data("name");

$type = Common::data("type");


if (!$action) {
	Common::sendJSON("E401m");
	die;
}
switch ($action) {

	//////////////////////////////////////////////////////////////////////////80
	// Create
	//////////////////////////////////////////////////////////////////////////80
	case 'create':
		?>
		<form>
			<h3><i class="fas fa-plus-circle"></i><?php echo i18n("New " . (ucfirst($type))); ?></h3>
			<input type="text" name="nodeName" autofocus="autofocus" autocomplete="off" pattern="[A-Za-z0-9 \-\._]+" title="Letters, Numbers, Dashes, Underscores, Spaces or Periods Only">
			<button class="btn-left"><?php i18n("Create"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php i18n("Cancel"); ?></button>
		</form>
		<?php
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Rename
	//////////////////////////////////////////////////////////////////////////80
	case 'rename':
		?>
		<form>
			<h3><i class="fas fa-pencil-alt"></i> <?php i18n("Rename"); ?> <?php echo i18n((ucfirst($type))); ?></h3>
			<input type="text" name="name" autofocus="autofocus" autocomplete="off" pattern="[A-Za-z0-9 \-\._]+" title="Letters, Numbers, Dashes, Underscores, Spaces or Periods Only" value="<?php echo($name); ?>">
			<button class="btn-left"><?php i18n("Rename"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php i18n("Cancel"); ?></button>
		</form>

	</form>
	<?php
	break;

	//////////////////////////////////////////////////////////////////////////80
	// Duplicate
	//////////////////////////////////////////////////////////////////////////80
	case 'duplicate':
		?>
		<form>
			<h3><i class="fa fa-clone"></i> <?php i18n("Duplicate"); ?> <?php echo i18n((ucfirst($type))); ?></h3>
			<p>
				Enter new name:
			</p>
			<input type="text" name="clone" autofocus="autofocus" autocomplete="off" value="<?php echo($name); ?>">
			<button class="btn-left"><?php i18n("Duplicate"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php i18n("Cancel"); ?></button>
		</form>

		<?php
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Delete
	//////////////////////////////////////////////////////////////////////////80
	case 'delete':
		if (!Common::isAbsPath($path)) {
			$path .= "/";
		}
		?>
		<form>
			<h3><i class="fas fa-trash-alt"></i><?php i18n("Are you sure you wish to delete the following:"); ?></h3>
			<pre><?php echo($path); ?></pre>
			<button class="btn-left"><?php i18n("Delete"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload();return false;"><?php i18n("Cancel"); ?></button>
		</form>

		<?php
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Preview
	//////////////////////////////////////////////////////////////////////////80
	case 'preview':
		?>
		<form>
			<h3><i class="fas fa-eye"></i><?php i18n("Inline Preview"); ?></h3>
			<div>
				<br><br><img src="<?php echo(str_replace(BASE_PATH . "/", "", WORKSPACE) . "/" . $path); ?>"><br><br>
			</div>
			<button class="btn-right" onclick="atheos.modal.unload();return false;"><?php i18n("Close"); ?></button>
		</form>

		<?php
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Overwrite
	//////////////////////////////////////////////////////////////////////////80
	case 'overwrite':
		if (!Common::isAbsPath($path)) {
			$path .= "/";
		}
		?>
		<form>
			<input type="hidden" name="path" value="<?php echo($path); ?>">
			<h3><?php i18n("Would you like to overwrite or duplicate the following:"); ?></h3>
			<pre><?php echo($path); ?></pre>
			<select name="or_action">
				<option value="0"><?php i18n("Overwrite Original"); ?></option>
				<option value="1"><?php i18n("Create Duplicate"); ?></option>
			</select>
			<button class="btn-left"><?php i18n("Continue"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload();return false;"><?php i18n("Cancel"); ?></button>
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