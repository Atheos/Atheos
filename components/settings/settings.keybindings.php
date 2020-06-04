<?php require_once('../../common.php'); ?>

<label><i class="fas fa-keyboard"></i><?php i18n("Keybindings"); ?></label>
<table class="keybindings">
	<tr>
		<td>
			<?php i18n("Close Modal"); ?>
		</td>
		<td>
			<i class="cmd">Esc</i>
		</td>

		<td>
			<?php i18n("Merge All Editor Views"); ?>
		</td>
		<td>
			<i class="cmd">Ctrl</i><i class="fas fa-plus"></i><i class="key">M</i>
		</td>
	</tr>

	<tr>
		<td>
			<?php i18n("Split Horizontally"); ?>
		</td>
		<td>
			<i class="cmd">Ctrl</i><i class="fas fa-plus"></i><i class="key">;</i>
		</td>

		<td>
			<?php i18n("Split Vertically"); ?>
		</td>
		<td>
			<i class="cmd">Alt</i><i class="fas fa-plus"></i><i class="key">;</i>
		</td>
	</tr>

	<tr>
		<td>
			<?php i18n("Save Active File"); ?>
		</td>
		<td>
			<i class="cmd">Ctrl</i><i class="fas fa-plus"></i><i class="key">S</i>
		</td>

		<td>
			<?php i18n("Close Active File"); ?>
		</td>
		<td>
			<i class="cmd">Ctrl</i><i class="fas fa-plus"></i><i class="key">W</i>
		</td>
	</tr>

	<tr>
		<td>
			<?php i18n("Find"); ?>
		</td>
		<td>
			<i class="cmd">Ctrl</i><i class="fas fa-plus"></i><i class="key">F</i>
		</td>

		<td>
			<?php i18n("Open Scout"); ?>
		</td>
		<td>
			<i class="cmd">Ctrl</i><i class="fas fa-plus"></i><i class="key">E</i>
		</td>
	</tr>

	<tr>
		<td>
			<?php i18n("Replace"); ?>
		</td>
		<td>
			<i class="cmd">Ctrl</i><i class="fas fa-plus"></i><i class="key">H</i>
		</td>

		<td>
			<?php i18n("GoTo Line"); ?>
		</td>
		<td>
			<i class="cmd">Ctrl</i><i class="fas fa-plus"></i><i class="key">L</i>
		</td>
	</tr>

	<tr>
		<td>
			<?php i18n("Move Line Up"); ?>
		</td>
		<td>
			<i class="cmd">Alt</i><i class="fas fa-plus"></i><i class="fas fa-arrow-alt-circle-up"></i>
		</td>

		<td>
			<?php i18n("Move Line Down"); ?>
		</td>
		<td>
			<i class="cmd">Alt</i><i class="fas fa-plus"></i><i class="fas fa-arrow-alt-circle-down"></i>
		</td>
	</tr>
	
	<tr>
		<td>
			<?php i18n("Cycle to Previous File"); ?>
		</td>
		<td>
			<i class="cmd">Ctrl</i><i class="fas fa-plus"></i><i class="fas fa-arrow-alt-circle-up"></i>
		</td>

		<td>
			<?php i18n("Cycle to Next File"); ?>
		</td>
		<td>
			<i class="cmd">Ctrl</i><i class="fas fa-plus"></i><i class="fas fa-arrow-alt-circle-down"></i>
		</td>
	</tr>	
</table>