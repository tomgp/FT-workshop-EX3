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

	//thin out the data
	//if he number of points is greater than the number of pixels in the range

	var width = bounds.width, height = bounds.height;
	var margin = { top:20, left:20, bottom:20, right:20 };
	var spacing = Math.ceil( figure.datum().length/width );
	
	var data = figure.datum();

	var newData = [];
	for(var i=0;i<figure.datum().length;i += spacing){
		newData.push(figure.datum()[i]);
	}

	var mean = d3.mean(data, function(d){
		return d.value;
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
		.data([0])
			.enter()
		.append('svg')
		.append('g').classed('plot',true)
		.append('path').classed('values',true);
	
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
		});

	figure.select('svg').attr({
			width: width,
			height: height
		});

	figure.select('.plot').attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')' )

	figure.select('.values').data([newData])
			.attr( 'd', line );

}