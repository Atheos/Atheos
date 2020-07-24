<?php
/**
* Output Pico CMS page data as raw text, html, json or xml with `?output`.
*
* @author  Nicolas Liautaud
* @link    https://github.com/nliautaud/pico-content-output
* @link    http://picocms.org
* @license http://opensource.org/licenses/MIT The MIT License
*/

class PicoRSS extends AbstractPicoPlugin {
	const API_VERSION = 3;

	private $giveFeed = false; // boolean to determine if the user has typed example.com/feed
	private $feedTitle = ""; // title of the feed will be the site title
	private $baseURL = ""; // this will hold the base url
	private $description = ""; // this will hold the base url

	protected $enabled = true;

	protected $dependsOn = array();

	public function onConfigLoaded(array &$config) {
		// Get site data

		$this->feedTitle = $config["site_title"];
		$this->baseURL = $config["base_url"];
		$this->description = $config["description"];
	}

	public function onRequestUrl(&$url) {
		// If example.com/feed, then true
		if ($url == "feed") {
			$this->giveFeed = true;
		}
	}


	public function onPagesLoaded(array &$pages, array &$currentPage = null, array &$previousPage = null, array &$nextPage = null	) {

		// If this is the feed link, return RSS feed
		if ($this->giveFeed) {
			//Sitemap found, 200 OK
			header($_SERVER["SERVER_PROTOCOL"] . " 200 OK");
			// header("Content-Type: application/rss+xml; charset=UTF-8");
			header('Content-Type: application/xml; charset=UTF-8');


			//Reverse order like in a blog
			$reverse_pages = array_reverse($pages);

			//RSS Start
			$xml = new DomDocument('1.0', "UTF-8");

			// create root node
			$rss = $xml->createElement('rss');
			$rss->setAttribute("version", "2.0");
			$rss->setAttribute("xmlns:atom", "http://www.w3.org/2005/Atom");

			$channel = $xml->createElement('channel');

			$title = $xml->createElement('title');
			$title->nodeValue = $this->feedTitle;
			$channel->appendChild($title);

			$description = $xml->createElement('description');
			$description->nodeValue = $this->description;
			$channel->appendChild($description);

			$link = $xml->createElement('link');
			$link->nodeValue = $this->baseURL;
			$channel->appendChild($link);

			$atom = $xml->createElement('atom:link');
			$atom->setAttribute("href", $this->baseURL . "feed");
			$atom->setAttribute("rel", "self");
			$atom->setAttribute("type", "application/rss+xml");
			$channel->appendChild($atom);

			foreach ($reverse_pages as $page) {
				if (!empty($page["date"])) {

					$item = $xml->createElement('item');

					$title = $xml->createElement('title');
					$title->nodeValue = $page["title"];
					$item->appendChild($title);

					$link = $xml->createElement('link');
					$link->nodeValue = $page["url"];
					$item->appendChild($link);

					$description = $xml->createElement('description');
					$description->nodeValue = $page["description"];
					$item->appendChild($description);

					$guid = $xml->createElement('guid');
					$guid->nodeValue = $page["url"];
					$item->appendChild($guid);

					$pubDate = $xml->createElement('pubDate');
					$pubDate->nodeValue = date("r", $page["time"]);
					$item->appendChild($pubDate);

					$channel->appendChild($item);
				}
			}


			$rss->appendChild($channel);
			$xml->appendChild($rss);
			// get completed xml document
			$xml->preserveWhiteSpace = false;
			$xml->formatOutput = true;
			$xml_string = $xml->saveXML();
			die($xml_string);
		}
	}

}