<?php

//////////////////////////////////////////////////////////////////////////////80
// Filmanager Dialog
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

$path = POST("path");
$name = POST("name");
$type = POST("type");

switch ($action) {

	//////////////////////////////////////////////////////////////////////////80
	// Create
	//////////////////////////////////////////////////////////////////////////80
	case "create":
		?>
		<label class="title"><i class="fas fa-plus-circle"></i><?php echo i18n("create_type", (ucfirst($type))); ?></label>
		<form class="pathCreate">
			<input type="text" name="nodeName" autofocus="autofocus" autocomplete="off" pattern="[A-Za-z0-9 \-\._]+" title="Letters, Numbers, Dashes, Underscores, Spaces or Periods Only">
			<button class="btn-left"><?php echo i18n("create"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php echo i18n("cancel"); ?></button>
		</form>
		<?php
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Duplicate
	//////////////////////////////////////////////////////////////////////////80
	case "duplicate":
		?>
		<label class="title"><i class="fa fa-clone"></i> <?php echo i18n("duplicate"); ?> <?php echo i18n((ucfirst($type))); ?></label>
		<form class="pathDuplicate">
			<p>
				<?php echo i18n("duplicate_name"); ?>
			</p>
			<input type="text" name="clone" autofocus="autofocus" autocomplete="off" value="<?php echo($name); ?>">
			<button class="btn-left"><?php echo i18n("duplicate"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php echo i18n("cancel"); ?></button>
		</form>

		<?php
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Rename
	//////////////////////////////////////////////////////////////////////////80
	case "rename":
		?>
		<label class="title"><i class="fas fa-pencil-alt"></i> <?php echo i18n("rename_type", ucfirst($type)); ?></label>
		<form class="fileRename">
			<input type="text" name="name" autofocus="autofocus" autocomplete="off" pattern="[A-Za-z0-9 \-\._]+" title="Letters, Numbers, Dashes, Underscores, Spaces or Periods Only" value="<?php echo($name); ?>">
			<button class="btn-left"><?php echo i18n("rename"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php echo i18n("cancel"); ?></button>
		</form>

	</form>
	<?php
	break;

	//////////////////////////////////////////////////////////////////////////80
	// Default: Invalid Action
	//////////////////////////////////////////////////////////////////////////80
	default:
		Common::send("error", "Invalid action.");
		break;
}