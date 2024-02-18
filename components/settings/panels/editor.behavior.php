<label><i class="fas fa-diagram-project"></i><?php echo i18n("editor_behavior"); ?></label>

<table>
    <tr>
        <td><?php echo i18n("autoPairComplete"); ?></td>
        <td>
            <toggle>
                <input id="editor_pairComplete_true" data-setting="editor.enableAutoClose" value="true" name="editor.enableAutoClose" type="radio" checked>
                <label for="editor_pairComplete_true"><?php echo i18n("enabled"); ?></label>
                <input id="editor_pairComplete_false" data-setting="editor.enableAutoClose" value="false" name="editor.enableAutoClose" type="radio">
                <label for="editor_pairComplete_false"><?php echo i18n("disabled"); ?></label>
            </toggle>
        </td>
    </tr>
    <tr>
        <td><?php echo i18n("autocomplete_basic"); ?></td>
        <td>
            <toggle>
                <input id="editor_basic_autocomplete_true" data-setting="editor.enableBasicAutocomplete" value="true" name="editor.enableBasicAutocomplete" type="radio" checked>
                <label for="editor_basic_autocomplete_true"><?php echo i18n("enabled"); ?></label>
                <input id="editor_basic_autocomplete_false" data-setting="editor.enableBasicAutocomplete" value="false" name="editor.enableBasicAutocomplete" type="radio">
                <label for="editor_basic_autocomplete_false"><?php echo i18n("disabled"); ?></label>
            </toggle>
        </td>
    </tr>
    <tr>
        <td><?php echo i18n("autocomplete_live"); ?></td>
        <td>
            <toggle>
                <input id="editor_live_autocomplete_true" data-setting="editor.enableLiveAutocomplete" value="true" name="editor.enableLiveAutocomplete" type="radio" checked>
                <label for="editor_live_autocomplete_true"><?php echo i18n("enabled"); ?></label>
                <input id="editor_live_autocomplete_false" data-setting="editor.enableLiveAutocomplete" value="false" name="editor.enableLiveAutocomplete" type="radio">
                <label for="editor_live_autocomplete_false"><?php echo i18n("disabled"); ?></label>
            </toggle>
        </td>
    </tr>
    <tr>
        <td><?php echo i18n("snippets"); ?></td>
        <td>
            <toggle>
                <input id="editor_snippets_true" data-setting="editor.enableSnippets" value="true" name="editor.enableSnippets" type="radio" checked>
                <label for="editor_snippets_true"><?php echo i18n("enabled"); ?></label>
                <input id="editor_snippets_false" data-setting="editor.enableSnippets" value="false" name="editor.enableSnippets" type="radio">
                <label for="editor_snippets_false"><?php echo i18n("disabled"); ?></label>
            </toggle>
        </td>
    </tr>
    <tr>
        <td><?php echo i18n("tabs_soft"); ?></td>
        <td>
            <toggle>
                <input id="editor_softTabs_true" data-setting="editor.useSoftTabs" value="true" name="editor.useSoftTabs" type="radio">
                <label for="editor_softTabs_true"><?php echo i18n("enabled"); ?></label>
                <input id="editor_softTabs_false" data-setting="editor.useSoftTabs" value="false" name="editor.useSoftTabs" type="radio" checked>
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