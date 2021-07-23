<?php

$data = Common::getKeyStore("analytics")->select("*");
$enabled = $data["enabled"] === true ? " checked" : "";
$disabled = $data["enabled"] ? "" : " checked";


?>
<label><i class="fas fa-chart-bar"></i><?php echo i18n("analytics_enabled"); ?></label>
<table class="analytics">
	<tr>
		<td colspan="2">
			<?php echo i18n("analytics_send"); ?>
		</td>
		<td colspan="2">
			<toggle>
				<input id="analytics_enabled_true" data-setting="analytics.enabled" value="true" name="analytics.enabled" type="radio" <?php echo $enabled ?> />
				<label for="analytics_enabled_true"><?php echo i18n("enabled"); ?></label>
				<input id="analytics_disabled_false" data-setting="analytics.enabled" value="false" name="analytics.enabled" type="radio" <?php echo $disabled ?> />
				<label for="analytics_disabled_false"><?php echo i18n("disabled"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td>
			<?php echo i18n("uuid"); ?>
		</td>
		<td>
			<?php echo($data["uuid"]); ?>
		</td>
		<td>
			<?php echo i18n("version"); ?>
		</td>
		<td>
			<?php echo($data["version"]); ?>
		</td>
	</tr>
	<tr>
		<td>
			<?php echo i18n("first_heard"); ?>
		</td>
		<td>
			<?php echo($data["first_heard"]); ?>
		</td>
		<td>
			<?php echo i18n("last_heard"); ?>
		</td>
		<td>
			<?php echo($data["last_heard"]); ?>
		</td>
	</tr>
	<tr>
		<td>
			<?php echo i18n("server_os"); ?>
		</td>
		<td>
			<?php echo($data["server_os"] . "/PHP " . $data["php_version"]); ?>
		</td>
		<td>
			<?php echo i18n("client_os"); ?>
		</td>
		<td>
			<?php echo(json_encode($data["client_os"])); ?>
		</td>
	</tr>
	<tr>
		<td>
			<?php echo i18n("timezone"); ?>
		</td>
		<td>
			<?php echo($data["timezone"]); ?>
		</td>
		<td>
			<?php echo i18n("language"); ?>
		</td>
		<td>
			<?php echo($data["language"]); ?>
		</td>
	</tr>
	<tr>
		<td>
			<?php echo i18n("plugins"); ?>
		</td>
		<td colspan="3">
			<?php echo(json_encode($data["plugins"])); ?>
		</td>
	</tr>

</table>
<hint><?php echo i18n("analytics_policy"); ?></hint>