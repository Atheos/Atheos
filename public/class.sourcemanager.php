<?php

// require 'lib/Minifier.php';

require_once 'lib/minify/src/Minify.php';
require_once 'lib/minify/src/CSS.php';
require_once 'lib/minify/src/JS.php';
require_once 'lib/minify/src/Exception.php';
require_once 'lib/minify/src/Exceptions/BasicException.php';
require_once 'lib/minify/src/Exceptions/FileImportException.php';
require_once 'lib/minify/src/Exceptions/IOException.php';
require_once 'lib/path-converter/src/ConverterInterface.php';
require_once 'lib/path-converter/src/Converter.php';

use MatthiasMullie\Minify;


class SourceManager {

	private $modules = array(
		// "modules/jquery-1.7.2.min.js",
		"modules/amplify.js",
		"modules/echo.js",
		"modules/file-icons.js",
		"modules/global.js",
		"modules/onyx.js",
		"modules/synthetic.js",
		"modules/types.js",
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
		$temp = Common::readDirectory(COMPONENTS);
		foreach ($temp as $component) {
			if (file_exists(COMPONENTS . "/" . $component . "/init.js")) {
				$this->components[] = "components/$component/init.js";
			}
		}

		$temp = Common::readDirectory(PLUGINS);
		foreach ($temp as $plugin) {
			if (file_exists(PLUGINS . "/" . $plugin . "/init.js")) {
				$this->pluginsJS[] = "plugins/$plugin/init.js";
			}
			if (file_exists(PLUGINS . "/" . $plugin . "/screen.css")) {
				$this->pluginsCSS[] = "plugins/$plugin/screen.css";
			}
		}
	}

	function loadAndMinifyJS($type, $minifiedFileName, $files) {

		$content = '';
		$minified = "/* Creation Time: " . date('Y-m-d H:i:s', time()) . "*/" . PHP_EOL;

		foreach ($files as $file) {
			if (is_readable($file)) {
				$content = file_get_contents($file);
				$minified .= "/* $file */" . PHP_EOL;
				if ($type === "js") {
					$minifier = new Minify\JS($content);
					$minified .= $minifier->minify() . ';' . PHP_EOL;
				} else {
					$minifier = new Minify\CSS($content);
					if ($minifiedFileName === "fonts.min.css") {
						$minifier->setMaxImportSize(100);
						$minifier->setImportExtensions(array(
							'woff2' => 'application/font-woff2'
						));
					}
					$minified .= $minifier->minify() . PHP_EOL;
				}
			}
		}
		file_put_contents($minifiedFileName, $minified);
	}

	// This is a conditional that helps during developement of Atheos.
	function echoScripts($dataset = [], $raw = false) {
		echo "<!-- " . strtoupper($dataset) . " -->";

		$files = array();

		switch ($dataset) {
			case "modules":
				$files = $this->modules;
				break;
			case "components":
				$files = $this->components;
				break;
			case "pluginsJS":
				$files = $this->pluginsJS;
				break;
			case "pluginsCSS":
				$files = $this->pluginsCSS;
				break;
			default:
				return false;
				break;
		}

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
					$this->loadAndMinifyJS("js", $minifiedFileName, $files);
				}
			} else {
				$this->loadAndMinifyJS("js", $minifiedFileName, $files);
			}
			echo("<script src=\"$minifiedFileName\"></script>");
		}
	}

	function loadAndMinifyCSS($type, $minifiedFileName, $files) {
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
			case "pluginsCSS":
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
					$this->loadAndMinifyCSS("css", $minifiedFileName, $files);
				}
			} else {
				$this->loadAndMinifyCSS("css", $minifiedFileName, $files);
			}
			echo("<link rel=\"stylesheet\" href=\"$minifiedFileName\">");
		}
	}
}