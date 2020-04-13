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
		"modules/jquery-1.7.2.min.js",
		"modules/amplify.js",
		"modules/ajax.js",
		"modules/file-icons.js",
		// "modules/i18n.js",
		"modules/onyx.js",
		"modules/synthetic.js",
		"modules/types.js",
		// Global components need to be above this line.
		"modules/system.js",
		"modules/alert.js",
		"modules/flow.js",
		"modules/chrono.js",
		"modules/codiad.js",
		"modules/common.js",
		"modules/keybind.js",
		"modules/modal.js",
		"modules/storage.js",
		"modules/toast.js"
	);

	private $components = array();

	private $plugins = array();

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
				$this->plugins[] = "plugins/$plugin/init.js";
			}
		}
	}

	function loadAndMinifyJS($minifiedFileName, $files) {

		$javascript = '';
		$minifiedJS = "// Creation Time: " . date('Y-m-d H:i:s', time()) . PHP_EOL;

		foreach ($files as $file) {
			if (is_readable($file)) {
				$javascript = file_get_contents($file);
				$minifiedJS .= "// $file" . PHP_EOL;
				$minifier = new Minify\JS($javascript);
				$minifiedJS .= $minifier->minify() . ';' . PHP_EOL;
			}
		}
		file_put_contents($minifiedFileName, $minifiedJS);
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
			case "plugins":
				$files = $this->plugins;
				break;
			default:
				return false;
				break;
		}

		if ($raw) {
			$scripts = '';
			foreach ($files as $file) {
				$scripts .= ("<script type=\"text/javascript\" src=\"$file\"></script>");
			}
			echo $scripts;

		} else {
			$minifiedFileName = "public/$dataset.min.js";

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
}