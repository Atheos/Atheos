<?php

if (file_exists("cache/market.php") && time() - filemtime("cache/market.php") > (24 * 3600)) {
	echo file_get_contents("cache/market.php");
	die;
}

function sort_name($a, $b) {
	return strnatcmp($a, $b);
}


$data = array(
	"plugins" => array(),
	"themes" => array()
);
if (file_exists("data/plugins.json")) {
	$plugins = json_decode(file_get_contents('data/plugins.json'), true);
	$data["plugins"] = $plugins;
	ksort($data["plugins"]);
}
if (file_exists("data/themes.json")) {
	$themes = json_decode(file_get_contents('data/themes.json'), true);
	$data["themes"] = $plugins;
	ksort($data["themes"]);

}

$table = '';


if (!empty($data["plugins"])) {
	foreach ($data["plugins"] as $category => $plugins) {
		$table .= '<tr class="category">';
		$table .= '<th colspan="5"><strong>'.$category.'</strong></th>';
		$table .= '</tr>';
		// usort($plugins, 'sort_name');

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
		// usort($themes, 'sort_name');
		
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


$html = "
<h2>Atheos Plugins</h2>

<br>
<p>
	Below are plugins tested and approved by the <strong>Atheos</strong> team. To install simply download and place the plugin's folder in (or git-clone into) the /plugins directory in Codiad. Then in the right-hand bar
	use the Plugins tool to enable the plugin. You can also easily <a href=\"https://github.com/HLSiira/Atheos-Plugin-Template\" target=\"_blank\">write your own</a>.
</p>
<table class=\"datatable\">
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
			<th>Author</th>
			<th colspan=\"2\">Download</th>
		</tr>
	</thead>
	<tbody>
 ";

$html .= $table;

$html .= "
	</tbody>
</table>
<br>

<p>
	<em>Please note: While we test plugins before adding them to this list we cannot guarantee quality or provide any warranty. If you have any issues please address them directly with the plugin author.</em>
	<em>From Liam Siira: Many of these plugins were created with the original Codiad layout in mind, and as such are decidely not guaranteed to work with Atheos, however I am doing my best to slowly update all of the plugins I can.</em>
</p>

<h3>Submit a Plugin / Theme</h3>

<p>
	If you would like to submit a plugin or theme, please open an issue on <a href=\"https://github.com/Atheos/Atheos/issues/\">Github</a>.
</p>

<p>
	Not sure how to get started? Check out the <a href=\"https://github.com/Atheos/Plugin-Template\" target=\"_blank\">Atheos Plugin Template</a>.
</p>
";

file_put_contents("cache/market.php", $html);
echo $html;