<?php

/**
* Picotags
*
* Adds page tagging functionality to Pico.
*
* @author Dan Reeves
* @link https://github.com/DanReeves/picotags/
* @license http://danreeves.mit-license.org/
*/
class PicoTags extends AbstractPicoPlugin {
	const API_VERSION = 3;

	public $is_tag;
	public $current_tag;
	protected $pages;
	protected $related;
	protected $filtered;

	public function onMetaHeaders(array &$headers) {
		// Define tags variable
		$headers['Tags'] = 'tags';
	}

	public function onPagesLoaded(array &$pages) {
		$this->pages = $pages;


		if (empty($_GET["tag"])) {
			return;
		}
		$tag = $_GET["tag"];

		foreach ($pages as $page) {
			$tags = isset($page["tags"]) ? explode(", ", $page["tags"]) : false;
			if ($tags && in_array($tag, $tags)) {
				$this->filtered[] = $page;
			}
		}

		$this->pages = $pages;
	}

	public function onPageRendering(string &$templateName, array &$twigVariables) {
		if (empty($twigVariables["meta"]["tags"])) {
			return;
		}

		$currentTags = explode(",", $twigVariables["meta"]["tags"]);

		$related = array();

		foreach ($this->pages as $page) {

			$tags = isset($page["meta"]["tags"]) ? explode(", ", $page["meta"]["tags"]) : false;
			if ($tags && count(array_intersect($currentTags, $tags)) > 0) {
				$related[] = $page;
			}

		}
		
		// echo json_encode($related);


		$twigVariables['related_posts'] = $related;
	}
}