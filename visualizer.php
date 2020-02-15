<?php
// if (!file_exists("/tmp/atheos.full.cloc")) {
// 	$cloc_pretty = shell_exec('cd /var/www/atheos && cloc -vcs git --report-file=/tmp/atheos.summary.cloc');
// 	$cloc_ugly = shell_exec('cd /var/www/atheos && cloc -vcs git --csv --by-file --report-file=/tmp/atheos.full.cloc');
// } else {
// 	$cloc_pretty = file_get_contents("/tmp/atheos.summary.cloc");
// 	$cloc_ugly = file_get_contents("/tmp/atheos.full.cloc");

// 	// $json = explode('\n', $cloc_ugly);

// 	$csv = array_map('str_getcsv', explode("\n", $cloc_ugly));

// 	// $json = array_shift($json);

// 	$csv[0] = array("language", "filename", "loc", "null", "size");
// 	echo implode('|', $csv[0]);
// 	echo implode('|', $csv[1]);

// 	$json = array();

// 	foreach ($csv as $line) {
// 		$json[] = array(
// 			"language" => $line[0],
// 			"filename" => $line[1],
// 			"loc" => $line[2],
// 			"null" => $line[3],
// 			"size" => $line[4]
// 		);
// 	}

// 	$json = json_encode($json);

// 	file_put_contents("/tmp/data.json", $json)

// 	// $json = array_map("str_getcsv", $json);


// 	// while (($row = fgetcsv($fh, 0, ",")) !== FALSE) {
// 	// 	$json[] = $row;
// 	// }

// 	// $json = json_encode($json);

// 	// print_r($json);

// 	// echo implode(',', $json);

// 	// $filename = "/tmp/atheos.summary.cloc";

// 	// if (!file_exists($filename) || !is_readable($filename))
// 	// 	return FALSE;

// 	// $header = NULL;
// 	// $data = array();
// 	// if (($handle = fopen($filename, 'r')) !== FALSE) {
// 	// 	while (($row = fgetcsv($handle, 1000, $delimiter)) !== FALSE) {
// 	// 		if (!$header)
// 	// 			$header = $row;
// 	// 		else
// 	// 			$data[] = array_combine($header, $row);
// 	// 	}
// 	// 	fclose($handle);
// 	// }

// 	// echo implode(',', $data);


// 	?>


	<h1>CodeFlower Source code visualization</h1>
	<p class="lead">
		This experiment visualizes source repositories using an interactive tree. Each disc represents a file, with a radius proportional to the number of lines of code (loc). All rendering is done client-side, in JavaScript. Try hovering on nodes to see the loc number, clicking on directory nodes to fold them, dragging nodes to rearrange the layout, and changing project to see different tree structures. Built with <a href="https://github.com/mbostock/d3">d3.js</a>. Inspired by <a href="https://code.google.com/p/codeswarm/">Code Swarm</a> and <a href="https://code.google.com/p/gource/">Gource</a>.
	</p>

	<div id="visualization"></div>
	<h2>Purpose</h2>
	<ul class="unstyled">
		<li>Did you ever dive into an existing project and wish you could have a bird's eye view of the whole code?</li>
		<li>Did you ever have to refactor a large application and wish you knew where to start?</li>
		<li>Did you ever look for a visualization that would help you communicate visually with your teammates about a repository?</li>
	</ul>

	<h2>Input data format</h2>
	<p>
		The <code>jsonData</code> format taken as input to <code>update()</code> is extremely simple. It's a JavaScript object representing a file tree structure. Each node must have a <code>name</code> (the file or directory name), leaf nodes must have a <code>size</code> (the number of lines of code or the file), and directory nodes must have a <code>children</code> property containing an array of nodes. As an example, here is the input for the currently displayed CodeFlower. You can modify it at will and click the update button to see the effect of your changes on the CodeFlower.
	</p>

	<script type="text/javascript" src="assets/js/cf/d3/d3.js"></script>
	<script type="text/javascript" src="assets/js/cf/d3/d3.geom.js"></script>
	<script type="text/javascript" src="assets/js/cf/d3/d3.layout.js"></script>
	<script type="text/javascript" src="assets/js/cf/CodeFlower.js"></script>
	<script type="text/javascript">
		var countElements = function(node) {
			var nbElements = 1;
			if (node.children) {
				nbElements += node.children.reduce(function(p, v) {
					return p + countElements(v);
				}, 0);
			}
			return nbElements;
		};
		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open('GET', 'data/code-flower.json', true); // Replace 'my_data' with the path to your file
		xobj.onreadystatechange = function () {
			if (xobj.readyState == 4 && xobj.status == "200") {
				// Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
				var jsonData = JSON.parse(xobj.responseText);
				var total = countElements(jsonData);
				var w = parseInt(Math.sqrt(total) * 30, 10);
				var h = parseInt(Math.sqrt(total) * 30, 10);
				var myFlower = new CodeFlower("#visualization", w, h);
				myFlower.update(jsonData);
			}
		};
		xobj.send(null);
	</script>
