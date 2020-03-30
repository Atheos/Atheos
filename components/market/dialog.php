<?php

/*
    *  Copyright (c) atheos & daeks (atheos.com), distributed
    *  as-is and without warranty under the MIT License. See
    *  [root]/license.txt for more. This information must remain intact.
    */

require_once('../../common.php');

//////////////////////////////////////////////////////////////////
// Verify Session or Key
//////////////////////////////////////////////////////////////////

checkSession();

$action = Common::data("action");

if (!$action) {
	Common::sendJSON("E401m");
	die;
}

if (!checkAccess()) {
	Common::sendJSON("E430u");
	die;
}

switch ($action) {

	//////////////////////////////////////////////////////////////
	// Marketplace
	//////////////////////////////////////////////////////////////

	case 'list':
		?>
		<h1><?php i18n("Atheos Marketplace"); ?></h1>
		<div id="market">
			<table width="100%">
				<tr>
					<!--<th valign="middle" align="center" width="40px">-->
					<!--	<button onclick="window.location.reload();return false;"><?php i18n("Reload atheos"); ?></button>-->
					<!--</th>-->
					<th valign="middle">
						<input type="text" id="manual_repo" placeholder="<?php i18n("Enter GitHub Repository Url..."); ?>">
						<button class="btn-left" id="manual_install"><?php i18n("Install Manually"); ?></button>
					</th>
				</tr>
				<!--<tr>-->
				<!--	<th valign="middle" style="white-space:nowrap;">-->
				<!--		<input style="margin:0;display:inline;width:60%" onkeyup="atheos.market.search(event, this.value,'<?php echo $_GET['note']; ?>')" value="<?php if (isset($_GET['query'])) echo $_GET['query']; ?>" placeholder="<?php i18n("Press Enter to Search"); ?>">-->
						<!--</th>                	-->
						<!--<th valign="middle" style="white-space:nowrap;">-->
				<!--		<button style="margin:0;" class="btn-left" onclick="atheos.market.list();return false;"><?php i18n("All"); ?></button>-->
				<!--		<button class="btn-mid" style="margin:0;" onclick="atheos.market.list('plugins');return false;"><?php i18n("Plugins"); ?></button>-->
				<!--		<button class="btn-right" style="margin:0;" onclick="atheos.market.list('themes');return false;"><?php i18n("Themes"); ?></button>-->
				<!--	</th>-->
				<!--</tr>-->
			</table>
			<table id="market_table" width="100%">
			</table>
		</div>
		<?php
		break;
	default:
		Common::sendJSON("E401i");
		die;
		break;
} ?>