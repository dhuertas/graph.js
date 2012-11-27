/*
 * @author dhuertas
 * @email huertas.dani@gmail.com
 */
var Graph = (function() {

	var GRAPH = {
		canvasWidth 		: 600,
		canvasHeight 		: 600/Math.sqrt(2),
		appendTo			: "",
		newWindow			: false,
		canvasId 			: "graph",
		fontFamily			: "sans-serif",
		fontWeight			: "normal",
		fontSize			: "10px",
		
		colorList			: ["#00F","#0F0","#F00","#0FF","#F0F","#FF0"],
		colorIndex			: 0,
		
		drawYAxis			: 3, // 0: none, 1: left, 2: right, 3: both
		drawYAxisNumbers	: true,
		drawXAxis			: 3, // 0: none, 1: bottom, 2: top, 3: both
		drawXAxisNumbers	: true,
		drawGrid			: true,
		
		lineWidth			: 1,
		pointStroke			: true,
		pointFill			: false,
		pointRadius			: 3,
		pointColorIndex		: 0,
		
		yAxisLeftMargin 	: 0.101010101, // 10.1 % width (30 mm from left) 
		yAxisRightMargin	: 0.05050505051, // 5.05 % width (15 mm from right)
		yAxisLineWidth 		: 1,
		yAxisTextBaseline	: "middle",
		yAxisTextAlign		: "right",
		yAxisNumSteps		: 6, // same as yGridNumLines
		yAxisNumDecimals	: 2,
		
		xAxisTopMargin 		: 0.9285714286, // 92.86 % height (15 mm from bottom)
		xAxisBottomMargin 	: 0.9285714286, // 92.86 % height (15 mm from top)
		xAxisLineWidth 		: 1,
		xAxisTextBaseline	: "top",
		xAxisTextAlign		: "center",
		xAxisNumSteps		: 8, // same as xGridNumLines
		xAxisNumDecimals	: 2,
		
		yGridNumLines 		: 6,
		yGridLineLength 	: 1,
		yGridSpaceLength 	: 4,
		yGridLineColor		: "#999",

		xGridNumLines 		: 8,
		xGridLineLength 	: 1,
		xGridSpaceLength 	: 4,
		xGridLineColor		: "#999",
		
		/* Private options */
		_overwriteMinMaxValues : true,
		
	};

	/* helper functions */
	function isArray(a) {
		
		return (Object.prototype.toString.call(a) === '[object Array]');
	
	}

	function inArray(needle, haystack) {

		for (var i = 0; i < haystack.length; i++) {

			if (needle == haystack[i]) return true;

		}

		return false;

	}
	
	function construct(options) {

		var haystack = [];
		
		for (var elem in GRAPH) {
			haystack.push(elem);
		}
		
		if (options instanceof Object) {
			for (var elem in options) {
				if (inArray(elem, haystack)) {
					GRAPH[elem] = options[elem];
				}
			}
		}
		
		var width 	= GRAPH.canvasWidth+40,
			height 	= GRAPH.canvasHeight+20,
			id 		= GRAPH.canvasId;
		
		/* Create canvas for new graph */
		this.canvas = document.createElement("canvas");

		this.canvas.setAttribute("width", GRAPH.canvasWidth + "px");
		this.canvas.setAttribute("height", GRAPH.canvasHeight + "px");

		this.canvas.setAttribute("id", id);

		if (GRAPH.newWindow) {
			/* append graph in a new window */
			this.graphWindow = window.open('','',"width="+width+",height="+height);
			this.elem = this.graphWindow.document.body;
		} else {
			this.elem = document.getElementById(GRAPH.appendTo);
		}
		
		this.elem.appendChild(this.canvas);

		this.context = this.canvas.getContext("2d");

		/* Number of plotted graphs */
		this.numberOfGraphs = 0;
		
		/* min and max values */
		this.yMax = 0;
		this.yMin = 0;
		this.xMax = 0;
		this.xMin = 0;

	}

	construct.prototype = {

		/*
		 * Plot a 2D line function from data
		 * @param {array} y (y point values)
		 * @param {array} x (x point values)
		 * @param {array} xRange (start and end values for x [start, end])
		 * @param {array} yRange (start and end values for y [start, end])
		 * @return {object} this
		 */
		plot : function(y, x, xRange, yRange) {

			/* Calculate the graphing area */
			var xStart = Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width),
				xEnd = Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width)-xStart,
				yStart = Math.floor((1-GRAPH.xAxisTopMargin)*this.canvas.height),
				yEnd = Math.floor(GRAPH.xAxisTopMargin*this.canvas.height)-yStart,
				px = 0, py = 0;

			var drawLine = 0;

			if (this.numberOfGraphs == 0) {
				/* Max and Min values for each axis */
				this.xMax = Math.max.apply(Math, x);
				this.xMin = Math.min.apply(Math, x);
				this.yMax = Math.max.apply(Math, y);
				this.yMin = Math.min.apply(Math, y);
				
				if (xRange instanceof Array) {
					this.xMin = xRange[0];
					this.xMax = xRange[1];
				}
				
				if (yRange instanceof Array) {
					this.yMin = yRange[0];
					this.yMax = yRange[1];
				}
			} else {
				if (xRange instanceof Array) {
					xRange[0] = xRange[0] < this.xMin ? this.xMin : xRange[0];
					xRange[1] = xRange[1] > this.xMax ? this.xMax : xRange[1];
				}

				if (yRange instanceof Array) {
					yRange[0] = yRange[0] < this.yMin ? this.yMin : yRange[0];
					yRange[1] = yRange[1] > this.yMax ? this.yMax : yRange[1];
				}
			}
			
			if ( ! (xRange instanceof Array)) {
				xRange = [];
				xRange.push(this.xMin);
				xRange.push(this.xMax);
			}
				
			if ( ! (yRange instanceof Array)) {
				yRange = [];
				yRange.push(this.yMin);
				yRange.push(this.yMax);
			}
			
			this.drawAxis();

			this.drawXAxisNumbers(this.xMin,this.xMax);
			
			/* Disable redrawing again the axis numbers. The first plot will set the scale */
			GRAPH.drawXAxisNumbers = false;
			
			this.drawYAxisNumbers(this.yMin, this.yMax);

			/* Disable redrawing again the axis numbers. The first plot will set the scale */
			GRAPH.drawYAxisNumbers = false;
			
			this.drawGrid();

			this.context.save();

			/* Stroke style */
			this.context.strokeStyle = GRAPH.colorList[(GRAPH.colorIndex++%GRAPH.colorList.length)];
			
			this.context.translate(xStart, yStart);

			this.context.beginPath();

			for (var i = 0, len = y.length; i < len; i++) {
				
				if (xRange[0] <= x[i] && x[i] <= xRange[1] && yRange[0] <= y[i] && y[i] <= yRange[1]) {
					px = xEnd*(x[i]-this.xMin)/(this.xMax-this.xMin);
					py = yEnd*(1-(y[i]-this.yMin)/(this.yMax-this.yMin));
					if (drawLine > 0) {
						this.context.lineTo(px, py);
					} else {
						this.context.moveTo(px, py);
					}
					drawLine++;				
				} else {
					drawLine = 0;
				}
			}

			this.context.lineWidth = GRAPH.lineWidth;
			this.context.stroke();
			this.context.restore();

			this.numberOfGraphs++;

			return this;

		},

		/*
		 * Plot a 2D line function
		 * @param {function} f (function to be plotted)
		 * @param {array} xRange (start, step and end values for x [start, step, end])
		 * @param {array} yRange (start and end values for y [start, end])
		 * @return {object} this
		 */
		plotFunction : function(f, xRange, yRange) {
			
			if (typeof f !== "function") {
				throw("First argument must be a function");	
			}

			if ( ! (xRange instanceof Array) || xRange.length < 3) {
				throw("Second argument must be an array with values [start, step, end]");
			}
			
			var x = [],
				y = [];

			for (var i = xRange[0]; i < xRange[2]; i += xRange[1]) {
				y.push(f(i));
				x.push(i);
			}

			/* Remove the step value */
			xRange.splice(1, 1);
			
			return this.plot(y, x, xRange, yRange);

		},

		/*
		 * Plot data using points
		 * @param {array} y (y point values)
		 * @param {array} x (x point values)
		 * @param {array} xRange (start and end values for x [start, end])
		 * @param {array} yRange (start and end values for y [start, end])
		 * @return {object} this
		 */
		plotPoints : function(y, x, xRange, yRange) {

			/* Calculate the graphing area */
			var xStart = Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width),
				xEnd = Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width)-xStart,
				yStart = Math.floor((1-GRAPH.xAxisTopMargin)*this.canvas.height),
				yEnd = Math.floor(GRAPH.xAxisTopMargin*this.canvas.height)-yStart,
				px = 0, py = 0;

			if (this.numberOfGraphs == 0) {
				/* Max and Min values for each axis */
				this.xMax = Math.max.apply(Math, x);
				this.xMin = Math.min.apply(Math, x);
				this.yMax = Math.max.apply(Math, y);
				this.yMin = Math.min.apply(Math, y);
				
				if (xRange instanceof Array) {
					this.xMin = xRange[0];
					this.xMax = xRange[1];
				}
				
				if (yRange instanceof Array) {
					this.yMin = yRange[0];
					this.yMax = yRange[1];
				}
			} else {
				if (xRange instanceof Array) {
					xRange[0] = xRange[0] < this.xMin ? this.xMin : xRange[0];
					xRange[1] = xRange[1] > this.xMax ? this.xMax : xRange[1];
				}

				if (yRange instanceof Array) {
					yRange[0] = yRange[0] < this.yMin ? this.yMin : yRange[0];
					yRange[1] = yRange[1] > this.yMax ? this.yMax : yRange[1];
				}
			}

			if ( ! (xRange instanceof Array)) {
				xRange = [];
				xRange.push(this.xMin);
				xRange.push(this.xMax);
			}

			if ( ! (yRange instanceof Array)) {
				yRange = [];
				yRange.push(this.yMin);
				yRange.push(this.yMax);
			}

			this.drawAxis();
			
			
			this.drawXAxisNumbers(this.xMin,this.xMax);

			/* Disable redrawing again the axis numbers. The first plot will set the scale */
			GRAPH.drawXAxisNumbers = false;

			this.drawYAxisNumbers(this.yMin, this.yMax);

			/* Disable redrawing again the axis numbers. The first plot will set the scale */
			GRAPH.drawYAxisNumbers = false;

			this.drawGrid();
			GRAPH.drawGrid = false;

			this.context.save();

			/* Stroke style */
			this.context.strokeStyle = GRAPH.colorList[(GRAPH.colorIndex++%GRAPH.colorList.length)];

			this.context.translate(xStart, yStart);

			for (var i = 0, len = y.length; i < len; i++) {

				if (xRange[0] <= x[i] && x[i] <= xRange[1] && yRange[0] <= y[i] && y[i] <= yRange[1]) {
					px = xEnd*(x[i]-this.xMin)/(this.xMax-this.xMin);
					py = yEnd*(1-(y[i]-this.yMin)/(this.yMax-this.yMin));

					this.context.beginPath();
					this.context.arc(px, py, GRAPH.pointRadius, 0, Math.PI*2, false);

					if (GRAPH.pointStroke) {
						this.context.lineWidth = GRAPH.lineWidth;
						this.context.stroke();
					}

					if (GRAPH.pointFill) {
						this.context.fill();
					}
					
					this.context.closePath();
				}
			}

			this.context.lineWidth = GRAPH.lineWidth;
			this.context.stroke();
			
			this.context.restore();

			this.numberOfGraphs++;

			return this;

		},
		
		/* 
		 * Plot a bars graph 
		 * @param {array} y (values)
		 * @param {array} (bar labels)
		 */
		bars : function(y, x) {

		},
		
		/*
		 * Shows the distribution of data values
		 * @param {array} y (values)
		 * @param {array} x (array of bar centers | number of bars)
		 */
		histogram : function(y, x) {
			// x is an array: plot x.length bars, each centered in x[i]
			
			// x is a number: create x bars
		},
		
		/* 
		 * Plots a pie chart 
		 * @param {array} y (values)
		 * @param {array} x (labels)
		 */
		pie : function(y, x) {
			
		},
		
		/*
		 * Draws the y axis. This function uses GRAPH.drawYAxis:
		 *   0: no axis is drawn
		 *   1: left side y axis is drawn
		 *   2: right side y axis is drawn
		 *   3: both y axis are drawn
		 */
		drawYAxis : function() {

			this.context.save();

			switch (GRAPH.drawYAxis) {
				default:
				case 1: // left y axis
					this.context.beginPath();
					this.context.moveTo(
						Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width)+0.5,
						Math.floor((1-GRAPH.xAxisBottomMargin)*this.canvas.height));
					this.context.lineTo(
						Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width)+0.5,
						Math.floor(GRAPH.xAxisTopMargin*this.canvas.height));

					this.context.lineWidth = GRAPH.yAxisLineWidth;
					this.context.stroke();
					break;
				case 2: // right y axis
					this.context.beginPath();
					this.context.moveTo(
						Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width)-0.5,
						Math.floor((1-GRAPH.xAxisBottomMargin)*this.canvas.height));
					this.context.lineTo(
						Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width)-0.5,
						Math.floor(GRAPH.xAxisTopMargin*this.canvas.height));

					this.context.lineWidth = GRAPH.yAxisLineWidth;
					this.context.stroke();
					break;
				case 3: 
					// left y axis
					this.context.beginPath();
					this.context.moveTo(
						Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width)+0.5,
						Math.floor((1-GRAPH.xAxisBottomMargin)*this.canvas.height));
					this.context.lineTo(
						Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width)+0.5,
						Math.floor(GRAPH.xAxisTopMargin*this.canvas.height));

					this.context.lineWidth = GRAPH.yAxisLineWidth;
					this.context.stroke();
					
					// right y axis
					this.context.beginPath();
					this.context.moveTo(
						Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width)-0.5,
						Math.floor((1-GRAPH.xAxisBottomMargin)*this.canvas.height));
					this.context.lineTo(
						Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width)-0.5,
						Math.floor(GRAPH.xAxisTopMargin*this.canvas.height));

					this.context.lineWidth = GRAPH.yAxisLineWidth;
					this.context.stroke();
					break;
				
				case 0: break;
			}

			this.context.restore();

			return this;

		},

		/*
		 * Draws the x axis. This function uses GRAPH.drawXAxis:
		 *   0: no axis is drawn
		 *   1: bottom x axis is drawn
		 *   2: top x axis is drawn
		 *   3: both x axis are drawn
		 */
		drawXAxis : function() {

			this.context.save();

			switch (GRAPH.drawXAxis) {
				default:
				case 1:
					// bottom x axis
					this.context.beginPath();

					this.context.moveTo(
						Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width),
						Math.floor(GRAPH.xAxisTopMargin*this.canvas.height)+0.5);
					this.context.lineTo(
						Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width),
						Math.floor(GRAPH.xAxisTopMargin*this.canvas.height)+0.5);

					this.context.lineWidth = GRAPH.xAxisLineWidth;
					this.context.stroke();
					break;
				case 2:
					// top x axis
					this.context.beginPath();

					this.context.moveTo(
						Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width),
						Math.floor((1-GRAPH.xAxisBottomMargin)*this.canvas.height)-0.5);
					this.context.lineTo(
						Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width),
						Math.floor((1-GRAPH.xAxisBottomMargin)*this.canvas.height)-0.5);

					this.context.lineWidth = GRAPH.xAxisLineWidth;
					this.context.stroke();
					break;
				case 3:
					// bottom x axis
					this.context.beginPath();

					this.context.moveTo(
						Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width),
						Math.floor(GRAPH.xAxisTopMargin*this.canvas.height)+0.5);
					this.context.lineTo(
						Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width),
						Math.floor(GRAPH.xAxisTopMargin*this.canvas.height)+0.5);

					this.context.lineWidth = GRAPH.xAxisLineWidth;
					this.context.stroke();
					
					// top x axis
					this.context.beginPath();

					this.context.moveTo(
						Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width),
						Math.floor((1-GRAPH.xAxisBottomMargin)*this.canvas.height)-0.5);
					this.context.lineTo(
						Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width),
						Math.floor((1-GRAPH.xAxisBottomMargin)*this.canvas.height)-0.5);

					this.context.lineWidth = GRAPH.xAxisLineWidth;
					this.context.stroke();
					break;
			}

			this.context.restore();

			return this;

		},

		/*
		 * Draws both x and y axis
		 */
		drawAxis : function() {

			if (GRAPH.drawYAxis) {
				this.drawYAxis();
			}

			/* draw y axis only one time */
			GRAPH.drawYAxis = false;

			if (GRAPH.drawXAxis) {
				this.drawXAxis();	
			}

			/* draw x axis only one time */
			GRAPH.drawXAxis = false;

			return this;

		},
		
		/*
		 * Draws the grid using the specified options
		 */
		drawGrid : function() {
			
			if (GRAPH.drawGrid) {
				/* Calculate the graphing area */
				var xStart = Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width),
					xEnd = Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width)-xStart,
					yStart = Math.floor((1-GRAPH.xAxisTopMargin)*this.canvas.height),
					yEnd = Math.floor(GRAPH.xAxisTopMargin*this.canvas.height)-yStart;

				var drawed = 0,
					yPos = 0,
					xPos = 0,
					k = 0;

				this.context.save();

				this.context.translate(xStart, yStart);

				this.context.beginPath();

				for (var i = 1; i <= GRAPH.xGridNumLines-1; i++) {

					xPos = Math.floor(i*xEnd/GRAPH.xGridNumLines);
					drawed = 0;
					this.context.moveTo(xPos, yEnd);
					k = 0;
					while (drawed < yEnd) {
						/* Move from bottom to top */
						switch (k%2) {
							case 0:
								drawed = (yEnd-drawed < GRAPH.yGridSpaceLength) ? yEnd : drawed+GRAPH.yGridSpaceLength;
								this.context.moveTo(xPos+0.5, yEnd-drawed);
								break;
							case 1:
								drawed = (yEnd-drawed < GRAPH.yGridLineLength) ? yEnd : drawed+GRAPH.yGridLineLength;
								this.context.lineTo(xPos+0.5, yEnd-drawed);
								break;
						}
						k++;
					}
				}

				this.context.strokeStyle = GRAPH.xGridLineColor;
				this.context.stroke();

				/* Reset counters */
				drawed = 0;

				for (var i = 1; i <= GRAPH.yGridNumLines-1; i++) {

					yPos = Math.floor(i*yEnd/GRAPH.yGridNumLines);
					drawed = 0;
					this.context.moveTo(xStart, yPos);
					k = 0;

					while (drawed < xEnd) {
						/* Move from left to right */
						switch (k%2) {
							case 0:
								drawed = (xEnd-drawed < GRAPH.xGridSpaceLength) ? xEnd : drawed+GRAPH.xGridSpaceLength;
								this.context.moveTo(xEnd-drawed, yPos+0.5);
								break;
							case 1:
								drawed = (xEnd-drawed < GRAPH.xGridLineLength) ? xEnd : drawed+GRAPH.xGridLineLength;
								this.context.lineTo(xEnd-drawed, yPos+0.5);
								break;
						}
						k++;
					}
				}

				this.context.strokeStyle = GRAPH.yGridLineColor;
				this.context.stroke();

				this.context.restore();
			}

			return this;

		},

		/*
		 * Draws the bottom side x axis numbers
		 * @param {start} number (the lowest number for the x axis)
		 * @param {end} number (the highest number for the x axis)
		 */
		drawXAxisNumbers : function(start, end) {

			/* Calculate the graphing area */
			var xStart = Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width),
				xEnd = Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width),
				yStart = Math.floor((1-GRAPH.xAxisTopMargin)*this.canvas.height),
				yEnd = Math.floor(GRAPH.xAxisTopMargin*this.canvas.height);
			
			if (GRAPH.drawXAxisNumbers) {
				this.context.save();
			
				this.context.textBaseline = GRAPH.xAxisTextBaseline;
				this.context.font = GRAPH.fontWeight+" "+GRAPH.fontSize+" "+GRAPH.fontFamily;
				this.context.textAlign = GRAPH.xAxisTextAlign;

				for (var i = 0; i <= GRAPH.xAxisNumSteps; i++) {
					this.context.fillText(
						(start+i*(end-start)/GRAPH.xAxisNumSteps)
							.toFixed(GRAPH.xAxisNumDecimals), 
						xStart+i*(xEnd-xStart)/GRAPH.xAxisNumSteps, 
						yEnd+3 /* 3px top margin from axis */);
				}
			
				this.context.restore();
			}

			return this;

		},
		
		/*
		 * Draws the left side y axis numbers
		 * @param {start} number (the lowest number for the y axis)
		 * @param {end} number (the highest number for the y axis)
		 */
		drawYAxisNumbers : function(start, end) {
			
			/* Calculate the graphing area */
			var xStart = Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width),
				xEnd = Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width),
				yStart = Math.floor((1-GRAPH.xAxisTopMargin)*this.canvas.height),
				yEnd = Math.floor(GRAPH.xAxisTopMargin*this.canvas.height);
			
			if (GRAPH.drawYAxisNumbers) {
				this.context.save();
			
				this.context.textBaseline = GRAPH.yAxisTextBaseline;
				this.context.font = GRAPH.fontWeight+" "+GRAPH.fontSize+" "+GRAPH.fontFamily;
				this.context.textAlign = GRAPH.yAxisTextAlign;

				for (var i = 0; i <= GRAPH.yAxisNumSteps; i++) {
					this.context.fillText(
						(end-i*(end-start)/GRAPH.yAxisNumSteps)
							.toFixed(GRAPH.yAxisNumDecimals), 
						xStart-5 /* 3px right margin from axis */, 
						yStart+i*(yEnd-yStart)/GRAPH.yAxisNumSteps);
				}
			
				this.context.restore();
			}

			return this;

		},
		
		/*
		 * Removes everything from the canvas
		 */
		clear : function() {
			
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			
			return this;
		}
	}

	return construct;

})();

/*

/*
 * Size of a DIN A4: 297 mm width, 210 mm height, ratio: sqrt(2)
 * All default values (in %) have been calculated considering the size of a DIN A4.
 *  ______________________________________________________________________________________
 * |                  A                                                                   |              A
 * |       ___________|______________________________________________________________     |              |
 * |  yMax|           |                                                  A           |<-->|              |
 * |      |           |                                                  |           |  yAxisRightMargin |
 * |      |           |                                                  |           |    |   (%)        |
 * |      |           | xAxisTopMargin (%)                               |           |    |              |
 * |<---->|           |                                                  |           |    |              |
 * | yAxisLeftMargin  |                                                  |           |    |              |
 * |      |(%)        |                                                  |           |    |              |
 * |      |           |                                                  |           |    |              |
 * |      |           |                   GRAPHING AREA                  |           |    |        canvas height
 * |      |           |                                                  |           |    |              |
 * |      |           |                                                  |           |    |              |
 * |      |           |                                                  |           |    |              |
 * |      |           |                                                  |           |    |              |
 * |      |           |                            xAxisBottomMargin (%) |           |    |              |
 * |      |           |                                                  |           |    |              |
 * |      |           |                                                  |           |    |              |
 * |  yMax|___________V__________________________________________________|___________|    |              |
 * |       xMin                                                          |       xMax     |              |
 * |_____________________________________________________________________V________________|              V
 *
 * <------------------------------------ canvas width ------------------------------------>
 */
		
/* Bezier curves */
// context.beginPath();
// context.quadraticCurveTo();
// context.moveTo(50, 150);
// context.quadraticCurveTo(250, 50, 450 /* end point x */, 150 /* end point y */);
		
// context.quadraticCurveTo(cp1x, cp1y, x /* end point x */, y /* end point y */);
// context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x /* end point x */, y /* end point y */);
// context.stroke();
