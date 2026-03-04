importScripts('../../vendor/differential/diff_match_patch.min.js');


function encodeHighUnicode(str) {
    const pattern  = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    const callback = (match) => {
        const codepoint = match.codePointAt(0);
        const paddedHex = codepoint.toString(16).padStart(6, '0');
        return '\uE000' + paddedHex + '\uE001';
    };

    return str.replace(pattern, callback);
}

function decodeHighUnicode(str) {
    const pattern  = /\uE000([0-9a-f]{6})\uE001/g;
    const callback = (match, hex) => {
        const codepoint = parseInt(hex, 16);
        return String.fromCodePoint(codepoint);
    };

    return str.replace(pattern, callback);
}


var tasks = {
	diff: function(config) {
		var dmp = new diff_match_patch();
		
		// Encode all high unicode characters before patching.
		// This fixes differences in encoding between PHP and JS.
        var original = encodeHighUnicode(config.original);
        var changed  = encodeHighUnicode(config.changed);
		// var patches = dmp.patch_make(config.original, config.changed);
		var patches = dmp.patch_make(original, changed);
		var patchTxt = dmp.patch_toText(patches);

		return {
			success: true,
			result: patchTxt
		};
	}
};

self.addEventListener('message', function(e) {
	var config = e.data;
	var outcome = tasks[config.taskType](config);
	self.postMessage(outcome);
}, false);