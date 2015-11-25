'use strict';
var d3 = require('d3');
var debounce = require('./debounce.js');

var dataURL = 'data/bonds.csv';

d3.csv(dataURL, gotData);

function gotData(data){


	var processed = data.map(function(d){
		var timeFormat = d3.time.format('%Y-%m-%d');
		return {
			date: timeFormat.parse( d['date'] ),
			value: Number(d['US 10yr bond'])
		}
	});

	function redraw(){
		console.log(processed.length);
		draw(processed);
	}

	d3.select(window)
		.on( 'resize', debounce(redraw, 200) );

	redraw();
}

function draw(data){
	var figure = d3.select('.chart-container');
	var bounds = figure.node().getBoundingClientRect();

	var mean = d3.mean(data, function(d){
		return d.value;
	});

	var width = bounds.width, height = bounds.height;
	var margin = { top:20, left:20, bottom:20, right:20 };

	var filtered = data.filter(function(d,i){
		var targetLength = width;
		var removalFrequency = Math.floor(data.length/targetLength); //use floor to leave more than the target length, ceil to leave fewer elements
		return (i % removalFrequency == 0);
	});

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
		.data([filtered])
			.enter()
		.append('svg')
		.append('g').classed('plot',true)
		.append('path').classed('values',true);

	console.log( d3.select('path.values').datum() )
	
	figure.select('svg')
		.selectAll('line')
		.data([mean])
			.enter()
		.append('line').classed('annotation',true);

	figure.select('svg')
		.selectAll('text')
		.data([mean])
			.enter()
		.append('text').classed('label',true).text('mean');

	figure.selectAll('.annotation')
		.attr({
			x1: margin.left,
			y1: valueScale,
			x2: width-margin.right,
			y2: valueScale
		});

	figure.selectAll('.label')
		.attr({
			x:width-margin.right,
			y:valueScale,
			dy: -5,
			'text-anchor':'end'
		})

	figure.select('svg').attr({
			width: width,
			height: height
		});

	figure.select('.plot').attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')' )
	figure.select('.values')
			.attr( 'd', line );


}