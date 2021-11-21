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
		'vue' => 'javascript',
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
		'apache_conf',
		'applescript',
		'asciidoc',
		'assembly_x86',
		'autohotkey',
		'batchfile',
		'c9search',
		'c_cpp',
		'cirru',
		'clojure',
		'cobol',
		'coffee',
		'coldfusion',
		'csharp',
		'css',
		'curly',
		'd',
		'dart',
		'diff',
		'django',
		'dockerfile',
		'dot',
		'eiffel',
		'ejs',
		'elixir',
		'elm',
		'erlang',
		'forth',
		'ftl',
		'gcode',
		'gherkin',
		'gitignore',
		'glsl',
		'gobstones',
		'golang',
		'groovy',
		'haml',
		'handlebars',
		'haskell',
		'haxe',
		'html',
		'html_elixir',
		'html_ruby',
		'ini',
		'io',
		'jack',
		'jade',
		'java',
		'javascript',
		'json',
		'jsoniq',
		'jsp',
		'jsx',
		'julia',
		'latex',
		'lean',
		'less',
		'liquid',
		'lisp',
		'livescript',
		'logiql',
		'lsl',
		'lua',
		'luapage',
		'lucene',
		'makefile',
		'markdown',
		'mask',
		'matlab',
		'maze',
		'mel',
		'mips_assembler',
		'mushcode',
		'mysql',
		'nix',
		'nsis',
		'objectivec',
		'ocaml',
		'pascal',
		'perl',
		'pgsql',
		'php',
		'plain_text',
		'powershell',
		'praat',
		'prolog',
		'protobuf',
		'python',
		'r',
		'razor',
		'rdoc',
		'rhtml',
		'rst',
		'ruby',
		'rust',
		'sass',
		'scad',
		'scala',
		'scheme',
		'scss',
		'sh',
		'sjs',
		'smarty',
		'snippets',
		'soy_template',
		'space',
		'sql',
		'sqlserver',
		'stylus',
		'svg',
		'swift',
		'swig',
		'tcl',
		'tex',
		'text',
		'textile',
		'toml',
		'twig',
		'typescript',
		'vala',
		'vbscript',
		'velocity',
		'verilog',
		'vhdl',
		'wollok',
		'xml',
		'xquery',
		'yaml'
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
		
		debug($map);
		debug(gettype($map));

		$len = count($map["extension"]);

		$extensions = $map["extension"];
		$textmodes = $map["textmode"];

		for ($i = 0; $i < $len; $i++) {
			$ext = strtolower(trim($extensions[$i]));
			$mode = strtolower(trim($textmodes[$i]));

			if ($mode === '' || $ext === '') continue;

			if (!$this->validMode($mode) || !$this->validateExtension($ext)) {
				Common::send("error", "Invalid mode or extension.");
			}

			if (isset($customMap[$ext])) {
				Common::send("error", i18n("extensionSet"));
			} else {
				$customMap[$ext] = $mode;
			}
		}
		
		debug($customMap);

		Common::saveJSON("extensions", $customMap);
		Common::send("success", "Textmodes saved.");
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
		Common::send("success", array('extensionMap' => $validMap, 'modes' => $this->availableModes));
	}

	//////////////////////////////////////////////////////////////////
	// Create a select field with options for all availble textmodes, current one selected.
	//////////////////////////////////////////////////////////////////
	public function createTextModeSelect($extension) {
		$extension = trim(strtolower($extension));
		$find = false;
		$html = '<select name="textmode">'."\n";
		foreach ($this->availableModes as $mode) {
			$html .= '	<option';
			if ($mode == $extension) {
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