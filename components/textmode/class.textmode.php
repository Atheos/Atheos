<?php

//////////////////////////////////////////////////////////////////////////////80
// TextMode
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @ccvca, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class TextMode {

	//////////////////////////////////////////////////////////////////
	// Default Extension Map
	//////////////////////////////////////////////////////////////////
	private $defaultExtensionMap = array(
		'sh' => 'sh',
		'html' => 'html',
		'htm' => 'html',
		'tpl' => 'html',
		'js' => 'javascript',
		'ts' => 'typescript',
		'css' => 'css',
		'scss' => 'scss',
		'sass' => 'scss',
		'less' => 'less',
		'liquid' => 'twig',
		'php' => 'php',
		'php4' => 'php',
		'php5' => 'php',
		'phtml' => 'php',
		'twig' => 'twig',
		'hbs' => 'handlebars',
		'htaccess' => 'io',
		'handlebars' => 'handlebars',
		'json' => 'json',
		'java' => 'java',
		'sty' => 'latex',
		'tex' => 'latex',
		'xml' => 'xml',
		'sql' => 'sql',
		'md' => 'markdown',
		'c' => 'c_cpp',
		'cpp' => 'c_cpp',
		'd' => 'd',
		'h' => 'c_cpp',
		'hpp' => 'c_cpp',
		'py' => 'python',
		'rb' => 'ruby',
		'erb' => 'html_ruby',
		'jade' => 'jade',
		'pug' => 'jade',
		'coffee' => 'coffee',
		'yml' => 'elm',
		'vm' => 'velocity');

	//////////////////////////////////////////////////////////////////
	// Availiable Highlighters
	//////////////////////////////////////////////////////////////////
	private $availableModes = array(
		'abap',
		'abc',
		'actionscript',
		'ada',
		'alda',
		'apache_conf',
		'apex',
		'applescript',
		'aql',
		'asciidoc',
		'asl',
		'assembly_arm32',
		'assembly_x86',
		'astro',
		'autohotkey',
		'basic',
		'batchfile',
		'bibtex',
		'c9search',
		'c_cpp',
		'cirru',
		'clojure',
		'clue',
		'cobol',
		'coffee',
		'coldfusion',
		'crystal',
		'csharp',
		'csound_document',
		'csound_orchestra',
		'csound_score',
		'csp',
		'css',
		'csv',
		'curly',
		'cuttlefish',
		'd',
		'dart',
		'diff',
		'django',
		'dockerfile',
		'dot',
		'drools',
		'edifact',
		'eiffel',
		'ejs',
		'elixir',
		'elm',
		'erlang',
		'flix',
		'forth',
		'fortran',
		'fsharp',
		'fsl',
		'ftl',
		'gcode',
		'gherkin',
		'gitignore',
		'glsl',
		'gobstones',
		'golang',
		'graphqlschema',
		'groovy',
		'haml',
		'handlebars',
		'haskell',
		'haskell_cabal',
		'haxe',
		'hjson',
		'html',
		'html_elixir',
		'html_ruby',
		'ini',
		'io',
		'ion',
		'jack',
		'jade',
		'java',
		'javascript',
		'jexl',
		'json',
		'json5',
		'jsoniq',
		'jsp',
		'jssm',
		'jsx',
		'julia',
		'kotlin',
		'latex',
		'latte',
		'less',
		'liquid',
		'lisp',
		'livescript',
		'logiql',
		'logtalk',
		'lsl',
		'lua',
		'luapage',
		'lucene',
		'makefile',
		'markdown',
		'mask',
		'matlab',
		'maze',
		'mediawiki',
		'mel',
		'mips',
		'mixal',
		'mushcode',
		'mysql',
		'nasal',
		'nginx',
		'nim',
		'nix',
		'nsis',
		'nunjucks',
		'objectivec',
		'ocaml',
		'odin',
		'partiql',
		'pascal',
		'perl',
		'pgsql',
		'php',
		'php_laravel_blade',
		'pig',
		'plain_text',
		'plsql',
		'powershell',
		'praat',
		'prisma',
		'prolog',
		'properties',
		'protobuf',
		'prql',
		'puppet',
		'python',
		'qml',
		'r',
		'raku',
		'razor',
		'rdoc',
		'red',
		'redshift',
		'rhtml',
		'robot',
		'rst',
		'ruby',
		'rust',
		'sac',
		'sass',
		'scad',
		'scala',
		'scheme',
		'scrypt',
		'scss',
		'sh',
		'sjs',
		'slim',
		'smarty',
		'smithy',
		'snippets',
		'soy_template',
		'space',
		'sparql',
		'sql',
		'sqlserver',
		'stylus',
		'svg',
		'swift',
		'tcl',
		'terraform',
		'tex',
		'text',
		'textile',
		'toml',
		'tsv',
		'tsx',
		'turtle',
		'twig',
		'typescript',
		'vala',
		'vbscript',
		'velocity',
		'verilog',
		'vhdl',
		'visualforce',
		'vue',
		'wollok',
		'xml',
		'xquery',
		'yaml',
		'zeek',
		'zig'
	);


	public function getAvailableModes() {
		return $this->availableModes;
	}

	public function getDefaultExtensionMap() {
		return $this->defaultExtensionMap;
	}

	//////////////////////////////////////////////////////////////////
	//checks if the sended extensions are valid to prevent any injections
	//////////////////////////////////////////////////////////////////
	public function validateExtension($extension) {
		return preg_match('#^[a-z0-9\_]+$#i', $extension);
	}

	//////////////////////////////////////////////////////////////////
	// Check to see if the text mode sent is a valid option.
	//////////////////////////////////////////////////////////////////
	public function validMode($mode) {
		return in_array($mode, $this->availableModes);
	}

	//////////////////////////////////////////////////////////////////
	//process the form with the associations
	//////////////////////////////////////////////////////////////////
	public function saveExtensionMap($map) {
		$customMap = array();
		
		$len = count($map["extension"]);

		$extensions = $map["extension"];
		$textmodes = $map["textmode"];

		for ($i = 0; $i < $len; $i++) {
			$ext = strtolower(trim($extensions[$i]));
			$mode = strtolower(trim($textmodes[$i]));

			if ($mode === '' || $ext === '') continue;

			if (!$this->validMode($mode) || !$this->validateExtension($ext)) {
				Common::send(418, "Invalid mode or extension.");
			}

			if (isset($customMap[$ext])) {
				Common::send(409, i18n("extensionSet"));
			} else {
				$customMap[$ext] = $mode;
			}
		}
		
		Common::saveJSON("extensions", $customMap);
		Common::send(200, "Textmodes saved.");
	}

	//////////////////////////////////////////////////////////////////
	// Send the default extensions
	//////////////////////////////////////////////////////////////////
	public function loadExtensionMap() {
		$map = Common::loadJSON("extensions");

		if (!$map || !is_array($map)) {
			$map = $this->defaultExtensionMap;
		}

		// Remove any extensions not in the available highlighters
		$validMap = array();

		foreach ($map as $extension => $mode) {
			if (in_array($mode, $this->availableModes)) {
				$validMap[$extension] = $mode;
			}
		}
		Common::send(200, array('extensionMap' => $validMap, 'modes' => $this->availableModes));
	}

	//////////////////////////////////////////////////////////////////
	// Create a select field with options for all availble textmodes, current one selected.
	//////////////////////////////////////////////////////////////////
	public function createTextModeSelect($extension, $currentMode) {
		$extension = trim(strtolower($extension));
		$find = false;
		$html = '<select name="textmode">'."\n";
		foreach ($this->availableModes as $mode) {
			$html .= '	<option';
			if ($mode == $currentMode) {
				$html .= ' selected="selected"';
				$find = true;
			}
			$html .= '>'.$mode.'</option>'."\n";
		}

		//unknown extension, print it in the end
		if (!$find && $extension != '') {
			$html .= '	<option selected="selected">'.$mode.'</option>'."\n";
		}

		$html .= '</select>'."\n";

		return $html;
	}
}