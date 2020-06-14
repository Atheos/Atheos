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
		<label class="title"><i class="fas fa-plus-circle"></i><?php echo i18n("create_type", (ucfirst($type))); ?></label>
		<form>
			<input type="text" name="nodeName" autofocus="autofocus" autocomplete="off" pattern="[A-Za-z0-9 \-\._]+" title="Letters, Numbers, Dashes, Underscores, Spaces or Periods Only">
			<button class="btn-left"><?php echo i18n("create"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php echo i18n("cancel"); ?></button>
		</form>
		<?php
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Rename
	//////////////////////////////////////////////////////////////////////////80
	case 'rename':
		?>
		<label class="title"><i class="fas fa-pencil-alt"></i> <?php echo i18n("rename_type", ucfirst($type)); ?></label>
		<form>
			<input type="text" name="name" autofocus="autofocus" autocomplete="off" pattern="[A-Za-z0-9 \-\._]+" title="Letters, Numbers, Dashes, Underscores, Spaces or Periods Only" value="<?php echo($name); ?>">
			<button class="btn-left"><?php echo i18n("rename_type"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php echo i18n("cancel"); ?></button>
		</form>

	</form>
	<?php
	break;

	//////////////////////////////////////////////////////////////////////////80
	// Duplicate
	//////////////////////////////////////////////////////////////////////////80
	case 'duplicate':
		?>
		<label class="title"><i class="fa fa-clone"></i> <?php echo i18n("duplicate"); ?> <?php echo i18n((ucfirst($type))); ?></label>
		<form>
			<p>
				<?php echo i18n("enterNewName:"); ?>
			</p>
			<input type="text" name="clone" autofocus="autofocus" autocomplete="off" value="<?php echo($name); ?>">
			<button class="btn-left"><?php echo i18n("duplicate"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php echo i18n("cancel"); ?></button>
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