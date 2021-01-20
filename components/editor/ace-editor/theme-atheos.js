ace.define("ace/theme/atheos", ["require", "exports", "module", "ace/lib/dom"], function(require, exports, module) {

	exports.isDark = true;
	exports.cssClass = "ace-atheos";
	exports.cssText = `
.ace-atheos .ace_gutter {
	background: var(--background);
	color: var(--fontColorSmall);
	border-right: 1px solid var(--foreground);
}

.ace-atheos .ace_gutter-cell.ace_warning {
	background-image: none;
	background: var(--orange);
	border-left: none;
	padding-left: 0;
	color: var(--background);
}

.ace-atheos .ace_gutter-cell.ace_error {
	background-position: -6px center;
	background-image: none;
	background: var(--red);
	border-left: none;
	padding-left: 0;
	color: var(--background);
}

.ace-atheos .ace_print-margin {
	width: 1px;
	background: var(--shade6);
}

.ace-atheos {
	background-color: var(--background);
	color: var(--fontColorMajor);
}

.ace-atheos .ace_cursor {
	color: var(--cyan);
}

.ace-atheos .ace_marker-layer .ace_selection {
	background: var(--blue);
}

.ace-atheos.ace_multiselect .ace_selection.ace_start {
	box-shadow: 0 0 3px 0px var(--background);
}

.ace-atheos .ace_marker-layer .ace_step {
	background: #665200;
}

.ace-atheos .ace_marker-layer .ace_bracket {
	margin: -1px 0 0 -1px;
	border: 1px solid var(--fontColorSmall);
}

.ace-atheos .ace_marker-layer .ace_active-line {
	background: rgba(215, 215, 215, 0.031);
}

.ace-atheos .ace_gutter-active-line {
	background-color: rgba(215, 215, 215, 0.031);
}

.ace-atheos .ace_marker-layer .ace_selected-word {
	border: 1px solid var(--blue);
}

.ace-atheos .ace_invisible {
	color: var(--fontColorSmall);
}

.ace-atheos .ace_keyword,
.ace-atheos .ace_meta,
.ace-atheos .ace_support.ace_constant.ace_property-value {
	color: var(--orange);
}

.ace-atheos .ace_keyword.ace_operator {
	color: var(--orange);
}

.ace-atheos .ace_keyword.ace_other.ace_unit {
	color: var(--green);
}

.ace-atheos .ace_constant.ace_language {
	color: var(--olive);
}

.ace-atheos .ace_constant.ace_numeric {
	color: var(--green);
}

.ace-atheos .ace_constant.ace_character.ace_entity {
	color: var(--purple);
}

.ace-atheos .ace_invalid {
	color: var(--fontColorMajor);
	background-color: var(--red);
}

.ace-atheos .ace_fold {
	background-color: var(--orange);
	border-color: var(--fontColorSmall);
}

.ace-atheos .ace_storage,
.ace-atheos .ace_support,
.ace-ambiance .ace_type {
	color: var(--red);
}

.ace-atheos .ace_string {
	color: var(--cyan);
}

.ace-atheos .ace_constant,
.ace-atheos .ace_variable {
	color: var(--fontColorMajor);
}

.ace-atheos .ace_comment {
	color: var(--fontColorSmall);
}

.ace-atheos .ace_entity.ace_name.ace_tag,
.ace-atheos .ace_entity.ace_other.ace_attribute-name {
	color: var(--shade3);
}

.ace-atheos .ace_indent-guide {
	border-right: 1px dotted var(--foreground);
	margin-right: -1px;
}
`;

	var dom = require("../lib/dom");
	dom.importCssString(exports.cssText, exports.cssClass);
});
(function() {
	ace.require(["ace/theme/atheos"], function(m) {
		if (typeof module == "object" && typeof exports == "object" && module) {
			module.exports = m;
		}
	});
})();