<?php

class PicoMarket extends AbstractPicoPlugin {
	const API_VERSION = 3;

	protected $data;

	protected $returnJSON = false;

	private $dataDir = "config/data/";

	public function onRequestUrl(&$url) {
		// If example.com/feed, then true
		if (strpos($url, "market") === 0) {
			$plugins = $this->dataDir . "plugins.json";
			$themes = $this->dataDir . "themes.json";

			$plugins = file_exists($plugins) ? json_decode(file_get_contents($plugins), true) : array();
			$themes = file_exists($themes) ? json_decode(file_get_contents($themes), true) : array();

			$this->data = array(
				"plugins" => $plugins,
				"themes" => $themes
			);

			ksort($data["plugins"]);
			ksort($data["themes"]);
		}

		if ($url === "market/json") {
			header('Content-Type: application/json');
			header("Access-Control-Allow-Origin: *");
			$data = json_encode($this->data, JSON_PRETTY_PRINT);
			die($data);
		}

		if ($url === "update") {
			header('Content-Type: application/json');
			header("Access-Control-Allow-Origin: *");

			$remote_url = "https://api.github.com/repos/Atheos/Atheos/releases/latest";
			// $remote_data = file_get_contents($remote_url);

			$curl = curl_init();
			curl_setopt($curl, CURLOPT_URL, $remote_url);
			//curl_setopt($curl, CURLOPT_POSTFIELDS, "");

			curl_setopt($curl, CURLOPT_HEADER, 0);
			curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
			curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
			curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13');

			$cont = curl_exec($curl);
			curl_close($curl);

			$data = json_decode($cont, true);
			$data = json_encode($data, JSON_PRETTY_PRINT);
			die($data);
		}
	}

	public function onPageRendering(string &$templateName, array &$twigVariables) {
		$data = $this->data;
		$table = '';

		if (!empty($data["plugins"])) {
			foreach ($data["plugins"] as $category => $plugins) {
				$table .= '<tr class="category">';
				$table .= '<th colspan="5"><strong>'.$category.'</strong></th>';
				$table .= '</tr>';

				foreach ($plugins as $name => $plugin) {
					$table .= '<tr>';
					$table .= '<td><span>Name</span>'.$name.'</td>';
					$table .= '<td><span>Description</span>'.$plugin['description'].'</td>';
					$table .= '<td><span>Author</span>'.$plugin['author'][0].'</td>';
					$table .= '<td class="center icon"><a target="_blank" href="'.$plugin['url'].'/archive/master.zip" class="medium-green icon-download" alt="Download Zip"></a></td>';
					// $table .= '<span class="splitter">|</span>';
					$table .= '<td class="center icon"><a target="_blank" href="'.$plugin['url'].'" class="medium-blue icon-github" alt="GitHub Repo"></a></td>';
					$table .= '</tr>';
				}
			}
		}

		if (!empty($data["themes"])) {
			foreach ($data["plugins"] as $category => $themes) {
				$table .= '<tr class="category">';
				$table .= '<th colspan="5"><strong>'.$category.'</strong></th>';
				$table .= '</tr>';

				foreach ($themes as $name => $theme) {
					$table .= '<tr>';
					$table .= '<td><span>Name</span>'.$theme['name'].'</td>';
					$table .= '<td><span>Description</span>'.$theme['description'].'</td>';
					$table .= '<td><span>Author</span><a target="_blank" href="http://github.com/'.$theme['author'].'">'.$theme['author'][0].'</a></td>';
					$table .= '<td class="center icon"><a target="_blank" href="'.$theme['url'].'/archive/master.zip" class="medium-green icon-download" alt="Download Zip"></a></td>';
					// $table .= '<span class="splitter">|</span>';
					$table .= '<td class="center icon"><a target="_blank" href="'.$theme['url'].'" class="medium-blue icon-github" alt="GitHub Repo"></a></td>';
					$table .= '</tr>';
				}
			}
		}
		$twigVariables['market_table'] = $table;
	}
}