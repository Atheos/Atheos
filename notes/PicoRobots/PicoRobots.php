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
    /**
     * This plugin uses Pico's API version 2 as of Pico 2.0
     *
     * @var int
     */
    const API_VERSION = 2;

    /**
     * List of robots exclusion rules
     *
     * @see PicoRobots::getRobots()
     * @var array[]|null
     */
    protected $robots;

    /**
     * List of sitemap records
     *
     * @see PicoRobots::getSitemap()
     * @var array[]|null
     */
    protected $sitemap;

    /**
     * Disables this plugin if neither robots.txt nor sitemap.xml is requested
     *
     * @see DummyPlugin::onRequestUrl()
     */
    public function onRequestUrl(&$requestUrl)
    {
        if (!in_array($requestUrl, array('robots.txt', 'sitemap.xml'), true)) {
            $this->setEnabled(false);
        }
    }

    /**
     * Sets a page's last modification time and its default sitemap status
     *
     * @see DummyPlugin::onSinglePageLoaded()
     */
    public function onSinglePageLoaded(array &$pageData)
    {
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

    /**
     * Tells Pico to serve the robots.txt resp. sitemap.xml
     *
     * You can overwrite the plugin's default templates for `robots.txt` and
     * `sitemap.xml` by simply adding a `robots.twig` resp. `sitemap.twig` to
     * your theme.
     *
     * @see DummyPlugin::onPageRendering()
     */
    public function onPageRendering(&$twigTemplate, array &$twigVariables)
    {
        // if ($this->getRequestUrl() === 'robots.txt') {
        //     header($_SERVER['SERVER_PROTOCOL'] . ' 200 OK');
        //     header('Content-Type: text/plain; charset=utf-8');
        //     $twigTemplate = 'robots.twig';

        //     $twigVariables['robots'] = $this->getRobots();
        // }

        if ($this->getRequestUrl() === 'sitemap.xml') {
            header($_SERVER['SERVER_PROTOCOL'] . ' 200 OK');
            header('Content-Type: application/xml; charset=utf-8');
            $twigTemplate = 'sitemap.twig';

            $twigVariables['sitemap'] = $this->getSitemap();
        }
    }

    /**
     * Returns the structured contents of robots.txt
     *
     * This method triggers the `onRobots` event when the contents of
     * `robots.txt` weren't assembled yet.
     *
     * @return array[] list of robots exclusion rules
     */
    public function getRobots()
    {
        if ($this->robots === null) {
            $this->robots = array();

            $robotsConfig = $this->getPluginConfig('robots', array());
            foreach ($robotsConfig as $rule) {
                $userAgents = !empty($rule['user_agents']) ? (array) $rule['user_agents'] : array();
                $disallow = !empty($rule['disallow']) ? (array) $rule['disallow'] : array();
                $allow = !empty($rule['allow']) ? (array) $rule['allow'] : array();

                $this->robots[] = array(
                    'user_agents' => $userAgents ?: array('*'),
                    'disallow' => $disallow ?: (!$allow ? array('/') : array()),
                    'allow' => $allow
                );
            }

            $this->triggerEvent('onRobots', array(&$this->robots));
        }

        return $this->robots;
    }

    /**
     * Returns the structure contents of sitemap.xml
     *
     * This method triggers the `onSitemap` event when the contents of
     * `sitemap.xml` weren't assembled yet.
     *
     * @return array[] list of sitemap records
     */
    public function getSitemap()
    {
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

    /**
     * Registers the Sitemap meta header
     *
     * @see DummyPlugin::onMetaHeaders()
     */
    public function onMetaHeaders(array &$headers)
    {
        $headers['Sitemap'] = 'sitemap';
    }

    /**
     * Adds the plugin's theme dir to Twig's template loader
     *
     * @see DummyPlugin::onTwigRegistered()
     */
    public function onTwigRegistered(Twig_Environment &$twig)
    {
        $twig->getLoader()->addPath(__DIR__ . '/theme');
    }

    /**
     * Substitutes the placeholders %base_url% and %theme_url% in URLs
     *
     * @param string $url URL with (or without) placeholders
     *
     * @return string substituted URL
     */
    protected function substituteUrl($url)
    {
        $variables = array(
            '%base_url%?' => $this->getBaseUrl() . (!$this->isUrlRewritingEnabled() ? '?' : ''),
            '%base_url%' => rtrim($this->getBaseUrl(), '/'),
            '%theme_url%' => $this->getBaseThemeUrl() . $this->getConfig('theme')
        );

        return str_replace(array_keys($variables), $variables, $url);
    }
}
