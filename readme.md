##What it is
D3 workshop example 3

###Responsive stuff

The basic pattern for making a responsive chart:
 1. find out how much space you've got available, 
 2. render the chart in that space,
 3. listen for changes to the available space an when the space changes redner the chart

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

Why not? drawing and redrawing things to the screen is one of the most expensivethings you can ask your browser to do. You may get away with redrawing one or two simple charts everytime a window resize event is dispatched but you might be better off responding to only a small fraction of those events if you have 10's of charts or if your charts are reasonably complex.

[Here's a good explanation of the two broad strategies which are avaialble to us](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)

>_Debounce_ and _throttle_ are two approaches that we can use to increase the control of our function executions, especially useful in event handlers.
Both techniques answer the same question "How often a certain function can be called over time?" in different ways:


>**Debounce**: Think of it as "grouping multiple events in one". Imagine that you go home, enter in the elevator, doors are closing... and suddenly your neighbor appears in the hall and tries to jump on the elevator. Be polite! and open the doors for him: you are debouncing the elevator departure. Consider that the same situation can happen again with a third person, and so on... probably delaying the departure several minutes.


>**Throttle**: Think of it as a valve, it regulates the flow of the executions. We can determine the maximum number of times a function can be called in certain time. So in the elevator analogy.. you are polite enough to let people in for 10 secs, but once that delay passes, you must go!

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

i.e. call the function draw a maximum of once every 200ms

draw a chart (branch: draw-a-chart)

prevent multiple charts appearing (branch: prevent-multiple-charts-appearing)

resize the svg (branch: change-size)

separate node creation and attribute setting (branch:separate-node-creation)