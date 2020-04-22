<?php

//////////////////////////////////////////////////////////////////////////////80
// Editor Dialog
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once("../../common.php");

//////////////////////////////////////////////////////////////////////////////80
// Verify Session or Key
//////////////////////////////////////////////////////////////////////////////80
Common::checkSession();

$action = Common::data("action");
$type = Common::data("type");
$hightlight = Common::data("hightlight");

if (!$action) {
	Common::sendJSON("E401m");
	die;
}

switch ($action) {

	//////////////////////////////////////////////////////////////////////////80
	// Find
	//////////////////////////////////////////////////////////////////////////80
	case 'find':
		?>
		<form>
			<h4><i class="fas fa-search"></i><?php i18n("Find:"); ?></h4>
			<input type="text" name="find" autofocus="autofocus" autocomplete="off">
			<button class="btn-left" onclick="atheos.editor.search('find');return false;"><?php i18n("Find"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php i18n("Cancel"); ?></button>
		</form>

		<?php
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Replace
	//////////////////////////////////////////////////////////////////////////80
	case 'replace':
		?>
		<form>
			<h4><i class="fas fa-search"></i><?php i18n("Find:"); ?></h4>
			<input type="text" name="find" autofocus="autofocus" autocomplete="off">
			<h4><i class="fas fa-exchange-alt"></i><?php i18n("Replace:"); ?></h4>
			<input type="text" name="replace">
			<button class="btn-left" onclick="atheos.editor.search('find');return false;"><?php i18n("Find"); ?></button>
			<button class="btn-mid" onclick="atheos.editor.search('replace');return false;"><?php i18n("Replace"); ?></button>
			<button class="btn-mid" onclick="atheos.editor.search('replaceAll');return false;"><?php i18n("Replace ALL"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php i18n("Cancel"); ?></button>
		</form>

		<?php
		break;
	//////////////////////////////////////////////////////////////////////////80
	// Prompt for GotoLine
	//////////////////////////////////////////////////////////////////////////80
	case 'promptLine':
		?>
		<form>
			<h4><i class="fas fa-external-link-alt"></i> <?php i18n("Enter a line number:"); ?></h4>
			<input type="text" name="line" autofocus="autofocus" autocomplete="off" value="">
			<button class="btn-left"><?php i18n("Goto"); ?></button>
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
?>