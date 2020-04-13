<?php

/*
*  Copyright (c) atheos & Kent Safranski (atheos.com), distributed
*  as-is and without warranty under the MIT License. See
*  [root]/license.txt for more. This information must remain intact.
*/

require_once("../../common.php");

//////////////////////////////////////////////////////////////////
// Verify Session or Key
//////////////////////////////////////////////////////////////////
checkSession();

$action = Common::data("action");
$path = Common::data("path");

switch ($action) {

	//////////////////////////////////////////////////////////////////
	// Search
	//////////////////////////////////////////////////////////////////
	case 'probe':
		?>
		<form>

			<input type="hidden" name="path" value="<?php echo $path; ?>">
			<table id="probe_table">
				<tr>
					<td width="65%">
						<label><?php i18n("Search Files:"); ?></label>
						<input type="text" name="probe_query" autofocus="autofocus">
					</td>
					<td width="5%">&nbsp;&nbsp;</td>
					<td>
						<label><?php i18n("In:"); ?></label>
						<select name="probe_type">
							<option value="0"><?php i18n("Current Project"); ?></option>
							<?php if (checkAccess()) {
								?>
								<option value="1"><?php i18n("Workspace Projects"); ?></option>
								<?php
							} ?>
						</select>
					</td>
				</tr>
				<tr>
					<td coli="3">
						<label><?php i18n("File Type:"); ?></label>
						<input type="text" name="probe_filter" placeholder="<?php i18n("space seperated file types eg: js c php"); ?>">
					</td>
				</tr>
			</table>
			<pre id="probe_results"></pre>
			<div id="probe_processing" class="loader">
				<div class="ring"></div>
				<!--<div class="ring"></div>-->
				<div class="dot"></div>
			</div>
			<button class="btn-left"><?php i18n("Search"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload();return false;"><?php i18n("Cancel"); ?></button>
		</form>
		<?php
		break;
}

?>