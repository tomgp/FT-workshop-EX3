##What it is
D3 workshop example 3

###Responsive stuff

The basic pattern for making a responsive chart:
 1. find out how much space you've got available, 
 2. render the chart in that space,
 3. listen for changes to the available space an when the space changes render the chart

####Find out how much space you've got
You can measure any element on the screen its `getBoundingClientRect` function like this:

```
document.querySelector('#my-element').getBoundingClientRect();
```

or if you're using d3 like this:


``` 
d3.select('#my-element').node().getBoundingClientRect();
```

the result is the properties of the eleemnt as currently rendered

```
[ClientRect]{
	bottom: 630.5,
	height: 570.5,
	left: 77.4375,
	right: 1161.5625,
	top: 60,
	width: 1084.125
}
```

NB: Your element may not have the dimensions you'd expect if it's not got any content in yet.

Most of the time we'll be interested in the available width:

```
var width = document.querySelector('#my-element').getBoundingClientRect().width;
```

####Listening for page size changes
Of course the available area may change and we want to respond to that. The simple thing to do ...

```
function draw{
	//do some drawing
}

window.onresize = draw;
```

Why not? 

Drawing and redrawing things to the screen is one of the most expensive things you can ask your browser to do. You may get away with redrawing one or two simple charts every time a window resize event is dispatched but you're probably better off responding to only a small fraction of those events espescially if you have 10's of charts or if your charts are reasonably complex.

[Here's a good explanation of the two broad strategies which are avaialble to us](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)

>__Debounce__ and __throttle__ are two approaches that we can use to increase the control of our function executions, especially useful in event handlers.
Both techniques answer the same question "How often a certain function can be called over time?" in different ways:


>__Debounce__: Think of it as "grouping multiple events in one". Imagine that you go home, enter in the elevator, doors are closing... and suddenly your neighbor appears in the hall and tries to jump on the elevator. Be polite! and open the doors for him: you are debouncing the elevator departure. Consider that the same situation can happen again with a third person, and so on... probably delaying the departure several minutes.


>__Throttle__: Think of it as a valve, it regulates the flow of the executions. We can determine the maximum number of times a function can be called in certain time. So in the elevator analogy.. you are polite enough to let people in for 10 secs, but once that delay passes, you must go!

For regulating page resize events debounce is usually the prefered option: wait till the user has finished messing around before redrawing everything. 

Many libraries provide mechanisms to debounce functions (e.g. [lodash](https://lodash.com/docs#debounce)) but to implement your own requires so few lines of code it's worth taking a quick look... 

```
function debounce (fn, timeout) {
  if (!timeOut) timeOut = 250; //default to a 1/4 second delay
  var timeoutID = -1;
  return function() {
    if (timeoutID > -1) {
      window.clearTimeout(timeoutID);
    }
    timeoutID = window.setTimeout(fn, timeout);
  }
}
```

To use this for calling your drawing function you'd do something like
this in D3

```
d3.select(window)
	.on( 'resize', debounce(draw, 200) );
```

i.e. call the function ```draw``` a maximum of once every 200ms

###resizing

D3s <a href="http://bost.ocks.org/mike/join/">enter/update/exit</a> pattern which you're probably familiar with solves a lot of issues with redrawing charts; managing the creation of elements and making sure you don't create duplicates. One thing to note though is because you need to update the size of your SVG dynamically you amy want to include the creation and maintainence of that 'svg' element in  the enter/update/exit loop to avoid creating multiple SVGs e.g.

```
function draw(){
	var bounds = document.querySelector('#chart-container').getBoundingClientRect();

	d3.select('#chart-container')
		.selectAll('svg')
			.data([0])
		.enter()
			.append('svg');

	d3.selectAll('#chart-container svg')
		.attr({
			width:bounds.width,
			height:bounds.height //alternatively you may want to make this a funcion of the width e.g. bounds.width/2 or something 
		});
}

```

Another thing that's worth noting here is that we separate element creation and attribute setting, doing the latter entirely in the _update_ part of the sequence. This is so that we can be sure that we only create elements when needed but can update the attributes on each resize (i.e. each time draw is called). This is all just good practice I think but when dealing with responsive charts it becomes essential rather than just nice to have.

###thinning data

It's sometimes necessary to re-process data on each resize. For example a path constructed from too many points can look a bit funny:

![dense data](http://localhost:8000/dense.png) 

If we remove most of the points so there is fewer than one point per pixel this looks better: 

![thin data](http://localhost:8000/thinned.png)

Assuming there's an even spacing of the original points you can thin the distribution down to around target number of points (i.e. the width available pretty simply...

```
var targetLength = bounds.width;
var removalFrequency = Math.ceil(data.length/targetLength); 
//use floor to leave more than the target length, ceil to leave fewer elements

var filtered = data.filter(function(d,i){
	return (i % removalFrequency == 0);
});
```

###do something different based on size

Often you may want to draw somethign completely different at a different scale. When you get too small to show a bar chart you may want to just show just a big number or something.

This is where abstracting stuff into ```call```-able functions comes into its own ( as seen in [ex2](https://github.com/tomgp/FT-workshop-EX3) ). So if you have different drawing functions that take the same data structure you can be like:

```
d3.selectAll('.visualisation')
	.call(function( parent ){
		if(width<500) parent.call( smallVis );
		parent.call( normalVis );
	});
```
