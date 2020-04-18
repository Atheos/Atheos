<?php

/*
*  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
*  as-is and without warranty under the MIT License. See
*  [root]/license.txt for more. This information must remain intact.
*/

require_once('../../common.php');
require_once('class.filemanager.php');
//////////////////////////////////////////////////////////////////
// Verify Session or Key
//////////////////////////////////////////////////////////////////

checkSession();

?>
<form onsubmit="return;">
	<?php

	switch ($_GET['action']) {

		//////////////////////////////////////////////////////////////////
		// Create
		//////////////////////////////////////////////////////////////////
		case 'create':
			?>
			<label><i class="fas fa-plus-circle"></i><?php echo i18n((ucfirst($_GET['type']))); ?></label>
			<input type="text" name="nodeName" autofocus="autofocus" autocomplete="off" pattern="[A-Za-z0-9 \-\._]+" title="Letters, Numbers, Dashes, Underscores, Spaces or Periods Only">
			<button class="btn-left"><?php i18n("Create"); ?></button>
			<button class="btn-right" onclick="codiad.modal.unload(); return false;"><?php i18n("Cancel"); ?></button>
			<?php
			break;

		//////////////////////////////////////////////////////////////////
		// Rename
		//////////////////////////////////////////////////////////////////
		case 'rename':
			?>
			<input type="hidden" name="path" value="<?php echo($_GET['path']); ?>">
			<input type="hidden" name="type" value="<?php echo($_GET['type']); ?>">
			<label><i class="fas fa-pencil-alt"></i> <?php i18n("Rename"); ?> <?php echo i18n((ucfirst($_GET['type']))); ?></label>
			<input type="text" name="object_name" autofocus="autofocus" autocomplete="off" pattern="[A-Za-z0-9 \-\._]+" title="Letters, Numbers, Dashes, Underscores, Spaces or Periods Only" value="<?php echo($_GET['nodeName']); ?>">
			<button class="btn-left"><?php i18n("Rename"); ?></button>
			<button class="btn-right" onclick="codiad.modal.unload(); return false;"><?php i18n("Cancel"); ?></button>
			<?php
			break;

		//////////////////////////////////////////////////////////////////
		// Duplicate
		//////////////////////////////////////////////////////////////////
		case 'duplicate':
			?>
			<input type="hidden" name="path" value="<?php echo($_GET['path']); ?>">
			<input type="hidden" name="type" value="<?php echo($_GET['type']); ?>">
			<label><i class="fa fa-clone"></i> <?php i18n("Duplicate"); ?> <?php echo i18n((ucfirst($_GET['type']))); ?></label>
			<p>
				Enter new name
			</p>
			<input type="text" name="object_name" autofocus="autofocus" autocomplete="off" value="<?php echo($_GET['nodeName']); ?>">
			<button class="btn-left"><?php i18n("Duplicate"); ?></button>
			<button class="btn-right" onclick="codiad.modal.unload(); return false;"><?php i18n("Cancel"); ?></button>
			<?php
			break;

		//////////////////////////////////////////////////////////////////
		// Delete
		//////////////////////////////////////////////////////////////////
		case 'delete':
			?>
			<input type="hidden" name="path" value="<?php echo($_GET['path']); ?>">
			<label><i class="fas fa-trash-alt"></i><?php i18n("Are you sure you wish to delete the following:"); ?></label>
			<pre><?php if (!FileManager::isAbsPath($_GET['path'])) {
				echo '/';
			}; echo($_GET['path']); ?></pre>
			<button class="btn-left"><?php i18n("Delete"); ?></button>
			<button class="btn-right" onclick="codiad.modal.unload();return false;"><?php i18n("Cancel"); ?></button>
			<?php
			break;

		//////////////////////////////////////////////////////////////////
		// Preview
		//////////////////////////////////////////////////////////////////
		case 'preview':
			?>
			<label><i class="fas fa-eye"></i><?php i18n("Inline Preview"); ?></label>
			<div>
				<br><br><img src="<?php echo(str_replace(BASE_PATH . "/", "", WORKSPACE) . "/" . $_GET['path']); ?>"><br><br>
			</div>
			<button class="btn-right" onclick="codiad.modal.unload();return false;"><?php i18n("Close"); ?></button>
			<?php
			break;

		//////////////////////////////////////////////////////////////////
		// Overwrite
		//////////////////////////////////////////////////////////////////
		case 'overwrite':
			?>
			<input type="hidden" name="path" value="<?php echo($_GET['path']); ?>">
			<label><?php i18n("Would you like to overwrite or duplicate the following:"); ?></label>
			<pre><?php if (!FileManager::isAbsPath($_GET['path'])) {
				echo '/';
			}; echo($_GET['path']); ?></pre>
			<select name="or_action">
				<option value="0"><?php i18n("Overwrite Original"); ?></option>
				<option value="1"><?php i18n("Create Duplicate"); ?></option>
			</select>
			<button class="btn-left"><?php i18n("Continue"); ?></button>
			<button class="btn-right" onclick="codiad.modal.unload();return false;"><?php i18n("Cancel"); ?></button>
			<?php
			break;

	}

	?>
</form>