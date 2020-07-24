<?php
/**
* Pico Pagination Plugin
*
* @author Andrew Meyer
* @link http://rewdy.com
* @license http://opensource.org/licenses/MIT
* @version 1.4
*/
class Pagination extends AbstractPicoPlugin {

	const API_VERSION = 2;


	public $config = array();
	public $offset = 0;
	public $page_number = 0;
	public $total = 1;
	public $limit = 4;
	public $pagination = array();

	public function onConfigLoaded(array &$config) {
		// Get site data

		$this->feedTitle = $config["site_title"];
		$this->baseURL = $config["base_url"];
	}

	public function onPagesLoaded(&$pages) {
		// Filter the pages returned based on the pagination options

		$show_pages = array();
		$temp = array();

		foreach ($pages as $page) {

			if (isset($page["meta"]["template"]) && $page["meta"]['template'] === "post") {
				$temp[] = $page;
			}
		}

		$this->total = ceil(count($temp) / $this->limit);
		$offset = $this->offset - 1;
		$offset = ($offset % $this->total) * $this->limit;

		// Standard loop stuff
		$count = count($temp);
		for ($i = $offset; $i < $count; $i++) {
			$show_pages[$i] = $temp[$i];
		}

		for ($i = 0; $i < $offset; $i++) {
			$show_pages[$i] = $temp[$i];
		}


		// set filtered pages to paged_pages
		$this->pagination = $show_pages;
	}

	public function onPageRendering(string &$templateName, array &$twigVariables) {

		// send the paged pages in separate var
		$twigVariables['pagination'] = array_slice($this->pagination, 0, $this->limit);
		// $twigVariables['pagination'] = $this->pagination;

		// set var for page_number
		$twigVariables['page_number'] = $this->offset;

		// set var for total pages
		$twigVariables['total_pages'] = $this->total;

		// build pagination links
		// set next and back link vars to empty. links will be added below if they are available.

		$page_list = "<pagination>";

		$prev_page_link = $this->baseURL . "slog?page=" . ($this->offset - 1);
		if ($this->offset > 1) {
			$page_list .= "<a class=\"prev\" href=\"$prev_page_link\"><icon class=\"bracket-left\"></icon></a>";
		} else {
			// $page_list .= "<a disabled class=\"prev hidden\" href=\"$prev_page_link\"><icon class=\"bracket-left\"></icon></a>";
		}

		for ($i = 1; $i <= $this->total; $i++) {
			$page_link = $this->baseURL . "slog?page=$i";
			if ($i == $this->offset) {
				$page_list .= "<a class=\"current\" href=\"$page_link\">$i</a>";
			} else {
				$page_list .= "<a href=\"$page_link\">$i</a>";
			}
		}

		$next_page_link = $this->baseURL . "slog?page=" . ($this->offset + 1);
		if ($this->offset < $this->total) {
			$page_list .= "<a class=\"next\" href=\"$next_page_link\"><icon class=\"bracket-right\"></icon></a>";
		} else {
			// $page_list .= "<a disabled class=\"next hidden\" href=\"$next_page_link\"><icon class=\"bracket-right\"></icon></a>";
		}

		$page_list .= "</pagination>";

		$twigVariables['pagination_links'] = $page_list;
	}

	public function onRequestUrl(&$url) {
		$this->offset = isset($_GET["page"]) ? $_GET["page"] : 1;
	}
}