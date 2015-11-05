'use strict';
var d3 = require('d3');
var debounce = require('./debounce.js');

var dataURL = 'data/bonds.csv';

d3.csv(dataURL, gotData);

function gotData(data){
	d3.select('chart-section').datum(data);
	d3.select(window)
		.on( 'resize', debounce(draw, 125) );

	draw();
}

function draw(){
	console.log('drawing');
}