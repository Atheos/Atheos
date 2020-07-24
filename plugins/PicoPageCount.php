<?php
/**
* Flat and nested pages list navigation for Pico CMS.
*
* - Adds twig global `{{ nested_pages }}` in addition to `{{ pages }}`
* - Render flat or nested HTML navigation tree with `navigation` twig filter
* - Filter pages and nested pages by paths with `exclude()` and `only()` twig filters
*
* Examples :
*
*     {{ pages | navigation }} // output a flat pages list
*     {{ nested_pages | navigation }} // output a nested pages list
*     {{ nested_pages | exclude('sub/page') | navigation }} // filtered nested pages list
*     {% assign filtered = pages | only('sub/path/') %} // get filtered flat pages array
*
* @author  Nicolas Liautaud
* @link    https://github.com/nliautaud/pico-pages-list
* @link    http://picocms.org
* @license http://opensource.org/licenses/MIT The MIT License
*/
class PicoPageCount extends AbstractPicoPlugin {
	const API_VERSION = 3;

	protected $items;

	private $cacheDir = "config/data/";
	private $type = "slog";

	public function onConfigLoaded(array &$config) {
		if (isset($config['cache_dir'])) {
			// ensure cache_dir ends with '/'
			$lastchar = substr($config['cache_dir'], -1);
			if ($lastchar !== '/') {
				$config['cache_dir'] = $config['cache_dir'].'/';
			}
			$this->cacheDir = $config['cache_dir'];
		}

		if (!is_dir($this->cacheDir)) {
			mkdir($this->cacheDir, 0775, true);
		}
	}

	public function onPagesLoaded(array &$pages) {
		$filename = $this->cacheDir . "views.json";

		$views = file_exists($filename) ? json_decode(file_get_contents($filename), true) : array();

		$views = array_slice($views, 0, 5, true);

		$this->items = array();
		foreach ($pages as $page) {
			foreach ($views as $url => $count) {
				if ($page["url"] && strpos($page["url"], $url) !== false) {
					$this->items[] = $page;
				}
			}
		}
	}

	public function onRequestUrl(&$url) {
		if (substr($url, 0, 4) !== $this->type) {
			return;
		}


		$name = explode("/", $url);
		$name = array_pop($name);
		


		$filename = $this->cacheDir . "views.json";

		$views = file_exists($filename) ? json_decode(file_get_contents($filename), true) : array();

		if (isset($views[$name])) {
			$views[$name]++;
		} else {
			$views[$name] = 1;
		}

		return;

		arsort($views);
		file_put_contents($filename, json_encode($views, JSON_PRETTY_PRINT));
	}

	public function onPageRendering(string &$templateName, array &$twigVariables) {
		$twigVariables['popular_posts'] = $this->items;
		// $twigVariables['popular_posts'] = array();
	}
}