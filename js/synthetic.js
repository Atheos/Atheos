//	Synthetic | Simple pulsing hexagonal background for websites
//	(c) 2020 Liam Siira (liam@siira.us)
//	Created from Hexagons.js by ZackTheHuman (https://gist.github.com/zackthehuman/1867663)


(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.synthetic = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function(window) {

	'use strict';

	const synthetic = {

		canvas: null,

		init: function(options) {

			this.canvas = document.getElementById('synthetic');
			if (!this.canvas) {
				this.canvas = this.createCanvas();
			}
			this.drawSynthetic();
		},

		createCanvas: function() {
			var container = document.createElement('canvas');
			container.id = 'synthetic';
			document.body.appendChild(container);
			return container;
		},


		drawSynthetic: function() {


			var hex = {
				angle: 0.523598776, // 30 degrees in radians
				sideLength: 20,
				boardWidth: 400,
				boardHeight: 600
			};

			hex.height = Math.sin(hex.angle) * hex.sideLength;
			hex.radius = Math.cos(hex.angle) * hex.sideLength;
			hex.rectangleHeight = hex.sideLength + 2 * hex.height;
			hex.rectangleWidth = 2 * hex.radius;

			this.canvas.width = document.body.clientWidth + (hex.rectangleWidth * 2); //document.width is obsolete
			this.canvas.height = document.body.clientHeight + (hex.rectangleHeight * 2); //document.height is obsolete

			var boardWidth = this.canvas.width / hex.height,
				boardHeight = this.canvas.height / hex.height;

			if (this.canvas.getContext) {
				var ctx = this.canvas.getContext('2d');
				ctx.lineWidth = 1.5;

				this.drawBoard(ctx, boardWidth, boardHeight, hex);
			}
		},

		drawBoard: function(ctx, width, height, hex) {
			var i,
				j,
				gradientX = 255 / width,
				gradientY = 255 / height,
				clrFill = ['#0F0F0F', '#090909', '#0B0B0B', '#0D0D0D'];

			ctx.strokeStle = 'rgba(0,0,0)';

			for (i = 0; i < width; ++i) {

				for (j = 0; j < height; ++j) {
					ctx.fillStyle = clrFill[Math.floor(Math.random() * clrFill.length)];
					this.draw(
						ctx,
						i * hex.rectangleWidth + ((j % 2) * hex.radius),
						j * (hex.sideLength + hex.height),
						hex
					);
				}

			}
		},

		draw: function(ctx, x, y, hex) {
			ctx.beginPath();
			ctx.moveTo(x + hex.radius, y);
			ctx.lineTo(x + hex.rectangleWidth, y + hex.height);
			ctx.lineTo(x + hex.rectangleWidth, y + hex.height + hex.sideLength);
			ctx.lineTo(x + hex.radius, y + hex.rectangleHeight);
			ctx.lineTo(x, y + hex.sideLength + hex.height);
			ctx.lineTo(x, y + hex.height);
			ctx.closePath();
			ctx.globalAlpha = 1;
			ctx.fill();
			ctx.globalAlpha = 0.2;
			ctx.stroke();
		}

	};

	return synthetic;

});

// document.addEventListener("DOMContentLoaded", function() {
// 	synthetic.init();
// });