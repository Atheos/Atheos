<?php

//////////////////////////////////////////////////////////////////////////////80
// Market Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class Market {

	//////////////////////////////////////////////////////////////////////////80
	// PROPERTIES
	//////////////////////////////////////////////////////////////////////////80
	public $market = 'https://www.atheos.io/market/json';

	private $activeUser = null;

	private $cMarket = array();
	private $cAddons = array();

	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Construct
	//////////////////////////////////////////////////////////////////////////80
	public function __construct() {
		$this->cAddons = Common::loadJSON("addons", "cache");
		$this->cMarket = Common::loadJSON("market", "cache");

		$this->activeUser = SESSION("user");

	}

	//////////////////////////////////////////////////////////////////////////80
	// Init
	//////////////////////////////////////////////////////////////////////////80
	public function init() {
		$marketMTime = file_exists(DATA . "/cache/market.json") ? filemtime(DATA . "/cache/market.json") : false;

		$oneWeekAgo = time() - (168 * 3600);

		// In summary, if there is a cache file, and it's less than a week old,
		// don't send a request for new MarketCache, otherwise, do so.
		$request = $marketMTime ? $marketMTime < $oneWeekAgo : true;
		$request = $this->cMarket ? $request : true;

		$this->buildCache();

		$reply = array(
			"market" => defined('MARKETURL') ? MARKETURL : $this->market,
			"request" => $request
		);

		Common::send("success", $reply);
	}

	//////////////////////////////////////////////////////////////////////////80
	// Save  Market Cache
	//////////////////////////////////////////////////////////////////////////80
	public function saveCache($cache) {
		$cache = json_decode($cache);
		$this->cMarket = $cache;
		Common::saveJSON("market", $cache, "cache");
		Common::send("success");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Build Installed Addon Cache
	//////////////////////////////////////////////////////////////////////////80
	public function buildCache($rebuild = false) {
		global $plugins;

		if ($rebuild) {
			$plugins = Common::readDirectory(PLUGINS);
		}

		// Scan plugins directory for missing plugins
		$addons = array(
			"plugins" => array(),
		);

		foreach ($plugins as $plugin) {
			if (is_readable(PLUGINS . "/$plugin/plugin.json")) {
				$data = file_get_contents(PLUGINS . "/$plugin/plugin.json");
				$data = json_decode($data, true);
				unset($data["config"]);
				$addons["plugins"][$data["category"]][$data["name"]] = $data;
			}
		}

		$this->cAddons = $addons;
		Common::saveJSON("addons", $addons, "cache");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Find Repo URL
	//////////////////////////////////////////////////////////////////////////80
	public function findRepo($name, $type, $category) {
		if (!$this->cMarket) {
			return false;
		}
		if (!array_key_exists($category, $this->cMarket[$type])) {
			return false;
		}
		if (array_key_exists($name, $this->cMarket[$type][$category])) {
			return $this->cMarket[$type][$category][$name]["url"];
		}
	}


	//////////////////////////////////////////////////////////////////////////80
	// Install Plugin
	//////////////////////////////////////////////////////////////////////////80
	public function install($name, $type, $category) {

		if (file_exists(__DIR__ . "/../../public/plugins.min.js")) {
			unlink(__DIR__ . "/../../public/plugins.min.js");
		}
		if (file_exists(__DIR__ . "/../../public/plugins.min.css")) {
			unlink(__DIR__ . "/../../public/plugins.min.css");
		}

		$repo = $this->findRepo($name, $type, $category);

		if (substr($repo, -4) == '.git') {
			$repo = substr($repo, 0, -4);
		}

		if (file_put_contents(BASE_PATH.'/'.$type.'/'.$name.'.zip', fopen($repo.'/archive/master.zip', 'r'))) {

			$zip = new ZipArchive;
			$res = $zip->open(BASE_PATH.'/'.$type.'/'.$name.'.zip');

			// open downloaded archive
			if ($res === true) {
				// extract archive
				if ($zip->extractTo(BASE_PATH.'/'.$type) === true) {
					$zip->close();
				} else {
					Common::send("error", i18n("market_unableExtract"));
				}
			} else {
				Common::send("error", i18n("market_noZip"));
			}

			unlink(BASE_PATH.'/'.$type.'/'.$name.'.zip');
			$path = glob(BASE_PATH . "/$type/*$name*")[0];
			if ($path) {
				rename($path, BASE_PATH. "/$type/$name");
			}


			// Log Action
			Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $this->activeUser . "} installed plugin {$name}", "market");
			$this->buildCache(true);
			Common::send("success", i18n("market_install_success", $name));
		} else {
			Common::send("error", i18n("market_unableDownload"));
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Remove Plugin
	//////////////////////////////////////////////////////////////////////////80
	public function remove($name, $type) {
		if ($type === "plugins") {
			if (file_exists(BASE_PATH . "/public/plugins.min.js")) unlink(BASE_PATH . "/public/plugins.min.js");
			if (file_exists(BASE_PATH . "/public/plugins.min.css")) unlink(BASE_PATH . "/public/plugins.min.css");
		}
		Common::rDelete(BASE_PATH.'/'.$type.'/'.$name);
		// Log Action
		Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $this->activeUser . "} removed plugin {$name}", "market");

		$this->buildCache(true);
		Common::send("success", "Plugin successfully removed.");

	}


	//////////////////////////////////////////////////////////////////////////80
	// Render Market
	//////////////////////////////////////////////////////////////////////////80
	public function renderMarket() {
		$market = $this->cMarket;
		$addons = $this->cAddons;

		$iTable = "";
		foreach ($addons as $type => $listT) {
			foreach ($listT as $category => $listC) {
				foreach ($listC as $addon => $data) {
					$name = $data["name"];

					if (!empty($market)) {
						if (array_key_exists($category, $market[$type]) && array_key_exists($name, $market[$type][$category])) {
							$iVersion = $data["version"];
							$uVersion = $market[$type][$category][$name]["version"];

							if (Common::compareVersions($iVersion, $uVersion) < 0) {
								$data = $market[$type][$category][$name];
								$data["status"] = "updatable";
							}
							unset($market[$type][$category][$name]);
						}
					}

					$url = isset($data["url"]) ? $data["url"] : "false";
					$keywords = isset($data["keywords"])  ? implode(", ", $data["keywords"]) : "none";
					$status = isset($data["status"]) ? $data["status"] : "unavailable";
					$description = isset($data["description"]) ? $data["description"] : i18n("market_missingDesc");
					$author = isset($data["author"]) ? implode(", ", $data["author"]) : i18n("market_missingAuth");

					if ($status === "updatable") {
						$action = "<a class=\"fas fa-sync-alt\" onclick = \"atheos.market.update('$name', '$type', '$category');return false;\"></a>";
						$action .= "<a class=\"fas fa-times-circle\" onclick=\"atheos.market.remove('$name', '$type', '$category');return false;\"></a>";
					} else {
						$action = "<a class =\"fas fa-times-circle\" onclick=\"atheos.market.remove('$name', '$type', '$category');return false;\"></a>";
					}

					$action .= "<a class =\"fas fa-external-link-alt\" onclick=\"openExternal('$url');return false;\"></a>";

					$iTable .= "<tr class=" . $type . " data-keywords=\"$keywords\">
				<td>" . $addon . "</td>
				<td>" . $description . "</td>
				<td>" . $author . "</td>
				<td>" . $action . "</td>
				</tr>
				";
				}
			}
		}

		$aTable = "";
		$cTable = "";
		if (empty($market)) {
			$aTable = "<tr class=\"error\"><td colspan=\"4\"><h3>" . i18n("connectionError") . "</h3></td></tr>";
		} else {
			foreach ($market as $type => $listT) {
				foreach ($listT as $category => $listC) {
					foreach ($listC as $addon => $data) {
						$url = $data["url"];
						$keywords = implode(", ", $data["keywords"]);

						$action = '';

						if ($data["status"] === "available") {
							$action .= "<a class =\"fas fa-plus-circle\" onclick=\"atheos.market.install('$addon', '$type', '$category');return false;\"></a>";
						}

						$action .= "<a class =\"fas fa-external-link-alt\" onclick=\"openExternal('$url');return false;\"></a>";

						$item = "<tr class=\"" . $data["status"] . " $type\" data-keywords=\"$keywords\">
							<td>" . $addon . "</td>
							<td>" . $data["description"] . "</td>
							<td>" . implode(", ", $data["author"]) . "</td>
							<td>" . $action . "</td>
						</tr>";

						if ($data["status"] === "available") {

							$aTable .= $item;
						} else {
							$cTable .= $item;
						}

					}
				}
			}
		}

		return array(
			"i" => $iTable,
			"a" => $aTable,
			"c" => $cTable
		);

	}
}