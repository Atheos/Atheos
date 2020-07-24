<?php
/**
* Output Pico CMS page data as raw text, html, json or xml with `?output`.
*
* @author  Nicolas Liautaud
* @link    https://github.com/nliautaud/pico-content-output
* @link    http://picocms.org
* @license http://opensource.org/licenses/MIT The MIT License
*/
class PicoOutput extends AbstractPicoPlugin {
	const API_VERSION = 3;

	/**
	* Output the page data in the defined format.
	*
	* Triggered after Pico has rendered the page
	*
	* @see DummyPlugin::onPageRendering()
	*
	* @param string &$output contents which will be sent to the user
	*
	* @return void
	*/
	public function onPageRendered(&$output) {
		if (empty($_GET['output'])) {
			return;
		}
		if ($this->canOutput($_GET['output'])) {
			$output = $this->contentOutput($_GET['output'], $output);
		}
	}

	/**
	* Check if the requested format is enabled in config.
	*
	* @param string $outputFormat
	*
	* @return bool
	*/
	public function canOutput($outputFormat) {
		$enabledFormats = $this->getPluginConfig('formats');
		if (!is_array($enabledFormats)) {
			$enabledFormats = array();
		}
		$pageMeta = $this->getFileMeta();
		if (isset($pageMeta['PicoOutput']) && is_array($pageMeta['PicoOutput']['formats'])) {
			$enabledFormats = array_merge($enabledFormats, $pageMeta['PicoOutput']['formats']);
		}
		return in_array($outputFormat, $enabledFormats);
	}

	/**
	* Get a plugin setting, on page metadata or on pico config
	*
	* @return mixed
	*/
	public function getSetting($key) {
		$pageMeta = $this->getFileMeta();
		if (isset($pageMeta['PicoOutput']) && isset($pageMeta['PicoOutput'][$key])) {
			return $pageMeta['PicoOutput'][$key];
		}
		return $this->getPluginConfig($key);
	}

	/**
	* Return the current page data in the defined format.
	*
	* @param string $outputFormat
	* @param string $default
	*
	* @return string
	*/
	private function contentOutput($outputFormat, $default) {
		$pico = $this->getPico();
		$page = $pico->getCurrentPage();
		unset($page['previous_page']);
		unset($page['next_page']);
		unset($page['tree_node']);
		switch ($outputFormat) {
			case 'raw':
				return $pico->getRawContent();
				break;
			case 'prepared':
				return $pico->prepareFileContent($pico->getRawContent(), $pico->getFileMeta());
				break;
			case 'json':
				header('Content-Type: application/json;charset=utf-8');
				return json_encode($page);
				break;
			case 'xml':
				header("Content-type: text/xml");
				$xml = new SimpleXMLElement('<page/>');
				PicoOutput::arrayToXML($page, $xml);
				return $xml->asXML();
				break;
			case 'content':
				return $pico->getFileContent();
				break;
			default:
				return $default;
				break;
		}
	}

	/**
	* Convert an array to a SimpleXMLElement
	*
	* @param [arr] $arr
	* @param [SimpleXMLElement] $xmlRoot
	* @return void
	* @see https://stackoverflow.com/a/5965940
	*/
	private static function arrayToXML($arr, &$xmlRoot) {
		foreach ($arr as $key => $value) {
			if (is_numeric($key)) {
				$key = 'item'.$key; //dealing with <0/>..<n/> issues
			}
			if (is_array($value)) {
				$subnode = $xmlRoot->addChild($key);
				PicoOutput::arrayToXML($value, $subnode);
			} else {
				$xmlRoot->addChild("$key", htmlspecialchars("$value"));
			}
		}
	}
}