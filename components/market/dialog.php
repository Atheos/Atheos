<?php

//////////////////////////////////////////////////////////////////////////////80
// Market Dialog
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once('class.market.php');

$Market = new Market();

switch ($action) {

	//////////////////////////////////////////////////////////////////////////80
	// Marketplace
	//////////////////////////////////////////////////////////////////////////80
	case 'list':


		if (!Common::checkAccess("configure")) {
			?>
			<label class="title"><i class="fas fa-sync"></i><?php echo i18n("restricted"); ?></label>
			<form>
				<label class="title"><i class="fas fa-sync"></i><?php echo i18n("restricted_marketplace"); ?></label>
			</form>
			<?php
		} else {

			$table = $Market->renderMarket();
			?>
			<label class="title"><i class="fas fa-store"></i><?php echo i18n("market_atheos"); ?></label>
			<div id="market">
				<!--<table width="100%">-->
				<!--	<tr>-->
				<!--<th valign="middle" align="center" width="40px">-->
				<!--	<button onclick="window.location.reload();return false;"><?php echo i18n("reloadAtheos"); ?></button>-->
				<!--</th>-->
				<!--		<th valign="middle">-->
				<!--			<input type="text" id="manual_repo" placeholder="<?php echo i18n("enterGitHubRepositoryURL"); ?>">-->
				<!--			<button class="btn-left" id="manual_install"><?php echo i18n("market_install_manually"); ?></button>-->
				<!--		</th>-->
				<!--	</tr>-->
				<!--</table>-->
				<table id="market_table" width="100%">
					<thead>
						<tr>
							<th><?php echo i18n("name"); ?></th>
							<th><?php echo i18n("description"); ?></th>
							<th><?php echo i18n("author"); ?></th>
							<th><?php echo i18n("actions"); ?></th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td colspan="4">
								<h2><?php echo i18n("installed"); ?></h2>
							</td>
						</tr>
						<?php echo $table["i"]; ?>
						<tr>
							<td colspan="4">
								<h2><?php echo i18n("available"); ?></h2>
							</td>
						</tr>
						<?php echo $table["a"]; ?>
						<tr>
							<td colspan="4">
								<h2><?php echo i18n("coming"); ?></h2>
							</td>
						</tr>
						<?php echo $table["c"]; ?>
					</tbody>

				</table>
			</div>
			<?php
		}
		break;
	default:
		Common::send("error", "Invalid action.");
		break;
} ?>