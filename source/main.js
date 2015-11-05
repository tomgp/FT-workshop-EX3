'use strict';
var d3 = require('d3');
var debounce = require('./debounce.js');

var dataURL = 'data/bonds.csv';

d3.csv(dataURL, gotData);

function gotData(data){
	var timeFormat = d3.time.format('%Y-%m-%d');
	d3.select('.chart-container').datum(data.map(function(d){
		return {
			date: timeFormat.parse( d['date'] ),
			value: d['US 10yr bond']
		}
	}));

	d3.select(window)
		.on( 'resize', debounce(draw, 200) );

	draw();
}

function draw(){
	var figure = d3.select('.chart-container');

	var data = figure.datum();
	var width = 500, height = 500;
	var margin = { top:20, left:20, bottom:20, right:20 };

	var dateScale = d3.time.scale()
		.domain( d3.extent(data, function(d){ return d.date }) )
		.range([0, width-(margin.left+margin.right)]);

	var valueScale = d3.scale.linear()
		.domain( d3.extent(data, function(d){ return d.value }) )
		.range([0, height-(margin.top+margin.bottom)]);

	var line = d3.svg.line()
		.x(function(d) { return dateScale( d.date ); })
		.y(function(d) { return valueScale( d.value ); });

	var plot = figure.append('svg')
			.attr({
				width:width,
				height:height
			})
		.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
		.append('path')
			.attr({
				'd': line,
				'fill': 'none',
				'stroke': '#000',
				'stroke-width': 1,
				'stroke-opacity': 0.5
			});


}