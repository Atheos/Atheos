<?php

//////////////////////////////////////////////////////////////////////////////80
// TextMode
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @ccvca, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class TextMode {

	//////////////////////////////////////////////////////////////////
	//default associations
	//////////////////////////////////////////////////////////////////
	private $defaultExtensions = array(
		'html' => 'html',
		'htm' => 'html',
		'tpl' => 'html',
		'js' => 'javascript',
		'css' => 'css',
		'scss' => 'scss',
		'sass' => 'scss',
		'less' => 'less',
		'php' => 'php',
		'php4' => 'php',
		'php5' => 'php',
		'phtml' => 'php',
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
		'coffee' => 'coffee',
		'vm' => 'velocity');

	//////////////////////////////////////////////////////////////////
	//availiable text modes
	//////////////////////////////////////////////////////////////////
	private $availiableTextModes = array(
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

	public function getAvailiableTextModes() {
		return $this->availiableTextModes;
	}

	public function getDefaultExtensions() {
		return $this->defaultExtensions;
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
	public function validTextMode($mode) {
		return in_array($mode, $this->availiableTextModes);
	}

	//////////////////////////////////////////////////////////////////
	//process the form with the associations
	//////////////////////////////////////////////////////////////////
	public function setTextModes() {
		//Store Fileextensions and Textmodes in File:
		$modes = Common::post('textmode');
		$extensions = Common::post('extension');

		$modes = explode(",", $modes);
		$extensions = explode(",", $extensions);

		if (is_array($extensions) && is_array($modes)) {} else {
			Common::sendJSON("error", "invalid data");
			return false;
		}

		$textmodeMap = array();

		$message = "Textmodes saved";

		//Iterate over the sended extensions
		foreach ($extensions as $key => $extension) {
			// Ignore empty extensions
			if (trim($extension) == '') {
				continue;
			}

			//get the sended data and check it
			// if (!in_array($key, $modes, TRUE)) {
			if (!isset($modes[$key])) {
				Common::sendJSON("error", "invalid data");
				return false;
			}

			$extension = strtolower(trim($extension));
			$mode = strtolower(trim($modes[$key]));
			Common::$debugMessageStack[] = "$extension:$mode";

			if (!$this->validateExtension($extension)) {
				Common::sendJSON("error", 'Invalid Extension: '.htmlentities($extension));
				return false;
			}

			if (!$this->validTextMode($mode)) {
				Common::sendJSON("error", 'Invalid TextMode: '.htmlentities($textMode));
				return false;
			}

			//Check for duplicate extensions
			if (isset($textmodeMap[$extension])) {
				$message = htmlentities($extension).' is already set.<br/>';
			} else {
				$textmodeMap[$extension] = $mode;
			}
		}

		//store the associations
		Common::saveJSON("extensions", $textmodeMap);
		Common::sendJSON("success", array("extensions" => $textmodeMap, "message" => $message));
	}

	//////////////////////////////////////////////////////////////////
	//Send the default extensions
	//////////////////////////////////////////////////////////////////
	public function getTextModes() {
		$extensions = Common::readJSON("extensions");

		if (!is_array($extensions)) {
			$extensions = $this->defaultExtensions;
		}

		//the availiable extensions, which aren't removed
		$availEx = array();
		foreach ($extensions as $ex => $mode) {
			if (in_array($mode, $this->availiableTextModes)) {
				$availEx[$ex] = $mode;
			}
		}
		Common::sendJSON("success", array('extensions' => $availEx, 'textModes' => $this->availiableTextModes));
	}

	//////////////////////////////////////////////////////////////////
	// Create a select field with options for all availble textmodes, current one selected.
	//////////////////////////////////////////////////////////////////
	public function getTextModeSelect($extension) {
		$extension = trim(strtolower($extension));
		$find = false;
		$html = '<select name="textmode" class="textMode">'."\n";
		foreach ($this->getAvailiableTextModes() as $textmode) {
			$html .= '	<option';
			if ($textmode == $extension) {
				$html .= ' selected="selected"';
				$find = true;
			}
			$html .= '>'.$textmode.'</option>'."\n";
		}

		//unknown extension, print it in the end
		if (!$find && $extension != '') {
			$html .= '	<option selected="selected">'.$textmode.'</option>'."\n";
		}

		$html .= '</select>'."\n";

		return $html;
	}
}