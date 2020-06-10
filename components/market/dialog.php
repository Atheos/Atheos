<?php

//////////////////////////////////////////////////////////////////////////////80
// Market Dialog
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once("../../common.php");
require_once('class.market.php');
//////////////////////////////////////////////////////////////////////////////80
// Verify Session or Key
//////////////////////////////////////////////////////////////////////////////80
Common::checkSession();

$action = Common::data("action");

if (!$action) {
	Common::sendJSON("E401m");
	die;
}

if (!Common::checkAccess("configure")) {
	Common::sendJSON("E430u");
	die;
}


$Market = new Market();


switch ($action) {

	//////////////////////////////////////////////////////////////////////////80
	// Marketplace
	//////////////////////////////////////////////////////////////////////////80
	case 'list':
		
		$table = $Market->renderMarket();
		?>
		<label class="title"><i class="fas fa-store"></i><?php i18n("Atheos Marketplace"); ?></label>
		<div id="market">
			<!--<table width="100%">-->
			<!--	<tr>-->
			<!--<th valign="middle" align="center" width="40px">-->
			<!--	<button onclick="window.location.reload();return false;"><?php i18n("Reload Atheos"); ?></button>-->
			<!--</th>-->
			<!--		<th valign="middle">-->
			<!--			<input type="text" id="manual_repo" placeholder="<?php i18n("Enter GitHub Repository Url..."); ?>">-->
			<!--			<button class="btn-left" id="manual_install"><?php i18n("Install Manually"); ?></button>-->
			<!--		</th>-->
			<!--	</tr>-->
			<!--</table>-->
			<table id="market_table" width="100%">
				<thead>
					<tr>
						<th>Name</th>
						<th>Description</th>
						<th>Author</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td colspan="4">
							<h2>Installed</h2>
						</td>
					</tr>
					<?php echo $table["i"]; ?>
					<tr>
						<td colspan="4">
							<h2>Available</h2>
						</td>
					</tr>
					<?php echo $table["a"]; ?>
				</tbody>

			</table>
		</div>
		<?php
		break;
	default:
		Common::sendJSON("E401i");
		die;
		break;
} ?>