<?php

require_once "lib/minify/Minify.php";
require_once "lib/minify/CSS.php";
require_once "lib/minify/JS.php";
require_once "lib/path-converter/ConverterInterface.php";
require_once "lib/path-converter/Converter.php";

use MatthiasMullie\Minify;

class SourceManager {

	private $modules = array(
		"modules/carbon.js",
		"modules/echo.js",
		"modules/flux.js",
		"modules/icons.js",
		"modules/global.js",
		"modules/onyx.js",
		"modules/synthetic.js",
		// Global components need to be above this line.
		"modules/system.js",
		"modules/alert.js",
		"modules/flow.js",
		"modules/flux.js",
		"modules/chrono.js",
		"modules/common.js",
		"modules/i18n.js",
		"modules/keybind.js",
		"modules/modal.js",
		"modules/storage.js",
		"modules/splitview.js",
		"modules/toast.js"
	);

	private $components = array();

	private $pluginsJS = array();
	private $pluginsCSS = array();

	private $fonts = array(
		"fonts/file-icons/webfont.min.css",
		"fonts/fontawesome/webfont.css",
		"fonts/ubuntu/webfont.css"
	);

	function __construct() {
		global $components; global $plugins;

		foreach ($components as $component) {
			if (file_exists(COMPONENTS . "/" . $component . "/init.js")) {
				$this->components[] = "components/$component/init.js";
			}
		}

		foreach ($plugins as $plugin) {
			if (file_exists(PLUGINS . "/" . $plugin . "/init.js")) {
				$this->pluginsJS[] = "plugins/$plugin/init.js";
			}
			if (file_exists(PLUGINS . "/" . $plugin . "/screen.css")) {
				$this->pluginsCSS[] = "plugins/$plugin/screen.css";
			}
		}
	}

	function echo($type = "css", $dataset = [], $raw = false) {

		$files = array();

		switch ($dataset) {
			case "modules":
				$files = $this->modules;
				break;
			case "components":
				$files = $this->components;
				break;
			case "plugins":
				$files = $type === "css" ? $this->pluginsCSS: $this->pluginsJS;
				break;
			case "fonts":
				$files = $this->fonts;
				break;
			default:
				return false;
				break;
		}

		echo "\t<!-- " . strtoupper($dataset) . " -->\n";
		$minifiedFileName = "public/$dataset.min.$type";

		if ($raw) {
			$scripts = "";
			foreach ($files as $file) {
				$scripts .= $this->getTag($type, $file);
			}
			if (file_exists($minifiedFileName)) unlink($minifiedFileName);
			echo $scripts;
			return;

		} elseif (is_readable($minifiedFileName)) {
			$mostRecent = filemtime($minifiedFileName);
			foreach ($files as $file) {
				if (filemtime($file) > $mostRecent) {
					$mostRecent = filemtime($file);
					break;
				}
			}
			if (filemtime($minifiedFileName) < $mostRecent) {
				$this->loadAndMinify($type, $minifiedFileName, $files);
			}
		} else {
			$this->loadAndMinify($type, $minifiedFileName, $files);
		}
		echo($this->getTag($type, $minifiedFileName));
	}

	function loadAndMinify($type = "css", $minifiedFileName, $files) {
		if ($type === "css") {
			$this->loadAndMinifyCSS($minifiedFileName, $files);
		} else {
			$this->loadAndMinifyJS($minifiedFileName, $files);
		}
	}

	function loadAndMinifyJS($minifiedFileName, $files) {

		$content = "";

		$minified =
		"//////////////////////////////////////////////////////////////////////////////80\n" .
		"// Minification / Creation Time: " . date("Y-m-d H:i:s", time()) . "\n" .
		"//////////////////////////////////////////////////////////////////////////////80\n" .
		"// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without\n" .
		"// warranty under the MIT License. See [root]/license.md for more.\n" .
		"// This information must remain intact.\n" .
		"//////////////////////////////////////////////////////////////////////////////80\n";

		foreach ($files as $file) {
			if (is_readable($file)) {
				$content = file_get_contents($file);
				$minified .= PHP_EOL . "//////////////////////////////////////////////////////////////////////////////80" . PHP_EOL;
				$minified .= "// $file " . PHP_EOL;
				$minified .= "//////////////////////////////////////////////////////////////////////////////80" . PHP_EOL;
				$minifier = new Minify\JS($content);
				$minified .= $minifier->minify() . ";" . PHP_EOL;
			}
		}
		file_put_contents($minifiedFileName, $minified);
	}

	function loadAndMinifyCSS($minifiedFileName, $files) {
		$minifier = new Minify\CSS();

		foreach ($files as $file) {
			if (is_readable($file)) {
				$minifier->add($file);
			}
		}
		$minifier->minify($minifiedFileName);
	}

	function getTag($type = "css", $path) {
		return $type === "css" ? "\t<link rel=\"stylesheet\" href=\"$path\">\n\n": "\t<script type=\"text/javascript\" src=\"$path\"></script>\n\n";
	}
}