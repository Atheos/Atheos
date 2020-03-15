//src https://webbjocke.com/javascript-check-data-types/

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.types = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function(window) {

	'use strict';

	const types = {
		isString: function(value) {
			return typeof value === 'string' || value instanceof String;
		},
		isNumber: function(value) {
			return typeof value === 'number' && isFinite(value);
		},
		isArray: function(value) {
			return value && typeof value === 'object' && value.constructor === Array;
		},
		isFunction: function(value) {
			return typeof value === 'function';
		},
		isObject: function(value) {
			return value && typeof value === 'object' && value.constructor === Object;
		},
		isNull: function(value) {
			return value === null;
		},
		isBoolean: function(value) {
			return typeof value === 'boolean';
		},
		isRegExp: function(value) {
			return value && typeof value === 'object' && value.constructor === RegExp;
		},
		isError: function(value) {
			return value instanceof Error && typeof value.message !== 'undefined';
		},
		isDate: function(value) {
			return value instanceof Date;
		},
		isSymbol: function(value) {
			return typeof value === 'symbol';
		}
	};
	// Return public APIs
	return types;

});