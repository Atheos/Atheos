<?php

/*
    *  Copyright (c) atheos & daeks (atheos.com), distributed
    *  as-is and without warranty under the MIT License. See
    *  [root]/license.txt for more. This information must remain intact.
    */

require_once("../../common.php");

require_once("../../helpers/version-compare.php");

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


switch ($action) {

	//////////////////////////////////////////////////////////////
	// Marketplace
	//////////////////////////////////////////////////////////////

	case 'list':
		$plugins = Common::readDirectory(PLUGINS);
		$themes = Common::readDirectory(THEMES);

		$addons = Common::readJSON("addons", "cache") ?: array();
		$market = Common::readJSON("market", "cache") ?: array();

		$iTable = "";
		foreach ($addons as $type => $listT) {
			foreach ($listT as $category => $listC) {
				foreach ($listC as $addon => $data) {
					$name = $data["name"];

					if (array_key_exists($category, $market[$type]) && array_key_exists($name, $market[$type][$category])) {
						$iVersion = $data["version"];
						$uVersion = $market[$type][$category][$name]["version"];

						if (compareVersions($iVersion, $uVersion) < 0) {
							$data = $market[$type][$category][$name];
							$data["status"] = "updatable";
						}
						unset($market[$type][$category][$name]);
					}

					$url = $data["url"];
					$keywords = isset($data["keywords"])  ? implode(", ", $data["keywords"]) : "none";

					if ($data["status"] === 'updatable') {
						$action = "<a class=\"fas fa-sync-alt\" onclick = \"atheos.market.update('$name', '$type', '$category');return false;\"></a>";
						$action .= "<a class=\"fas fa-times-circle\" onclick=\"atheos.market.uninstall('$name', '$type', '$category');return false;\"></a>";
					} else {
						$action = "<a class =\"fas fa-times-circle\" onclick=\"atheos.market.uninstall('$name', '$type', '$category');return false;\"></a>";
					}

					$action .= "<a class =\"fas fa-external-link-alt\" onclick=\"openExternal('$url');return false;\"></a>";

					$iTable .= "<tr class=" . $type . " data-keywords=\"$keywords\">
				<td>" . $addon . "</td>
				<td>" . $data["description"] . "</td>
				<td>" . implode(", ", $data["author"]) . "</td>
				<td>" . $action . "</td>
				</tr>
				";
				}
			}
		}

		$aTable = "";
		foreach ($market as $type => $listT) {
			foreach ($listT as $category => $listC) {
				foreach ($listC as $addon => $data) {
					$url = $data["url"];
					$keywords = implode(", ", $data["keywords"]);

					$action = "<a class =\"fas fa-plus-circle\" onclick=\"atheos.market.install('$addon', '$type', '$category');return false;\"></a>";
					$action .= "<a class =\"fas fa-external-link-alt\" onclick=\"openExternal('$url');return false;\"></a>";

					$aTable .= "<tr class=" . $type . " data-keywords=\"$keywords\">
				<td>" . $addon . "</td>
				<td>" . $data["description"] . "</td>
				<td>" . implode(", ", $data["author"]) . "</td>
				<td>" . $action . "</td>
				</tr>
				";
				}
			}
		}
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
					<?php echo $iTable; ?>
					<tr>
						<td colspan="4">
							<h2>Available</h2>
						</td>
					</tr>
					<?php echo $aTable; ?>
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