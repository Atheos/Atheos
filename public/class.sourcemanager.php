<?php

require_once 'lib/minify/Minify.php';
require_once 'lib/minify/CSS.php';
require_once 'lib/minify/JS.php';
require_once 'lib/path-converter/ConverterInterface.php';
require_once 'lib/path-converter/Converter.php';

use MatthiasMullie\Minify;

class SourceManager {

	private $modules = array(
		// "modules/jquery-1.7.2.min.js",
		"modules/amplify.js",
		"modules/echo.js",
		"modules/icons.js",
		"modules/global.js",
		"modules/onyx.js",
		"modules/synthetic.js",
		// Global components need to be above this line.
		"modules/system.js",
		"modules/alert.js",
		"modules/flow.js",
		"modules/chrono.js",
		"modules/common.js",
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

	function loadAndMinifyJS($minifiedFileName, $files) {

		$content = '';
		$minified = "/* Creation Time: " . date('Y-m-d H:i:s', time()) . "*/" . PHP_EOL;

		foreach ($files as $file) {
			if (is_readable($file)) {
				$content = file_get_contents($file);
				$minified .= "/* $file */" . PHP_EOL;
				$minifier = new Minify\JS($content);
				$minified .= $minifier->minify() . ';' . PHP_EOL;
			}
		}
		file_put_contents($minifiedFileName, $minified);
	}

	// This is a conditional that helps during developement of Atheos.
	function echoScripts($dataset = [], $raw = false) {

		$files = array();

		switch ($dataset) {
			case "modules":
				$files = $this->modules;
				break;
			case "components":
				$files = $this->components;
				break;
			case "plugins":
				$files = $this->pluginsJS;
				break;
			default:
				return false;
				break;
		}
		
		echo "<!-- " . strtoupper($dataset) . " -->";
		$minifiedFileName = "public/$dataset.min.js";

		if ($raw) {
			$scripts = '';
			foreach ($files as $file) {
				$scripts .= ("<script type=\"text/javascript\" src=\"$file\"></script>");
			}
			echo $scripts;
			if (file_exists($minifiedFileName)) unlink($minifiedFileName);

		} else {

			if (is_readable($minifiedFileName)) {
				$mostRecent = filemtime($minifiedFileName);
				foreach ($files as $file) {
					if (filemtime($file) > $mostRecent) {
						$mostRecent = filemtime($file);
						break;
					}
				}
				if (filemtime($minifiedFileName) < $mostRecent) {
					$this->loadAndMinifyJS($minifiedFileName, $files);
				}
			} else {
				$this->loadAndMinifyJS($minifiedFileName, $files);
			}
			echo("<script src=\"$minifiedFileName\"></script>");
		}
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

	function echoStyles($dataset = [], $raw = false) {
		echo "<!-- " . strtoupper($dataset) . " -->";

		$files = array();

		switch ($dataset) {
			case "plugins":
				$files = $this->pluginsCSS;
				break;
			case "fonts":
				$files = $this->fonts;
				break;
			default:
				return false;
				break;
		}

		$minifiedFileName = "public/$dataset.min.css";

		if ($raw) {
			$scripts = '';
			foreach ($files as $file) {
				$scripts .= ("<link rel=\"stylesheet\" href=\"$file\">");
			}
			echo $scripts;
			if (file_exists($minifiedFileName)) unlink($minifiedFileName);

		} else {
			if (is_readable($minifiedFileName)) {
				$mostRecent = filemtime($minifiedFileName);
				foreach ($files as $file) {
					if (filemtime($file) > $mostRecent) {
						$mostRecent = filemtime($file);
						break;
					}
				}
				if (filemtime($minifiedFileName) < $mostRecent) {
					$this->loadAndMinifyCSS($minifiedFileName, $files);
				}
			} else {
				$this->loadAndMinifyCSS($minifiedFileName, $files);
			}
			echo("<link rel=\"stylesheet\" href=\"$minifiedFileName\">");
		}
	}
}