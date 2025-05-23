<label><i class="fas fa-palette"></i><?php echo i18n("editor_style"); ?></label>

<table>
	<tr>
		<td width="50%"><?php echo i18n("theme"); ?></td>
		<td>
			<!--<dropdown data-setting="editor.theme">-->
			<select data-setting="editor.theme">

				<?php
				$files = glob(COMPONENTS . "/editor/ace-editor/theme-*.js");
				foreach ($files as $file) {
					$name = pathinfo($file, PATHINFO_FILENAME);
					$value = str_replace("theme-", "", str_replace(".js", "", $name));
					$name = ucwords(str_replace("_", " ", $value));

					$selected = $name === "Atheos" ? "selected " : "";
					echo("<option $selected value=\"ace/theme/$value\">$name</option>" . PHP_EOL);
						// echo("<input type=\"radio\" name=\"theme\" value=\"$value\" checked=\"checked\" id=\"theme_$value\"><label for=\"theme_$value\">$name</label>");
				}
				?>
			</select>
			<!--</dropdown>-->
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("fontSize"); ?></td>
		<td>
			<select class="setting" data-setting="editor.fontSize">
				<option value="10px"><?php echo i18n("pixel", 10); ?></option>
				<option value="11px"><?php echo i18n("pixel", 11); ?></option>
				<option value="12px"><?php echo i18n("pixel", 12); ?></option>
				<option value="13px" selected><?php echo i18n("pixel_default", 13); ?></option>
				<option value="14px"><?php echo i18n("pixel", 14); ?></option>
				<option value="15px"><?php echo i18n("pixel", 15); ?></option>
				<option value="16px"><?php echo i18n("pixel", 16); ?></option>
				<option value="17px"><?php echo i18n("pixel", 17); ?></option>
				<option value="18px"><?php echo i18n("pixel", 18); ?></option>
			</select>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("enableLigatures"); ?></td>
		<td>
			<toggle>
				<input id="editor_ligatures_true" data-setting="editor.ligatures" value="true" name="editor.ligatures" type="radio" checked />
				<label for="editor_ligatures_true"><?php echo i18n("enabled") ?></label>
				<input id="editor_ligatures_false" data-setting="editor.ligatures" value="false" name="editor.ligatures" type="radio" />
				<label for="editor_ligatures_false"><?php echo i18n("disabled"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("highlightActiveLine"); ?></td>
		<td>
			<toggle>
				<input id="editor_highlightLine_true" data-setting="editor.highlightActiveLine" value="true" name="editor.highlightActiveLine" type="radio" checked />
				<label for="editor_highlightLine_true"><?php echo i18n("enabled") ?></label>
				<input id="editor_highlightLine_false" data-setting="editor.highlightActiveLine" value="false" name="editor.highlightActiveLine" type="radio" />
				<label for="editor_highlightLine_false"><?php echo i18n("disabled"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("wrap"); ?></td>
		<td>
			<toggle>
				<input id="editor_lineWrap_true" data-setting="editor.wrap" value="true" name="editor.wrap" type="radio" />
				<label for="editor_lineWrap_true"><?php echo i18n("enabled"); ?></label>
				<input id="editor_lineWrap_false" data-setting="editor.wrap" value="false" name="editor.wrap" type="radio" checked />
				<label for="editor_lineWrap_false"><?php echo i18n("disabled"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("printMarginShow"); ?></td>
		<td>
			<toggle>
				<input id="editor_printMargin_true" data-setting="editor.showPrintMargin" value="true" name="editor.showPrintMargin" type="radio" />
				<label for="editor_printMargin_true"><?php echo i18n("enabled"); ?></label>
				<input id="editor_printMargin_false" data-setting="editor.showPrintMargin" value="false" name="editor.showPrintMargin" type="radio" checked />
				<label for="editor_printMargin_false"><?php echo i18n("disabled"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("printMarginColumn"); ?></td>
		<td>
			<select class="setting" data-setting="editor.printMarginColumn">
				<option value="80" selected>80</option>
				<option value="85">85</option>
				<option value="90">90</option>
				<option value="95">95</option>
				<option value="100">100</option>
				<option value="105">105</option>
				<option value="110">110</option>
				<option value="115">115</option>
				<option value="120">120</option>
			</select>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("overscroll"); ?></td>
		<td>
			<select class="setting" data-setting="editor.scrollPastEnd">
				<option value="0">None</option>
				<option value="0.5" selected>Half</option>
				<option value="1">Full</option>
			</select>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("indentGuides"); ?></td>
		<td>
			<toggle>
				<input id="editor_indentGuides_true" data-setting="editor.displayIndentGuides" value="true" name="editor.displayIndentGuides" type="radio" checked />
				<label for="editor_indentGuides_true"><?php echo i18n("enabled"); ?></label>
				<input id="editor_indentGuides_false" data-setting="editor.displayIndentGuides" value="false" name="editor.displayIndentGuides" type="radio" />
				<label for="editor_indentGuides_false"><?php echo i18n("disabled"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("showInvisibles"); ?></td>
		<td>
			<toggle>
				<input id="editor_showInvisibles_true" data-setting="editor.showInvisibles" value="true" name="editor.showInvisibles" type="radio" />
				<label for="editor_showInvisibles_true"><?php echo i18n("enabled"); ?></label>
				<input id="editor_showInvisibles_false" data-setting="editor.showInvisibles" value="false" name="editor.showInvisibles" type="radio" checked/>
				<label for="editor_showInvisibles_false"><?php echo i18n("disabled"); ?></label>
			</toggle>
		</td>
	</tr>	
	<tr>
		<td><?php echo i18n("foldWidgets"); ?></td>
		<td>
			<toggle>
				<input id="editor_showFoldWidgets_true" data-setting="editor.showFoldWidgets" value="true" name="editor.showFoldWidgets" type="radio" />
				<label for="editor_showFoldWidgets_true"><?php echo i18n("enabled"); ?></label>
				<input id="editor_showFoldWidgets_false" data-setting="editor.showFoldWidgets" value="false" name="editor.showFoldWidgets" type="radio" checked />
				<label for="editor_showFoldWidgets_false"><?php echo i18n("disabled"); ?></label>
			</toggle>
		</td>
	</tr>
</table>