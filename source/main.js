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
	var bounds = figure.node().getBoundingClientRect();

	var data = figure.datum();
	var width = bounds.width, height = bounds.height;
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

	figure.selectAll('svg')
		.data([data])
			.enter()
		.append('svg')
		.append('g').classed('plot',true)
		.append('path').classed('values',true);
			
	figure.select('svg').attr({
			width:width,
			height:height
		})

	figure.select('.plot').attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')' )
	figure.select('.values')
			.attr( 'd', line );


}