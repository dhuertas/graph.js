/*
 * @author dhuertas
 * @email huertas.dani@gmail.com
 */
var Graph = (function() {
	
		/* min and max values */
	var xMin = 0,
		xMax = 0,
		yMin = 0,
		yMax = 0,
		/* Start and end points of the graph area */
		xStart = 0,
		xEnd = 0,
		yStart = 0,
		yEnd = 0;

	var GRAPH = {
		canvasWidth : 600,
		canvasHeight : 600/Math.sqrt(2),
		appendTo : "",
		newWindow : false,
		canvasId : "graph",
		fontFamily : "sans-serif",
		fontWeight : "normal",
		fontSize : 10,
		
		title : "",
		titleFontSize : 12,
		titleFontWeight: "bold",
		
		colorList : ["#00F","#0F0","#F00","#0FF","#F0F","#FF0"],
		colorIndex : 0,
		
		drawTitle : false,
		drawYAxis : 3, // 0: none, 1: left, 2: right, 3: both
		drawYAxisNumbers : true,
		drawYAxisMarks : true,
		drawyAxisTitle : true,
		drawXAxis : 3, // 0: none, 1: bottom, 2: top, 3: both
		drawXAxisNumbers : true,
		drawXAxisMarks : true,
		drawXAxisTitle : true,
		drawGrid : true,
		drawPolarGrid : true,
		
		lineWidth : 1,
		lineShowPoints : false,
		
		pointStroke : true,
		pointFill : false,
		pointRadius : 3,
		pointColorIndex : 0,
		
		barWidth : 1, // % width
		barPosition : "left", // options are left, center, right. default: left.
		barLabelRotate : 0, // clockwise angle in degrees, starting from horizontal position
		
		yAxisLeftMargin : 0.101010101, // 10.1 % width (30 mm from left) 
		yAxisRightMargin : 0.05050505051, // 5.05 % width (15 mm from right)
		yAxisLineWidth : 1,
		yAxisTextBaseline : "middle",
		yAxisTextAlign : "right",
		yAxisNumSteps : 6, // same as yGridNumLines
		yAxisNumDecimals : 2,
		yAxisMarkLength : 3, // Mark length in pixels
		yAxisTitle : "",
		
		xAxisTopMargin : 0.9285714286, // 92.86 % height (15 mm from bottom)
		xAxisBottomMargin : 0.9285714286, // 92.86 % height (15 mm from top)
		xAxisLineWidth : 1,
		xAxisTextBaseline : "top",
		xAxisTextAlign : "center",
		xAxisNumSteps : 8, // same as xGridNumLines
		xAxisNumDecimals : 2,
		xAxisMarkLength : 3, // Mark length in pixels
		xAxisTitle : "",
		
		yGridNumLines : 6,
		yGridLineLength : 1,
		yGridSpaceLength : 4,
		yGridLineColor : "#999",

		xGridNumLines : 8,
		xGridLineLength : 1,
		xGridSpaceLength : 4,
		xGridLineColor : "#999",
		
		polarGridNumLines : 24, // Number of lines (360 deg / 30 deg = 12)
		polarGridLineLength : 1,
		polarGridSpaceLength : 4,
		polarGridColor : "#999"
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
		
		/* Start and end points of the graph area */
		xStart = Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width);
		xEnd = Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width);
		yStart = Math.floor((1-GRAPH.xAxisTopMargin)*this.canvas.height);
		yEnd = Math.floor(GRAPH.xAxisTopMargin*this.canvas.height);

	}

	construct.prototype = {

		/*
		 * Plot a 2D line function from data
		 * @param {array} y (y point values)
		 * @param {array} x (x point values)
		 * @param {array} xRange (optional: start and end values for x [start, end])
		 * @param {array} yRange (optional: start and end values for y [start, end])
		 * @return {object} this
		 */
		plot : function(y, x, xRange, yRange) {

			var px = 0, py = 0;

			var drawLine = 0;

			if (this.numberOfGraphs == 0) {
				/* Max and Min values for each axis */
				xMax = Math.max.apply(Math, x);
				xMin = Math.min.apply(Math, x);
				yMax = Math.max.apply(Math, y);
				yMin = Math.min.apply(Math, y);

				if (xRange instanceof Array) {
					xMin = xRange[0];
					xMax = xRange[1];
				}

				if (yRange instanceof Array) {
					yMin = yRange[0];
					yMax = yRange[1];
				}
			} else {
				if (xRange instanceof Array) {
					xRange[0] = xRange[0] < xMin ? xMin : xRange[0];
					xRange[1] = xRange[1] > xMax ? xMax : xRange[1];
				}

				if (yRange instanceof Array) {
					yRange[0] = yRange[0] < yMin ? yMin : yRange[0];
					yRange[1] = yRange[1] > yMax ? yMax : yRange[1];
				}
			}

			if ( ! (xRange instanceof Array)) {
				xRange = [];
				xRange.push(xMin);
				xRange.push(xMax);
			}

			if ( ! (yRange instanceof Array)) {
				yRange = [];
				yRange.push(yMin);
				yRange.push(yMax);
			}

			this.drawGrid();

			this.context.save();

			/* Stroke style */
			this.context.strokeStyle = GRAPH.colorList[(GRAPH.colorIndex++%GRAPH.colorList.length)];

			this.context.translate(xStart, yStart);

			this.context.beginPath();

			for (var i = 0, len = y.length; i < len; i++) {

				if (xRange[0] <= x[i] && x[i] <= xRange[1] && yRange[0] <= y[i] && y[i] <= yRange[1]) {
					px = (xEnd-xStart)*(x[i]-xMin)/(xMax-xMin);
					py = (yEnd-yStart)*(1-(y[i]-yMin)/(yMax-yMin));
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
			
			if (GRAPH.lineShowPoints) {
				for (var i = 0, len = y.length; i < len; i++) {
					if (xRange[0] <= x[i] && x[i] <= xRange[1] && yRange[0] <= y[i] && y[i] <= yRange[1]) {
						px = (xEnd-xStart)*(x[i]-xMin)/(xMax-xMin);
						py = (yEnd-yStart)*(1-(y[i]-yMin)/(yMax-yMin));
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
			}

			this.context.restore();

			this.drawAxis();

			this.drawXAxisNumbers(xMin, xMax);
			this.drawYAxisNumbers(yMin, yMax);

			this.numberOfGraphs++;

			return this;

		},

		/*
		 * Plot a 2D line function
		 * @param {function} f (function to be plotted)
		 * @param {array} xRange (start, step and end values for x [start, step, end])
		 * @param {array} yRange (optional: start and end values for y [start, end])
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
		 * @param {array} xRange (optional: start and end values for x [start, end])
		 * @param {array} yRange (optional: start and end values for y [start, end])
		 * @return {object} this
		 */
		plotPoints : function(y, x, xRange, yRange) {

			var px = 0, py = 0;

			if (this.numberOfGraphs == 0) {
				/* Max and Min values for each axis */
				xMax = Math.max.apply(Math, x);
				xMin = Math.min.apply(Math, x);
				yMax = Math.max.apply(Math, y);
				yMin = Math.min.apply(Math, y);

				if (xRange instanceof Array) {
					xMin = xRange[0];
					xMax = xRange[1];
				}

				if (yRange instanceof Array) {
					yMin = yRange[0];
					yMax = yRange[1];
				}
			} else {
				if (xRange instanceof Array) {
					xRange[0] = xRange[0] < xMin ? xMin : xRange[0];
					xRange[1] = xRange[1] > xMax ? xMax : xRange[1];
				}

				if (yRange instanceof Array) {
					yRange[0] = yRange[0] < yMin ? yMin : yRange[0];
					yRange[1] = yRange[1] > yMax ? yMax : yRange[1];
				}
			}

			if ( ! (xRange instanceof Array)) {
				xRange = [];
				xRange.push(xMin);
				xRange.push(xMax);
			}

			if ( ! (yRange instanceof Array)) {
				yRange = [];
				yRange.push(yMin);
				yRange.push(yMax);
			}

			this.drawGrid();
			GRAPH.drawGrid = false;

			this.context.save();

			/* Stroke style */
			this.context.strokeStyle = GRAPH.colorList[(GRAPH.colorIndex++%GRAPH.colorList.length)];

			this.context.translate(xStart, yStart);

			for (var i = 0, len = y.length; i < len; i++) {

				if (xRange[0] <= x[i] && x[i] <= xRange[1] && yRange[0] <= y[i] && y[i] <= yRange[1]) {
					px = (xEnd-xStart)*(x[i]-xMin)/(xMax-xMin);
					py = (yEnd-yStart)*(1-(y[i]-yMin)/(yMax-yMin));

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

			this.drawAxis();

			this.drawXAxisNumbers(xMin, xMax);
			this.drawYAxisNumbers(yMin, yMax);

			this.numberOfGraphs++;

			return this;

		},
		
		/* 
		 * Plot a bars graph 
		 * @param {array} y (values)
		 * @param {array} (bar labels)
		 */
		bars : function(y, x, yRange) {

			if (this.numberOfGraphs == 0) {
				/* Max and Min values for each axis */
				xMax = Math.max.apply(Math, x);
				xMin = Math.min.apply(Math, x);
				yMax = Math.max.apply(Math, y);
				yMin = Math.min.apply(Math, y);

				if (yRange instanceof Array) {
					yMin = yRange[0];
					yMax = yRange[1];
				}
			} else {
				if (yRange instanceof Array) {
					yRange[0] = yRange[0] < yMin ? yMin : yRange[0];
					yRange[1] = yRange[1] > yMax ? yMax : yRange[1];
				}
			}

			if ( ! (yRange instanceof Array)) {
				yRange = [];
				yRange.push(yMin);
				yRange.push(yMax);
			}

			this.drawYAxisNumbers(yMin, yMax);

			this.drawYGrid();
			
			this.drawLabels(x);

			this.context.save();

			this.context.translate(xStart, yStart);

			for (var i = 0; i < y.length; i++) {
				/* top left corner position */
				px = i*(xEnd-xStart)/y.length;
				py = (yEnd-yStart)*(1-y[i]/yMax);

				switch (GRAPH.barPosition) {
					case "center":
						px += (1-GRAPH.barWidth)*(xEnd-xStart)/y.length/2;
						break;
					case "right":
						px += (1-GRAPH.barWidth)*(xEnd-xStart)/y.length;
						break;
					case "left":
					default:
						px += 0;
						break;
					
				}

				/* width and height of the rectangle */
				width = GRAPH.barWidth*(xEnd-xStart)/y.length;
				height = (yEnd-yStart)*y[i]/yMax;
				
				this.context.beginPath();
				this.context.rect(px, py, width, height);
				
				this.context.fillStyle = GRAPH.colorList[(GRAPH.colorIndex++%GRAPH.colorList.length)];
				this.context.fill();
			}

			this.context.restore();

			this.drawAxis();

			this.numberOfGraphs++;

			return this;

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

			var px = 0,
				py = 0;
			
				/* Start and end points of the graph area 
				xStart = Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width);
				xEnd = Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width);
				yStart = Math.floor((1-GRAPH.xAxisTopMargin)*this.canvas.height);
				yEnd = Math.floor(GRAPH.xAxisTopMargin*this.canvas.height);
				*/
			this.context.save();

			switch (GRAPH.drawYAxis) {
				default:
				case 1: // left y axis
					this.context.beginPath();
					this.context.moveTo(xStart-0.5, yStart);
					this.context.lineTo(xStart-0.5, yEnd);

					this.context.lineWidth = GRAPH.yAxisLineWidth;
					this.context.stroke();
					
					/* draw marks */
					if (GRAPH.drawYAxisMarks) {
						this.context.beginPath();
						for (var i = 0; i < GRAPH.yAxisNumSteps; i++) {
							px = xStart+0.5;
							py = yStart+Math.floor(i*(yEnd-yStart)/GRAPH.yAxisNumSteps);
							this.context.moveTo(px, py+0.5);
							this.context.lineTo(px+GRAPH.yAxisMarkLength, py+0.5);

							this.context.lineWidth = GRAPH.yAxisLineWidth;
							this.context.stroke();
						}
					}
					break;
				case 2: // right y axis
					this.context.beginPath();
					this.context.moveTo(xEnd+0.5, yStart);
					this.context.lineTo(xEnd+0.5, yEnd);

					this.context.lineWidth = GRAPH.yAxisLineWidth;
					this.context.stroke();
					
					/* draw marks */
					if (GRAPH.drawYAxisMarks) {
						this.context.beginPath();
						for (var i = 0; i < GRAPH.yAxisNumSteps; i++) {
							px = xEnd-0.5;
							py = yStart+Math.floor(i*(yEnd-yStart)/GRAPH.yAxisNumSteps);
							this.context.moveTo(px, py+0.5);
							this.context.lineTo(px-GRAPH.yAxisMarkLength, py+0.5);

							this.context.lineWidth = GRAPH.yAxisLineWidth;
							this.context.stroke();
						}
					}
					break;
				case 3: 
					// left and right y axis
					this.context.beginPath();
					this.context.moveTo(xStart-0.5, yStart);
					this.context.lineTo(xStart-0.5, yEnd);

					this.context.lineWidth = GRAPH.yAxisLineWidth;
					this.context.stroke();

					// right y axis
					this.context.beginPath();
					this.context.moveTo(xEnd+0.5, yStart);
					this.context.lineTo(xEnd+0.5, yEnd);

					this.context.lineWidth = GRAPH.yAxisLineWidth;
					this.context.stroke();
					
					/* draw marks */
					if (GRAPH.drawYAxisMarks) {
						this.context.beginPath();
						for (var i = 1; i < GRAPH.yAxisNumSteps; i++) {
							px = xStart+0.5;
							py = yStart+Math.floor(i*(yEnd-yStart)/GRAPH.yAxisNumSteps);
							this.context.moveTo(px, py+0.5);
							this.context.lineTo(px+GRAPH.yAxisMarkLength, py+0.5);

							this.context.lineWidth = GRAPH.yAxisLineWidth;
							this.context.stroke();
							
							px = xEnd-0.5;
							py = yStart+Math.floor(i*(yEnd-yStart)/GRAPH.yAxisNumSteps);
							this.context.moveTo(px, py+0.5);
							this.context.lineTo(px-GRAPH.yAxisMarkLength, py+0.5);

							this.context.lineWidth = GRAPH.yAxisLineWidth;
							this.context.stroke();
						}
					}
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

			var px = 0,
				py = 0;

			this.context.save();

			switch (GRAPH.drawXAxis) {
				default:
				case 1:
					// bottom x axis
					this.context.beginPath();

					this.context.moveTo(xStart-0.5, yEnd+0.5);
					this.context.lineTo(xEnd+0.5, yEnd+0.5);

					this.context.lineWidth = GRAPH.xAxisLineWidth;
					this.context.stroke();

					/* draw marks */
					if (GRAPH.drawXAxisMarks) {
						this.context.beginPath();
						for (var i = GRAPH.xAxisNumSteps; i > 0; i--) {
							px = xStart+Math.floor(i*(xEnd-xStart)/GRAPH.xAxisNumSteps)+0.5;
							py = yEnd-0.5;
							this.context.moveTo(px, py);
							this.context.lineTo(px, py-GRAPH.xAxisMarkLength);

							this.context.lineWidth = GRAPH.yAxisLineWidth;
							this.context.stroke();
						}
					}
					break;
				case 2:
					// top x axis
					this.context.beginPath();

					this.context.moveTo(xStart-0.5, yStart-0.5);
					this.context.lineTo(xEnd+0.5, yStart-0.5);

					this.context.lineWidth = GRAPH.xAxisLineWidth;
					this.context.stroke();

					/* draw marks */
					if (GRAPH.drawXAxisMarks) {
						this.context.beginPath();
						for (var i = GRAPH.xAxisNumSteps; i > 0; i--) {
							px = xStart+Math.floor(i*(xEnd-xStart)/GRAPH.xAxisNumSteps)+0.5;
							py = yStart+0.5;
							this.context.moveTo(px, py);
							this.context.lineTo(px, py+GRAPH.yAxisMarkLength);

							this.context.lineWidth = GRAPH.yAxisLineWidth;
							this.context.stroke();
						}
					}
					break;
				case 3:
					// bottom x axis
					this.context.beginPath();

					this.context.moveTo(xStart-0.5, yEnd+0.5);
					this.context.lineTo(xEnd+0.5, yEnd+0.5);

					this.context.lineWidth = GRAPH.xAxisLineWidth;
					this.context.stroke();

					// top x axis
					this.context.beginPath();

					this.context.moveTo(xStart-0.5, yStart-0.5);
					this.context.lineTo(xEnd+0.5, yStart-0.5);

					this.context.lineWidth = GRAPH.xAxisLineWidth;
					this.context.stroke();

					/* draw marks */
					if (GRAPH.drawXAxisMarks) {
						this.context.beginPath();
						for (var i = GRAPH.xAxisNumSteps; i > 0; i--) {
							px = xStart+Math.floor(i*(xEnd-xStart)/GRAPH.xAxisNumSteps)+0.5;
							py = yEnd-0.5;
							this.context.moveTo(px, py);
							this.context.lineTo(px, py-GRAPH.xAxisMarkLength);

							this.context.lineWidth = GRAPH.yAxisLineWidth;
							this.context.stroke();

							px = xStart+Math.floor(i*(xEnd-xStart)/GRAPH.xAxisNumSteps)+0.5;
							py = yStart+0.5;
							this.context.moveTo(px, py);
							this.context.lineTo(px, py+GRAPH.yAxisMarkLength);

							this.context.lineWidth = GRAPH.yAxisLineWidth;
							this.context.stroke();
						}
					}
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

		drawYGrid : function() {

			var drawed = 0,
				yPos = 0,
				xPos = 0,
				k = 0;

			if (GRAPH.drawGrid) {

				this.context.save();

				this.context.translate(xStart, yStart);

				this.context.beginPath();

				for (var i = 1; i <= GRAPH.yGridNumLines-1; i++) {

					yPos = Math.floor(i*(yEnd-yStart)/GRAPH.yGridNumLines);
					drawed = 0;
					this.context.moveTo(xStart, yPos);
					k = 0;

					while (drawed < (xEnd-xStart)) {
						/* Move from left to right */
						switch (k%2) {
							case 0:
								drawed = ((xEnd-xStart)-drawed < GRAPH.xGridSpaceLength) ? (xEnd-xStart) : drawed+GRAPH.xGridSpaceLength;
								this.context.moveTo((xEnd-xStart)-drawed, yPos+0.5);
								break;
							case 1:
								drawed = ((xEnd-xStart)-drawed < GRAPH.xGridLineLength) ? (xEnd-xStart) : drawed+GRAPH.xGridLineLength;
								this.context.lineTo((xEnd-xStart)-drawed, yPos+0.5);
								break;
						}
						k++;
					}
				}

				this.context.strokeStyle = GRAPH.yGridLineColor;
				this.context.stroke();

				this.context.restore();
			}

			GRAPH.drawPolarGrid = false;

			return this;
		},
		
		drawXGrid : function() {

			var drawed = 0,
				yPos = 0,
				xPos = 0,
				k = 0;

			if (GRAPH.drawGrid) {

				this.context.save();

				this.context.translate(xStart, yStart);

				this.context.beginPath();
				
				for (var i = 1; i <= GRAPH.xGridNumLines-1; i++) {

					xPos = Math.floor(i*(xEnd-xStart)/GRAPH.xGridNumLines);
					drawed = 0;
					this.context.moveTo(xPos, (yEnd-yStart));
					k = 0;
					while (drawed < (yEnd-yStart)) {
						/* Move from bottom to top */
						switch (k%2) {
							case 0:
								drawed = ((yEnd-yStart)-drawed < GRAPH.yGridSpaceLength) ? (yEnd-yStart) : drawed+GRAPH.yGridSpaceLength;
								this.context.moveTo(xPos+0.5, (yEnd-yStart)-drawed);
								break;
							case 1:
								drawed = ((yEnd-yStart)-drawed < GRAPH.yGridLineLength) ? (yEnd-yStart) : drawed+GRAPH.yGridLineLength;
								this.context.lineTo(xPos+0.5, (yEnd-yStart)-drawed);
								break;
						}
						k++;
					}
				}

				this.context.strokeStyle = GRAPH.xGridLineColor;
				this.context.stroke();
				
				this.context.restore();
			}

			return this;
		},
		
		/*
		 * Draws the grid using the specified options
		 */
		drawGrid : function() {

			if (GRAPH.drawGrid) {
				this.drawXGrid();
				this.drawYGrid();
			}
			
			GRAPH.drawGrid = false;

			if (GRAPH.drawPolarGrid) {
				this.drawPolarGrid();
			}

			return this;

		},

		/*
		 * Draws a polar grid
		 */
		drawPolarGrid : function() {

			var alfa = 0,
				beta = Math.atan2(yEnd-yStart,xEnd-xStart),
				h, 
				k, 
				drawLine = 0, 
				drawed = 0;

			if (GRAPH.drawPolarGrid) {

				this.context.save();

				this.context.translate(xStart+(xEnd-xStart)/2, yStart+(yEnd-yStart)/2);

				for (var i = 0; i < GRAPH.polarGridNumLines; i++) {

					alfa = i*Math.PI*2/GRAPH.polarGridNumLines;

					if (alfa < beta) {
						h = (xEnd-xStart)/2/Math.cos(alfa);
					} else if (alfa >= beta && alfa < Math.PI-beta) {
						h = (yEnd-yStart)/2/Math.cos(Math.PI/2-alfa);
					} else if (alfa >= Math.PI-beta && alfa < Math.PI+beta) {
						h = (xEnd-xStart)/2/Math.abs(Math.cos(alfa));
					} else if (alfa >= Math.PI+beta && alfa < 2*Math.PI-beta) {
						h = (yEnd-yStart)/2/Math.abs(Math.cos(Math.PI/2-alfa));
					} else {
						h = (xEnd-xStart)/2/Math.cos(alfa);
					}

					/* Draw a dotted line from the center */
					k = 0;
					drawed = 0;

					while (drawed < h) {
						switch (k%2) {
							case 0:
								drawed = (h-drawed < GRAPH.polarGridSpaceLength) ? h : drawed+GRAPH.polarGridSpaceLength;
								this.context.moveTo(drawed, -0.5);
								break;
							case 1:
								drawed = (h-drawed < GRAPH.polarGridLineLength) ? h : drawed+GRAPH.polarGridLineLength;
								this.context.lineTo(drawed, -0.5);
								break;
						}
						k++;
					}

					this.context.rotate(Math.PI*2/GRAPH.polarGridNumLines);
				}

				this.context.strokeStyle = GRAPH.polarGridLineColor;
				this.context.stroke();

				this.context.restore();
			}

			GRAPH.drawPolarGrid = false;

			return this;
		},
		
		/*
		 * Draws the bottom side x axis numbers
		 * @param {start} number (the lowest number for the x axis)
		 * @param {end} number (the highest number for the x axis)
		 */
		drawXAxisNumbers : function(start, end) {

			if (GRAPH.drawXAxisNumbers) {
				this.context.save();

				this.context.textBaseline = GRAPH.xAxisTextBaseline;
				this.context.font = GRAPH.fontWeight+" "+GRAPH.fontSize+"px "+GRAPH.fontFamily;
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

			/* Disable redrawing again the axis numbers. The first plot will set the scale */
			GRAPH.drawXAxisNumbers = false;

			return this;

		},

		/*
		 * Draws the left side y axis numbers
		 * @param {start} number (the lowest number for the y axis)
		 * @param {end} number (the highest number for the y axis)
		 */
		drawYAxisNumbers : function(start, end) {

			if (GRAPH.drawYAxisNumbers) {
				this.context.save();

				this.context.textBaseline = GRAPH.yAxisTextBaseline;
				this.context.font = GRAPH.fontWeight+" "+GRAPH.fontSize+"px "+GRAPH.fontFamily;
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

			/* Disable redrawing again the axis numbers. The first plot will set the scale */
			GRAPH.drawYAxisNumbers = false;

			return this;

		},
		
		/*
		 * Draws the labels for a bar plot
		 * @param {array} labels
		 * @return {object} this
		 */
		drawLabels : function(labels) {

			var px = 0, 
				py = 0,
				rad = 0;

			if (GRAPH.barLabelRotate == 0) {
				this.context.textAlign = "center";
			} else if (Math.abs(GRAPH.barLabelRotate) < 90) {
				this.context.textAlign = "left";
				rad = GRAPH.barLabelRotate*Math.PI/180;
			} else {
				this.context.textAlign = "right";
				rad = -Math.PI+GRAPH.barLabelRotate*Math.PI/180;
			}

			for (var i = 0, len = labels.length; i < len; i++) {
				this.context.save();

				px = xStart+i*(xEnd-xStart)/len+(xEnd-xStart)/len/2;
			 	py = yEnd+GRAPH.fontSize+3;

				this.context.translate(px, py);
				this.context.font = GRAPH.fontWeight+" "+GRAPH.fontSize+"px "+GRAPH.fontFamily;
				this.context.rotate(rad);

				this.context.fillText(labels[i], 0, 0);

				this.context.restore();
			}

			return this;
		},

		/*
		 * Adds a title to the canvas
		 * @param {string} title
		 * @return {object} this
		 */
		drawTitle : function(title) {

			var px = 0,
				py = 0;

			if (title || GRAPH.drawTitle) {

				this.context.save();

				this.context.textAlign = "center";
				this.context.font = GRAPH.titleFontWeight+" "+GRAPH.titleFontSize+"px "+GRAPH.fontFamily;

				px = xStart + (xEnd-xStart)/2;
				py = (1-GRAPH.xAxisBottomMargin)*this.canvas.height/2;

				this.context.fillText((title ? title : GRAPH.title), px, py);

				this.context.restore();
			}

			return this;
		},

		drawXAxisTitle : function(title) {

			var px = 0,
				py = 0;

			if (title || GRAPH.drawXAxisTitle) {

				this.context.save();

				this.context.textAlign = "center";
				this.context.font = GRAPH.fontWeight+" "+GRAPH.fontSize+"px "+GRAPH.fontFamily;

				px = xStart + (xEnd-xStart)/2;
				py = this.canvas.height - 
					(1-GRAPH.xAxisTopMargin)*this.canvas.height/2
					+ GRAPH.fontSize; // top margin for x axis title

				this.context.fillText((title ? title : GRAPH.xAxisTitle), px, py);

				this.context.restore();	
			}

			return this;
		},

		drawYAxisTitle : function(title) {

			var px = 0,
				py = 0;

			if (title || GRAPH.drawYAxisTitle) {

				this.context.save();

				this.context.textAlign = "center";
				this.context.font = GRAPH.fontWeight+" "+GRAPH.fontSize+"px "+GRAPH.fontFamily;

				px = GRAPH.yAxisLeftMargin*this.canvas.width/2;
				py = yStart+(yEnd-yStart)/2;

				this.context.translate(px, py);
				this.context.rotate(-Math.PI/2);
				this.context.fillText((title ? title : GRAPH.xAxisTitle), 0, 0);

				this.context.restore();	
			}

			return this;
		},

		set : function(options) {

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

			/* Start and end points of the graph area */
			xStart = Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width);
			xEnd = Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width);
			yStart = Math.floor((1-GRAPH.xAxisTopMargin)*this.canvas.height);
			yEnd = Math.floor(GRAPH.xAxisTopMargin*this.canvas.height);

			return this;
		},

		/*
		 * Removes everything from the canvas
		 */
		clear : function() {

			GRAPH.colorIndex = 0;
			GRAPH.pointColorIndex = 0;
			GRAPH.drawYAxisNumbers = true;
			GRAPH.drawXAxisNumbers = true;
			GRAPH.drawGrid = true;

			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

			return this;
		},
		
		toImage : function(mime) {

			var image = new Image();

			image.src = this.canvas.toDataURL(mime ? mime : "image/png");

			return image;
		}
	}

	return construct;

})();

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
