'use strict';

(function(global) {

	var core = global.codiad,
		amplify = global.amplify,
		bioflux = global.bioflux,
		events = global.events;

	//////////////////////////////////////////////////////////////////////
	// Hexagonal Overlay on Login Screen
	//////////////////////////////////////////////////////////////////////
	// Notes: 
	//
	//												- Liam Siira
	//////////////////////////////////////////////////////////////////////

	core.hexoverlay = {

		canvas: null,

		init: function(options) {
			if (!document.querySelector('#login')) {
				return;
			}
			core.hexoverlay.canvas = document.getElementById('hex_overlay');

			if (!this.canvas) {
				this.canvas = this.createCanvas();
			}

			core.hexoverlay.drawHexOverlay();
		},

		createCanvas: function() {
			var container = document.createElement('canvas');
			container.id = 'hex_overlay';
			document.body.appendChild(container);
			return container;
		},


		drawHexOverlay: function() {


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

			// ctx.strokeStyle = '#070707';
			ctx.strokeStle = 'rgba(0,0,0)';

			// ctx.filter = "opacity(1)";

			for (i = 0; i < width; ++i) {

				for (j = 0; j < height; ++j) {
					// ctx.strokeStyle = `rgba(0,0,0,${Math.random() + 0.5})`;


					ctx.fillStyle = clrFill[Math.floor(Math.random() * clrFill.length)];

					this.fillHexagon(
						ctx,
						i * hex.rectangleWidth + ((j % 2) * hex.radius),
						j * (hex.sideLength + hex.height),
						hex
					);
				}


			}
			// ctx.filter = "opacity(0.2)";
			// ctx.globalCompositeOperation = 'overlay';
			ctx.globalAlpha = 0.2;
			for (i = 0; i < width; ++i) {
				for (j = 0; j < height; ++j) {
					// ctx.strokeStyle = `rgba(0,0,0,${Math.random() + 0.5})`;

					this.drawHexagon(
						ctx,
						i * hex.rectangleWidth + ((j % 2) * hex.radius),
						j * (hex.sideLength + hex.height),
						hex
					);
				}
			}
		},
		drawHexagon: function(ctx, x, y, hex) {
			ctx.beginPath();
			ctx.moveTo(x + hex.radius, y);
			ctx.lineTo(x + hex.rectangleWidth, y + hex.height);
			ctx.lineTo(x + hex.rectangleWidth, y + hex.height + hex.sideLength);
			ctx.lineTo(x + hex.radius, y + hex.rectangleHeight);
			ctx.lineTo(x, y + hex.sideLength + hex.height);
			ctx.lineTo(x, y + hex.height);
			ctx.closePath();
			// ctx.globalCompositeOperation = 'source-over';
			// ctx.filter = "opacity(1)";
			// ctx.fill();
			// ctx.globalCompositeOperation = 'destination-over';
			// ctx.filter = "opacity(0.2)";
			ctx.stroke();
		},
		fillHexagon: function(ctx, x, y, hex) {
			ctx.beginPath();
			ctx.moveTo(x + hex.radius, y);
			ctx.lineTo(x + hex.rectangleWidth, y + hex.height);
			ctx.lineTo(x + hex.rectangleWidth, y + hex.height + hex.sideLength);
			ctx.lineTo(x + hex.radius, y + hex.rectangleHeight);
			ctx.lineTo(x, y + hex.sideLength + hex.height);
			ctx.lineTo(x, y + hex.height);
			ctx.closePath();
			// ctx.globalCompositeOperation = 'source-over';
			// ctx.filter = "opacity(1)";
			ctx.fill();
			// ctx.globalCompositeOperation = 'destination-over';
			// ctx.filter = "opacity(0.2)";
			// ctx.stroke();
		}

	};

})(this);