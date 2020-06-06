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
		<label class="title"><i class="fas fa-plus-circle"></i><?php echo i18n("New " . (ucfirst($type))); ?></label>
		<form>
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
		<label class="title"><i class="fas fa-pencil-alt"></i> <?php i18n("Rename"); ?> <?php echo i18n((ucfirst($type))); ?></label>
		<form>
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
		<label class="title"><i class="fa fa-clone"></i> <?php i18n("Duplicate"); ?> <?php echo i18n((ucfirst($type))); ?></label>
		<form>
			<p>
				<?php i18n("Enter new name:"); ?>
			</p>
			<input type="text" name="clone" autofocus="autofocus" autocomplete="off" value="<?php echo($name); ?>">
			<button class="btn-left"><?php i18n("Duplicate"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php i18n("Cancel"); ?></button>
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