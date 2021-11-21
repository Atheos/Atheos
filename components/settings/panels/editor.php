<label><i class="fas fa-home"></i><?php echo i18n("settings_editor"); ?></label>

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

					if ($name === "Atheos") {
						echo('<option selected value="' . $value . '">' . $name .'</option>' . PHP_EOL);
						// echo("<input type=\"radio\" name=\"theme\" value=\"$value\" checked=\"checked\" id=\"theme_$value\"><label for=\"theme_$value\">$name</label>");

					} else {
						echo('<option value="' . $value . '">' . $name .'</option>' . PHP_EOL);
						// echo("<input type=\"radio\" name=\"theme\" value=\"$value\" id=\"theme_$value\"><label for=\"theme_$value\">$name</label>");
					}
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
	<tr>
		<td><?php echo i18n("wrap"); ?></td>
		<td>
			<toggle>
				<input id="editor_wrapMode_true" data-setting="editor.useWrapMode" value="true" name="editor.useWrapMode" type="radio" />
				<label for="editor_wrapMode_true"><?php echo i18n("enabled"); ?></label>
				<input id="editor_wrapMode_false" data-setting="editor.useWrapMode" value="false" name="editor.useWrapMode" type="radio" checked />
				<label for="editor_wrapMode_false"><?php echo i18n("disabled"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("tabs_soft"); ?></td>
		<td>
			<toggle>
				<input id="editor_softTabs_true" data-setting="editor.useSoftTabs" value="true" name="editor.useSoftTabs" type="radio" />
				<label for="editor_softTabs_true"><?php echo i18n("enabled"); ?></label>
				<input id="editor_softTabs_false" data-setting="editor.useSoftTabs" value="false" name="editor.useSoftTabs" type="radio" checked />
				<label for="editor_softTabs_false"><?php echo i18n("disabled"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("tabs_size"); ?></td>
		<td>
			<select class="setting" data-setting="editor.tabSize">
				<option value="2">2</option>
				<option value="3">3</option>
				<option value="4" selected>4</option>
				<option value="5">5</option>
				<option value="6">6</option>
				<option value="7">7</option>
				<option value="8">8</option>
			</select>
		</td>
	</tr>
</table>