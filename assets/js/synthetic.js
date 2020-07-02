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
		root.Synthetic = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function(window) {

	let rndColor = [],
		colors = ["#0F0F0F", "#090909", "#0B0B0B", "#0D0D0D"],
		seed = 5309,
		canvas;

	function sRnd(max) {
		//Source: http://indiegamr.com/generate-repeatable-random-numbers-in-js/
		seed = (seed * 9301 + 49297) % 233280;
		var rnd = seed / 233280;

		//Uses a faster method of flooring the decimal to an integer
		return (rnd * max) << 0;
	}

	function drawSynthetic() {
		var hex = {
			angle: 0.523, // 30 degrees in radians
			sideLength: 20,
			boardWidth: 400,
			boardHeight: 600
		};

		hex.height = Math.sin(hex.angle) * hex.sideLength;
		hex.radius = Math.cos(hex.angle) * hex.sideLength;
		hex.rectangleHeight = (hex.sideLength + 2 * hex.height);
		hex.rectangleWidth = (2 * hex.radius);

		//document.width & document.height are obsolete
		canvas.width = document.body.clientWidth > 2560 ? document.body.clientWidth : 2560;
		canvas.height = document.body.clientHeight > 1440 ? document.body.clientHeight : 1440;

		canvas.width += (hex.rectangleWidth * 2); //document.width is obsolete
		canvas.height += (hex.rectangleHeight * 2); //document.height is obsolete

		var boardWidth = canvas.width / hex.height,
			boardHeight = canvas.height / hex.height;

		if (canvas.getContext) {
			var ctx = canvas.getContext('2d');
			ctx.lineWidth = 1;
			ctx.strokeStle = 'rgba(0,0,0)';
			drawBoard(ctx, boardWidth, boardHeight, hex);
		}
	}

	function drawBoard(ctx, width, height, hex) {
		var x,
			y,
			i = 0,
			gradientX = 255 / width,
			gradientY = 255 / height;


		for (x = 0; x < width; ++x) {
			for (y = 0; y < height; ++y) {
				ctx.fillStyle = rndColor[(++i) % rndColor.length];
				draw(
					ctx,
					(x * 1.02) * hex.rectangleWidth + ((y % 2) * hex.radius),
					(y * 1.02) * (hex.sideLength + hex.height),
					hex
				);
			}
		}
	}

	function draw(ctx, x, y, hex) {
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


	const Synthetic = {

		init: function() {
			canvas = document.getElementById('synthetic');
			if (!canvas) return;

			rndColor = localStorage.getItem('synthetic');
			if (!rndColor || typeof(rndColor) !== 'string') {
				rndColor = [];
				for (var i = 0; i < 5000; ++i) {
					rndColor.push(colors[sRnd(4)]);
				}
				localStorage.setItem('synthetic', JSON.stringify(rndColor));
			} else {
				rndColor = JSON.parse(rndColor);
			}
			drawSynthetic();
		}
	};
	return Synthetic;
});