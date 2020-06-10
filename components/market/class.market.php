<?php

/*
*  Copyright (c) Codiad & daeks (codiad.com), distributed
*  as-is and without warranty under the MIT License. See
*  [root]/license.txt for more. This information must remain intact.
*/

require_once('../../common.php');

class Market
{

	//////////////////////////////////////////////////////////////////
	// PROPERTIES
	//////////////////////////////////////////////////////////////////

	public $local = array();
	public $market = 'https://www.atheos.io/market/json';
	public $remote = null;
	public $tmp = array();
	public $old = null;

	//////////////////////////////////////////////////////////////////
	// METHODS
	//////////////////////////////////////////////////////////////////

	// -----------------------------||----------------------------- //

	//////////////////////////////////////////////////////////////////
	// Init
	//////////////////////////////////////////////////////////////////
	public function init() {
		$marketMTime = filemtime(DATA . "/cache/market.json");
		$addonsMTime = filemtime(DATA . "/cache/addons.json");
		
		$oneWeekAgo = time() - (168 * 3600);

		$request = $marketMTime ? $marketMTime < $oneWeekAgo : true;
		
		if(!$addonsMTime || $addonsMTime < $oneWeekAgo ) {
			$this->buildCache();
		}

		$reply = array(
			"market" => defined('MARKETURL') ? MARKETURL : $this->market,
			"request" => $request
		);

		Common::sendJSON("success", $reply);
	}

	//////////////////////////////////////////////////////////////////
	// Save  Market Cache
	//////////////////////////////////////////////////////////////////
	public function saveCache($cache) {
		$cache = json_decode($cache);
		Common::saveJSON("market", $cache, "cache");
		Common::sendJSON("S2000");
	}

	//////////////////////////////////////////////////////////////////
	// Build Installed Addon Cache
	//////////////////////////////////////////////////////////////////
	public function buildCache() {
		$plugins = Common::readDirectory(PLUGINS);
		$themes = Common::readDirectory(THEMES);

		// Scan plugins directory for missing plugins
		$installed = array(
			"plugins" => array(),
			"themes" => array()
		);

		foreach ($plugins as $plugin) {
			if (is_readable(PLUGINS . "/$plugin/plugin.json")) {
				$data = file_get_contents(PLUGINS . "/$plugin/plugin.json");
				$data = json_decode($data, true);
				unset($data["config"]);
				$installed["plugins"][$data["category"]][$data["name"]] = $data;
			}
		}

		foreach ($themes as $theme) {
			if (is_readable(THEMES . "/$theme/theme.json")) {
				$data = file_get_contents(THEMES . "/$theme/theme.json");
				$data = json_decode($data, true);
				$data["type"] = "theme";
				$installed["themes"][$data["category"]][$data["name"]] = $data;
			}
		}

		Common::saveJSON("addons", $installed, "cache");
	}

	//////////////////////////////////////////////////////////////////
	// Find Repo URL
	//////////////////////////////////////////////////////////////////	
	public function findRepo($name, $type, $category) {
		$market = Common::readJSON("market", "cache");
		if(!$market) {
			return false;
		}
		if(array_key_exists($category, $market[$type]) && array_key_exists($name, $market[$type][$category])) {
			return $market[$type][$category][$name]["url"];
		}
	}


	//////////////////////////////////////////////////////////////////
	// Install Plugin
	//////////////////////////////////////////////////////////////////
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
					Common::sendJSON("error", "Unable to extract Archive."); die;
				}

			} else {
				Common::sendJSON("error", "ZIP Extension not found."); die;
			}

			unlink(BASE_PATH.'/'.$type.'/'.$name.'.zip');
			$path = glob(BASE_PATH . "/$type/*$name*")[0];
			if (path) {
				rename($path, BASE_PATH. "/$type/$name");
			}
			// Response
			Common::log($this->username, "Installed plugin: $name", "market");
			Common::sendJSON("success", "Successfully installed $name.");
		} else {
			Common::sendJSON("error", "Unable to download $name.");
			die;
		}
	}

	//////////////////////////////////////////////////////////////////
	// Remove Plugin
	//////////////////////////////////////////////////////////////////
	public function remove($name, $type) {
		function rrmdir($path) {
			return is_file($path)?
			@unlink($path):
			@array_map('rrmdir', glob($path.'/*')) == @rmdir($path);
		}

		rrmdir(BASE_PATH.'/'.$type.'/'.$name);
		Common::log($this->username, "Removed plugin: $name", "market");
		Common::sendJSON("S2000");
	}
}