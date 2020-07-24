<?php

//////////////////////////////////////////////////////////////////////////////80
// Market Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once(__DIR__ . "/../../helpers/version-compare.php");
require_once(__DIR__ . "/../../helpers/recurse-delete.php");

class Market {

	//////////////////////////////////////////////////////////////////////////80
	// PROPERTIES
	//////////////////////////////////////////////////////////////////////////80

	public $local = array();
	public $market = 'https://www.atheos.io/market/json';
	public $remote = null;
	public $tmp = array();
	public $old = null;

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
		$this->cAddons = Common::readJSON("addons", "cache");
		$this->cMarket = Common::readJSON("market", "cache");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Init
	//////////////////////////////////////////////////////////////////////////80
	public function init() {
		$marketMTime = file_exists(DATA . "/cache/market.json") ? filemtime(DATA . "/cache/market.json") : false;
		$addonsMTime = file_exists(DATA . "/cache/addons.json") ? filemtime(DATA . "/cache/addons.json") : false;

		$oneWeekAgo = time() - (168 * 3600);

		// In summary, if there is a cache file, and it's less than a week old,
		// don't send a request for new MarketCache, otherwise, do so.
		$request = $marketMTime ? $marketMTime < $oneWeekAgo : true;
		$request = $this->cMarket ? $request : true;

		if (!$addonsMTime || $addonsMTime < $oneWeekAgo) {
			$this->buildCache();
		}

		$reply = array(
			"market" => defined('MARKETURL') ? MARKETURL : $this->market,
			"request" => $request
		);

		Common::sendJSON("success", $reply);
	}

	//////////////////////////////////////////////////////////////////////////80
	// Save  Market Cache
	//////////////////////////////////////////////////////////////////////////80
	public function saveCache($cache) {
		$cache = json_decode($cache);
		$this->cMarket = $cache;
		Common::saveJSON("market", $cache, "cache");
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Build Installed Addon Cache
	//////////////////////////////////////////////////////////////////////////80
	public function buildCache() {
		global $plugins; global $themes;

		// Scan plugins directory for missing plugins
		$addons = array(
			"plugins" => array(),
			"themes" => array()
		);

		foreach ($plugins as $plugin) {
			if (is_readable(PLUGINS . "/$plugin/plugin.json")) {
				$data = file_get_contents(PLUGINS . "/$plugin/plugin.json");
				$data = json_decode($data, true);
				unset($data["config"]);
				$addons["plugins"][$data["category"]][$data["name"]] = $data;
			}
		}

		foreach ($themes as $theme) {
			if (is_readable(THEMES . "/$theme/theme.json")) {
				$data = file_get_contents(THEMES . "/$theme/theme.json");
				$data = json_decode($data, true);
				$data["type"] = "theme";
				$addons["themes"][$data["category"]][$data["name"]] = $data;
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

		$repo = $this->findRepo($name, $type, $category);

		if (substr($repo, -4) == '.git') {
			$repo = substr($repo, 0, -4);
		}

		// For manual install, there will be no type, so it checks the github repo to detect the type.
		if ($type === '') {
			$file_headers = @get_headers(str_replace('github.com', 'raw.github.com', $repo.'/master/plugin.json'));
			if ($file_headers[0] != 'HTTP/1.1 404 Not Found') {
				$type = 'plugins';
			} else {
				$file_headers = @get_headers(str_replace('github.com', 'raw.github.com', $repo.'/master/theme.json'));
				if ($file_headers[0] != 'HTTP/1.1 404 Not Found') {
					$type = 'themes';
				} else {
					Common::sendJSON("error", "Invalid Repository"); die;
				}
			}
		} else {
			//Used to ping the market server to let Atheos that it was installed. Tracking / Stats; no need right now.
			// $reponame = explode('/', $repo);
			// $tmp = file_get_contents($this->url.'/?t='.rtrim($type, "s").'&i='.str_replace("-master", "", $reponame[sizeof($repo)-1]));
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
					Common::sendJSON("error", i18n("market_unableExtract")); die;
				}

			} else {
				Common::sendJSON("error", i18n("market_noZip")); die;
			}

			unlink(BASE_PATH.'/'.$type.'/'.$name.'.zip');
			$path = glob(BASE_PATH . "/$type/*$name*")[0];
			if (path) {
				rename($path, BASE_PATH. "/$type/$name");
			}
			// Response
			Common::sendJSON("success", i18n("market_install_success", $name));

			// Log Action
			Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $this->user . "} installed plugin {$name}", "market");
			$this->buildCache();
		} else {
			Common::sendJSON("error", i18n("market_unableDownload"));
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Remove Plugin
	//////////////////////////////////////////////////////////////////////////80
	public function remove($name, $type) {
		rDelete(BASE_PATH.'/'.$type.'/'.$name);
		Common::sendJSON("S2000");
		// Log Action
		Common::log("@" . date("Y-m-d H:i:s") . ":\t{" . $this->user . "} removed plugin {$name}", "market");

		$this->buildCache();

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

							if (compareVersions($iVersion, $uVersion) < 0) {
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