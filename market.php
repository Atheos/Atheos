<h2>Atheos Plugins</h2>

<br>

<p>
	Below are plugins tested and approved by the <strong>Atheos</strong> team. To install simply download and place the plugin's folder in (or git-clone into) the /plugins directory in Codiad. Then in the right-hand bar
	use the Plugins tool to enable the plugin. You can also easily <a href="https://github.com/HLSiira/Atheos-Plugin-Template" target="_blank">write your own</a>.
</p>
<table class="datatable">
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
			<th>Author</th>
			<th colspan="2">Download</th>
		</tr>
	</thead>
	<tbody>
		<?php


		$plugins = json_decode(file_get_contents('data/plugins.json'), true);
		$data = array();
		foreach ($plugins as $plugin) {
			if (!isset($plugin['category'])) {
				$plugin['category'] = 'Common';
			}
			if (!isset($data[$plugin['category']])) {
				$data[$plugin['category']] = array();
			}
			array_push($data[$plugin['category']], $plugin);
		}
		ksort($data);
		//$themes = json_decode(file_get_contents('http://Atheos.com/themes.json'),true);

		foreach ($data as $category => $plugins) {
			echo '<tr class="category">';
			echo '<th colspan="5"><strong>'.$category.'</strong></th>';
			echo '</tr>';
			usort($plugins, 'sort_name');
			foreach ($plugins as $plugin) {
				echo '<tr>';
				echo '<td><span>Name</span>'.$plugin['name'].'</td>';
				echo '<td><span>Description</span>'.$plugin['description'].'</td>';
				echo '<td><span>Author</span><a target="_blank" href="http://github.com/'.$plugin['author'].'">'.$plugin['author'].'</a></td>';
				echo '<td class="center icon"><a target="_blank" href="'.$plugin['url'].'/archive/master.zip" class="medium-green icon-download" alt="Download Zip"></a></td>';
				// echo '<span class="splitter">|</span>';
				echo '<td class="center icon"><a target="_blank" href="'.$plugin['url'].'" class="medium-blue icon-github" alt="GitHub Repo"></a></td>';
				echo '</tr>';
			}

		}

		function sort_name($a, $b) {
			return strnatcmp($a['name'], $b['name']);
		}

		?>
	</tbody>
</table>
<br>

<p>
	<em>Please note: While we test plugins before adding them to this list we cannot guarantee quality or provide any warranty. If you have any issues please address them directly with the plugin author.</em>
	<em>From Liam Siira: Many of these plugins were created with the original Codiad layout in mind, and as such are decidely not guaranteed to work with Atheos, however I am doing my best to slowly update all of the plugins I can.</em>
</p>

<h3>Submit a Plugin / Theme</h3>

<p>
	If you would like to submit a plugin or theme, please open an issue on <a href="https://github.com/HLSiira/Atheos/issues/">Github</a> (New Issue).
</p>

<p>
	Not sure how to get started? Check out the <a href="https://github.com/HLSiira/Atheos-Plugin-Template" target="_blank">Atheos Plugin Template</a>.
</p>

<h3>Support the Atheos Project</h3>

<p>
	Hey, this is the person who this Coffee Button supports.
</p>
<p>
	If you want to support Codiad, and all the hard work that they did, please donate to them on <a href="https://www.codiad.com">Codiad</a>.
	I am maintaining my fork of Atheos out of my own personal desire on my own personal time. I am just a dude who likes to program whenever I can as the job that I have has nothing to do with fun.
	If you want to see Atheos be developed further, don't worry, it most likely will as I love working on it and want to see it succeed. The Codiad folks really created a piece of art.
</p>
<p>
	But everyone loves a little bit of recognition and I'm not exception.
	A nice supportive email or message would do me just fine.
</p>
<p>
	Well then why the BuyMeACoffee button? Because it lets me know that there are people behind me that want me to succeed and stay focused on the job.
	I'll probably keep working on Atheos as long as I know there are people interested in it, but please, I can't stress this enough: I don't want you to feel like you have to support me or Atheos.
</p>
<p class="right">
	From Liam Siira
</p>
<a id="coffee" target="_blank" href="https://www.buymeacoffee.com/Hlsiira">
	<img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="Buy me a coffee">
	<span style="margin-left:15px;font-size:19px !important;">Support Atheos</span>
</a>