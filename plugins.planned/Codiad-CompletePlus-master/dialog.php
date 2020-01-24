<?php
    require_once('../../common.php');
?>
<div class="complete_settings">
    <label><span class="icon-code big-icon"></span>Drag'n'Drop Settings</label>
    <hr>
    <table class="settings">
        <tr>
            <td>
                Autocomplete on keyup
            </td>
            <td width="10%">
                <select class="setting" data-setting="codiad.plugin.completeplus.keyup">
                    <option value="true"><?php i18n("On"); ?></option>
                    <option value="false" selected><?php i18n("Off"); ?></option>
                </select>
            </td>
        </tr>
        <tr>
            <td>
                Auto completition without further dialog if just one suggestion remains (SmartComplete)
            </td>
            <td width="10%">
                <select class="setting" data-setting="codiad.plugin.completeplus.smartComplete">
                    <option value="true" selected><?php i18n("On"); ?></option>
                    <option value="false"><?php i18n("Off"); ?></option>
                </select>
            </td>
        </tr>
        <tr>
            <th colspan="2">
                <span class="icon-info-circled bigger-icon"></span>
                SmartComplete does not work if autocomplete on keyup is enabled!
            </th>
        </tr>
    </table>
</div>