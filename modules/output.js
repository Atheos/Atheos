//////////////////////////////////////////////////////////////////////////////80
// Toast Status Messages
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description: 
//	Toast provides the ability to give inactive/passive feedback to the user
//	utilizing a straightforward and simple call with four status types, and 
//	short detailed message. Clicking the message will close it instantly.
//////////////////////////////////////////////////////////////////////////////80
// Suggestions:
//	- Language translation isn't handled very well
//	- Allow user settings of durations per toast type
//	- Modify all existing calls to utilize simpler calls
//////////////////////////////////////////////////////////////////////////////80
// Usage:
//	- success: Show a success message with a green circle for 3 seconds
//  - warning: Show a warning message with an orange circle for 5 seconds
//	- error: Show an error message with a red circle for 10 seconds
//  - notice: Show a notice message with a blue circle for 3 seconds
//
// 	toast('success', 'Everything is going to be okay.');
// 	toast('warning', 'Something is wrong with the system.');
// 	toast('notice',  'Nevermind, it's all better now.');
// 	toast('error',   'I'm afraid, Dave, I can feel it.');
//
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	const self = {

		container: null,

		stayTimes: {
			success: 3000,
			error: 10000,
			warning: 5000,
			notice: 3000,
		},

		init: function() {
			self.container = oX('output');

			fX('result').on('click', (e) => {
				let result = e.target.closest('result');
				self.hide(result);
			});
		},

		create: function(type, text) {
			var html = `<result><pre class="${ type }"><code>${ text }</code></pre></result>`;

			let div = document.createElement('div');
			div.innerHTML = html;
			return div.firstChild;
		},

		showResult: function(type, text, stayTime) {

			// declare variables
			var result = self.create(type, text);

			self.container.append(result);

			setTimeout(function() {
				result.classList.add('active');
				// setTimeout(() => self.hide(result), stayTime);
			}, 10);
		},

		show: function(type, text, raw) {
			if (isObject(type)) {
				text = type.text || type.message;
				raw = type.raw || false;
				type = type.status;
			}

			if (isObject(text)) {
				text = text.text;
			}

			if (!(type in self.stayTimes)) return;

			text = text || 'Message undefined.';
			text = raw ? text : i18n(text);

			self.showResult(type, text, self.stayTimes[type]);

		},
		hide: function(result) {
			result.classList = '';
			result.addEventListener('transitionend', result.remove);
		}
	};

	carbon.subscribe('system.loadVital', () => self.init());
	atheos.output = self;
	window.output = atheos.output.show;

})();