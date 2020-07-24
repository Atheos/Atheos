<?php

/**
* Pico robots plugin - add a robots.txt and sitemap.xml to your website
*
* PicoRobots is a simple plugin that add a `robots.txt` and `sitemap.xml` to
* your website. Both the robots exclusion protocol (`robots.txt`) and the
* Sitemaps protocol (`sitemap.xml`) are used to communicate with web crawlers
* and other web robots. `robots.txt` informs the web robot about which areas
* of your website should not be processed or scanned. `sitemap.xml` allows
* web robots to crawl your website more intelligently. `sitemap.xml` is a URL
* inclusion protocol and complements `robots.txt`, a URL exclusion protocol.
*
* @author  Daniel Rudolf
* @link    http://picocms.org
* @license http://opensource.org/licenses/MIT The MIT License
* @version 1.0.0
*/
class PicoRobots extends AbstractPicoPlugin
{

	const API_VERSION = 3;

	protected $robots;

	protected $sitemap;

	public function onRequestUrl(&$requestUrl) {
		if (!in_array($requestUrl, array('robots.txt', 'sitemap.xml'), true)) {
			$this->setEnabled(false);
		}
	}


	public function onSinglePageLoaded(array &$pageData) {
		if (($this->getRequestUrl() === 'sitemap.xml') && $pageData['id']) {
			$fileName = $this->getConfig('content_dir') . $pageData['id'] . $this->getConfig('content_ext');
			if (file_exists($fileName) && !isset($pageData['modificationTime'])) {
				$pageData['modificationTime'] = filemtime($fileName);
			}

			if (!$pageData['meta']['sitemap'] && ($pageData['meta']['sitemap'] !== false)) {
				$pageData['meta']['sitemap'] = true;

				if (preg_match('/(?:^|\/)_/', $pageData['id'])) {
					$pageData['meta']['sitemap'] = false;
				} else {
					$robots = explode(',', $pageData['meta']['robots']);
					$robots = array_map('strtolower', $robots);
					if (in_array('noindex', $robots)) {
						$pageData['meta']['sitemap'] = false;
					}
				}
			}
		}
	}

	public function onPageRendering(&$twigTemplate, array &$twigVariables) {
		if ($this->getRequestUrl() === 'sitemap.xml') {
			header($_SERVER['SERVER_PROTOCOL'] . ' 200 OK');
			header('Content-Type: application/xml; charset=utf-8');
			$twigTemplate = 'sitemap.twig';

			$twigVariables['sitemap'] = $this->getSitemap();
		}
	}

	public function getSitemap() {
		if ($this->sitemap === null) {
			$changeFrequencies = array('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never');
			$this->sitemap = array();

			$pages = $this->getPages();
			foreach ($pages as $pageData) {
				if (!empty($pageData['meta']['sitemap'])) {
					$modificationTime = null;
					if (isset($pageData['meta']['sitemap']['lastmod'])) {
						$modificationTime = $pageData['meta']['sitemap']['lastmod'] ?: null;

						if ($modificationTime && !is_int($modificationTime)) {
							$modificationTime = strtotime($modificationTime) ?: null;
						}
					} elseif (!empty($pageData['modificationTime'])) {
						$modificationTime = $pageData['modificationTime'];
					}

					$changeFrequency = null;
					if (!empty($pageData['meta']['sitemap']['changefreq'])) {
						$changeFrequency = $pageData['meta']['sitemap']['changefreq'];
					}

					$priority = null;
					if (isset($pageData['meta']['sitemap']['priority'])) {
						$priority = (float) $pageData['meta']['sitemap']['priority'];
					}

					$this->sitemap[] = array(
						'url' => $pageData['url'],
						'modificationTime' => $modificationTime,
						'changeFrequency' => in_array($changeFrequency, $changeFrequencies) ? $changeFrequency : null,
						'priority' => ($priority !== null) ? min(max(round($priority, 1), 0), 1) : null
					);
				}
			}

			$sitemapConfig = $this->getPluginConfig('sitemap', array());
			foreach ($sitemapConfig as $record) {
				if (!empty($record['url'])) {
					$modificationTime = !empty($record['lastmod']) ? $record['lastmod'] : null;
					$changeFrequency = !empty($record['changefreq']) ? $record['changefreq'] : null;
					$priority = isset($record['priority']) ? (float) $record['priority'] : null;

					if ($modificationTime && !is_int($modificationTime)) {
						$modificationTime = strtotime($modificationTime) ?: null;
					}

					$this->sitemap[] = array(
						'url' => $this->substituteUrl($record['url']),
						'modificationTime' => $modificationTime,
						'changeFrequency' => in_array($changeFrequency, $changeFrequencies) ? $changeFrequency : null,
						'priority' => ($priority !== null) ? min(max(round($priority, 1), 0), 1) : null
					);
				}
			}

			$this->triggerEvent('onSitemap', array(&$this->sitemap));
		}

		return $this->sitemap;
	}


	public function onMetaHeaders(array &$headers) {
		$headers['Sitemap'] = 'sitemap';
	}

	public function onTwigRegistered(Twig_Environment &$twig) {
		// $twig->getLoader()->addPath(__DIR__ . '/theme');
	}

	protected function substituteUrl($url) {
		$variables = array(
			'%base_url%?' => $this->getBaseUrl() . (!$this->isUrlRewritingEnabled() ? '?' : ''),
			'%base_url%' => rtrim($this->getBaseUrl(), '/'),
			'%theme_url%' => $this->getBaseThemeUrl() . $this->getConfig('theme')
		);

		return str_replace(array_keys($variables), $variables, $url);
	}
}