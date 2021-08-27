//////////////////////////////////////////////////////////////////////////////80
// Synthetic: Simple pulsing hexagonal background for websites
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Copyright 2011 ZackTheHuman
// Source: https://gist.github.com/zackthehuman/1867663
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	let rndColor = [],
		colors = ["#0F0F0F", "#090909", "#0B0B0B", "#0D0D0D"],
		seed = 5309,
		canvas;

	function sRnd(max) {
		//Source: http://indiegamr.com/generate-repeatable-random-numbers-in-js/
		seed = (seed * 9301 + 49297) % 233280;
		//Uses a faster method of flooring the decimal to an integer
		return (seed / 233280 * max) << 0;
	}

	function drawSynthetic() {
		let hex = {
			angle: 0.523, // 30 degrees in radians
			sideLength: 20
		};

		hex.height = Math.sin(hex.angle) * hex.sideLength;
		hex.radius = Math.cos(hex.angle) * hex.sideLength;
		hex.rHeight = (hex.sideLength + 2 * hex.height);
		hex.rWidth = (2 * hex.radius);

		//document.width & document.height are obsolete
		canvas.width = (document.body.clientWidth > 2560 ? document.body.clientWidth : 2560) + (hex.rWidth * 2);
		canvas.height = (document.body.clientHeight > 1440 ? document.body.clientHeight : 1440) + (hex.rHeight * 2);

		let bWidth = canvas.width / hex.height,
			bHeight = canvas.height / hex.height;

		if (canvas.getContext) {
			let ctx = canvas.getContext('2d');
			ctx.lineWidth = 1;
			ctx.strokeStle = 'rgba(0,0,0)';
			drawBoard(ctx, bWidth, bHeight, hex);
		}
	}

	function drawBoard(ctx, width, height, hex) {
		let x,
			y,
			i = 0;

		for (x = 0; x < width; ++x) {
			for (y = 0; y < height; ++y) {
				ctx.fillStyle = rndColor[(++i) % rndColor.length];
				draw(
					ctx,
					(x * 1.02) * hex.rWidth + ((y % 2) * hex.radius),
					(y * 1.02) * (hex.sideLength + hex.height),
					hex
				);
			}
		}
	}

	function draw(ctx, x, y, hex) {
		ctx.beginPath();
		ctx.moveTo(x + hex.radius, y);
		ctx.lineTo(x + hex.rWidth, y + hex.height);
		ctx.lineTo(x + hex.rWidth, y + hex.height + hex.sideLength);
		ctx.lineTo(x + hex.radius, y + hex.rHeight);
		ctx.lineTo(x, y + hex.sideLength + hex.height);
		ctx.lineTo(x, y + hex.height);
		ctx.closePath();
		ctx.globalAlpha = 1;
		ctx.fill();
		ctx.globalAlpha = 0.2;
		ctx.stroke();
	}


	window.Synthetic = {
		init: function() {
			canvas = document.getElementById('synthetic');
			if (!canvas) return;

			rndColor = localStorage.getItem('synthetic');
			if (rndColor && typeof(rndColor) !== 'string') {
				rndColor = JSON.parse(rndColor);
			} else {
				rndColor = [];
				for (let i = 0; i < 5000; ++i) {
					rndColor.push(colors[sRnd(4)]);
				}
				localStorage.setItem('synthetic', JSON.stringify(rndColor));
			}
			drawSynthetic();
		}
	};
})();