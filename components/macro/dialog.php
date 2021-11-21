<?php

//////////////////////////////////////////////////////////////////////////////80
// Macro Dialog
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @daeks, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once('class.macro.php');

$activeUser = SESSION("user");
$macro = new Macro($activeUser);
$macrolist = $macro->listMacros();

$tbody = "";

foreach ($macrolist as $id => $macro) {

	$isFile = $macro["type"] === "file" ? "checked" : "";
	$isFolder = $macro["type"] === "folder" ? "checked" : "";
	$isDisabled = $macro["type"] === "folder" ? "disabled" : "";

	$tbody .= '<tr id="' . $macro["uuid"] . '">';
	$tbody .= '<td><input type="text" name="title" value="' . $macro["title"] . '"></input></td>';
	$tbody .= '<td><toggle>
				<input id="typeFile_' . $id . '" value="file" name="type' . $id . '" type="radio" ' . $isFile . '/>
				<label for="typeFile_' . $id . '">' . i18n("file") . '</label>
				<input id="typeFolder_' . $id . '" value="folder" name="type' . $id . '" type="radio" ' . $isFolder . '/>
				<label for="typeFolder_' . $id . '">' . i18n("folder") . '</label>
				</toggle></td>';
	$tbody .= '<td><input type="text" name="fTypes" value="' . implode($macro["fTypes"], ", ") . '" ' . $isDisabled . '></input></td>';
	$tbody .= '<td><input type="text" name="command" value="' . $macro["command"] . '"></input></td>';
	$tbody .= '<td><a class="fas fa-save"></a><a class="fas fa-times-circle"></a></td>';
	$tbody .= '</tr>';
}

switch ($action) {

	//////////////////////////////////////////////////////////////////////////80
	// Main Settings Window
	//////////////////////////////////////////////////////////////////////////80
	case "openDialog":
		?>
		<label class="title"><i class="fas fa-magic"></i><?php echo i18n("macro"); ?></label>
		<table id="macro_editor">
			<thead>
				<tr>
					<th><?php echo i18n("macro_title"); ?></td>
					<th><?php echo i18n("macro_applies"); ?></td>
					<th><?php echo i18n("macro_exts"); ?></td>
					<th><?php echo i18n("macro_cmd"); ?></td>
					<th><?php echo i18n("actions"); ?></td>
				</tr>
			</thead>
			<tbody>
				<?php echo $tbody; ?>
			</tbody>
		</table>
		<button onclick="atheos.macro.addRow();return false;"><?php echo i18n("macro_add"); ?></button>
		<toolbar>Placeholders are: %PATH%, %FOLDER%, %BASENAME%, %FILENAME%</toolbar>
		<?php
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Default: Invalid Action
	//////////////////////////////////////////////////////////////////////////80
	default:
		Common::send("error", "Invalid action.");
		break;
}