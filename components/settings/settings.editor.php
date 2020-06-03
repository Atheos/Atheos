<?php require_once('../../common.php'); ?>

<label><i class="fas fa-home"></i><?php i18n("Editor Settings"); ?></label>

<table>
	<tr>
		<td width="50%"><?php i18n("Theme"); ?></td>
		<td>
			<select class="setting" data-setting="editor.theme">
				<?php
				$files = glob(COMPONENTS . "/editor/ace-editor/theme-*.js");
				foreach ($files as $file) {
					$name = pathinfo($file, PATHINFO_FILENAME);
					// if( strpos( strtolower( $name ), strtolower( "theme-" ) ) !== false ) {
					$value = str_replace("theme-", "", str_replace(".js", "", $name));
					$name = ucwords(str_replace("_", " ", $value));
					if ($name === "Atheos") {
						echo('<option selected value="' . $value . '">' . $name .'</option>');
					} else {

						echo('<option value="' . $value . '">' . $name .'</option>');
					}
				}
				?>
			</select>
		</td>
	</tr>
	<tr>
		<td><?php i18n("Font Size"); ?></td>
		<td>
			<select class="setting" data-setting="editor.fontSize">
				<option value="10px">10px</option>
				<option value="11px">11px</option>
				<option value="12px">12px</option>
				<option value="13px" selected>13px</option>
				<option value="14px">14px</option>
				<option value="15px">15px</option>
				<option value="16px">16px</option>
				<option value="17px">17px</option>
				<option value="18px">18px</option>
			</select>
		</td>
	</tr>
	<tr>
		<td><?php i18n("Highlight Active Line"); ?></td>
		<td>
			<!--<span class="dropdown">-->
			<!--	<input type="radio" data-setting="editor.highlightLine" value="true" id="sort-best" checked="checked"><label for="sort-best"><?php i18n("Yes"); ?></label>-->
			<!--	<input type="radio" data-setting="editor.highlightLine" value="false" id="sort-low"><label for="sort-low"><?php i18n("No"); ?></label>-->
			<!--</span>-->
			<toggle>
				<input id="editor_highlightLine_true" data-setting="editor.highlightLine" value="true" name="editor.highlightLine" type="radio" checked />
				<label for="editor_highlightLine_true"><?php i18n("Yes"); ?></label>
				<input id="editor_highlightLine_false" data-setting="editor.highlightLine" value="false" name="editor.highlightLine" type="radio" />
				<label for="editor_highlightLine_false"><?php i18n("No"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php i18n("Indent Guides"); ?></td>
		<td>
			<toggle>
				<input id="editor_indentGuides_true" data-setting="editor.indentGuides" value="true" name="editor.indentGuides" type="radio" checked />
				<label for="editor_indentGuides_true"><?php i18n("On"); ?></label>
				<input id="editor_indentGuides_false" data-setting="editor.indentGuides" value="false" name="editor.indentGuides" type="radio" />
				<label for="editor_indentGuides_false"><?php i18n("Off"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php i18n("Print Margin"); ?></td>
		<td>
			<toggle>
				<input id="editor_printMargin_true" data-setting="editor.printMargin" value="true" name="editor.printMargin" type="radio" />
				<label for="editor_printMargin_true"><?php i18n("Show"); ?></label>
				<input id="editor_printMargin_false" data-setting="editor.printMargin" value="false" name="editor.printMargin" type="radio" checked />
				<label for="editor_printMargin_false"><?php i18n("Hide"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php i18n("Print Margin Column"); ?></td>
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
		<td><?php i18n("Wrap Lines"); ?></td>
		<td>
			<toggle>
				<input id="editor_wrapMode_false" data-setting="editor.wrapMode" value="false" name="editor.wrapMode" type="radio" checked />
				<label for="editor_wrapMode_false"><?php i18n("No Wrap"); ?></label>
				<input id="editor_wrapMode_true" data-setting="editor.wrapMode" value="true" name="editor.wrapMode" type="radio" />
				<label for="editor_wrapMode_true"><?php i18n("Wrap Lines"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php i18n("Tab Size"); ?></td>
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
	<tr>
		<td><?php i18n("Soft Tabs"); ?></td>
		<td>
			<toggle>
				<input id="editor_softTabs_false" data-setting="editor.softTabs" value="false" name="editor.softTabs" type="radio" checked />
				<label for="editor_softTabs_false"><?php i18n("No"); ?></label>
				<input id="editor_softTabs_true" data-setting="editor.softTabs" value="true" name="editor.softTabs" type="radio" />
				<label for="editor_softTabs_true"><?php i18n("Yes"); ?></label>
			</toggle>
		</td>
	</tr>
</table>