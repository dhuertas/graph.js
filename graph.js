/*
 * @author dhuertas
 * @email huertas.dani@gmail.com
 */
var Graph = (function() {

	/*
	 * Size of a DIN A4: 297 mm width, 210 mm height, ratio: sqrt(2)
	 * All ratios have been obtained considering the canvas 
	 * area of a DIN A4.
	 */
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
		
		yAxisLeftMargin 	: 0.101010101, // 10.1 % width (30 mm from left)
		yAxisRightMargin	: 0.05050505051, // 5.05 % width (15 mm from right)
		yAxisLineWidth 		: 1,
		yAxisTextBaseline	: "middle",
		yAxisTextAlign		: "right",
		yAxisNumSteps		: 6, // same as yGridNumLines
		yAxisNumPrecision	: 2,
		
		xAxisTopMargin 		: 0.9285714286, // 92.86 % height (15 mm from bottom)
		xAxisBottomMargin 	: 0.9285714286, // 92.86 % height (15 mm from top)
		xAxisLineWidth 		: 1,
		xAxisTextBaseline	: "top",
		xAxisTextAlign		: "center",
		xAxisNumSteps		: 8, // same as xGridNumLines
		xAxisNumPrecision	: 2,
		
		yGridNumLines 		: 6,
		yGridLineLength 	: 1,
		yGridSpaceLength 	: 4,
		yGridLineColor		: "#999",

		xGridNumLines 		: 8,
		xGridLineLength 	: 1,
		xGridSpaceLength 	: 4,
		xGridLineColor		: "#999"
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
			/* append graph in a new window for now */
			this.graphWindow = window.open('','',"width="+width+",height="+height);
			this.elem = this.graphWindow.document.body;
		} else {
			this.elem = document.getElementById(GRAPH.appendTo);
		}
		
		this.elem.appendChild(this.canvas);

		this.context = this.canvas.getContext("2d");

	}

	construct.prototype = {

		plot : function(y, x, xRange, yRange) {

			/* Calculate the graphing area */2*Math.PI
			var xStart = Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width),
				xEnd = Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width)-xStart,
				yStart = Math.floor((1-GRAPH.xAxisTopMargin)*this.canvas.height),
				yEnd = Math.floor(GRAPH.xAxisTopMargin*this.canvas.height)-yStart;
			
			/* Max and Min values for each axis */
			var yMax = Math.max.apply(Math, y),
				yMin = Math.min.apply(Math, y),
				xMax = Math.max.apply(Math, x),
				xMin = Math.min.apply(Math, x);
			
			/* Plot only a part */
			var xPlotRange = (xRange instanceof Array && xRange.length == 2) ? true : false,
				yPlotRange = (yRange instanceof Array && yRange.length == 2) ? true : false;
			
			var follow = 0;
			
			this.context.save();

			/* Stroke style */
			this.context.strokeStyle = GRAPH.colorList[(GRAPH.colorIndex++%GRAPH.colorList.length)];
			
			this.context.translate(xStart, yStart);

			this.context.beginPath();

			for (var i = 0, len = y.length; i < len; i++) {
				
				if (xPlotRange && yPlotRange) {
					if (xRange[0] <= x[i] && x[i] <= xRange[1] && yRange[0] <= y[i] && y[i] <= yRange[1]) {
						if (follow > 0) {
							this.context.lineTo(xEnd*(x[i]-xRange[0])/(xRange[1]-xRange[0]), yEnd*(1-(y[i]-yRange[0])/(yRange[1]-yRange[0])));
						} else {
							this.context.moveTo(xEnd*(x[i]-xRange[0])/(xRange[1]-xRange[0]), yEnd*(1-(y[i]-yRange[0])/(yRange[1]-yRange[0])));
						}
						follow++;				
					} else {
						follow = 0;
					}
				} else if (xPlotRange && ! yPlotRange) {
					if (xRange[0] <= x[i] && x[i] <= xRange[1]) {
						if (follow > 0) {
							this.context.lineTo(xEnd*(x[i]-xRange[0])/(xRange[1]-xRange[0]), yEnd*(1-(y[i]-yMin)/(yMax-yMin)));
						} else {
							this.context.moveTo(xEnd*(x[i]-xRange[0])/(xRange[1]-xRange[0]), yEnd*(1-(y[i]-yMin)/(yMax-yMin)));
						}
						follow++;
					} else {
						follow = 0;
					}
				} else if ( ! xPlotRange && yPlotRange) {
					if (yRange[0] <= y[i] && y[i] <= yRange[1]) {
						if (follow > 0) {
							this.context.lineTo(xEnd*(x[i]-xMin)/(xMax-xMin), yEnd*(1-(y[i]-yRange[0])/(yRange[1]-yRange[0])));
						} else {
							this.context.moveTo(xEnd*(x[i]-xMin)/(xMax-xMin), yEnd*(1-(y[i]-yRange[0])/(yRange[1]-yRange[0])));
						}
						follow++;
					} else {
						follow = 0;
					}
				} else {
					this.context.lineTo(xEnd*(x[i]-xMin)/(xMax-xMin), yEnd*(1-(y[i]-yMin)/(yMax-yMin)));
				}

			}

			this.context.stroke();
			this.context.restore();
			
			this.drawXAxisNumbers(xRange[0],xRange[1]);
			this.drawYAxisNumbers(yRange[0],yRange[1]);
			
			return this;

		},

		plotFunction : function(f, xRange, yRange) {
			
			if (typeof f !== "function") throw("First argument must be a function");
			
			if ( ! (xRange instanceof Array)) {
				xRange = [0,0.1,1]; // xRange: [start, step, end]
			} else if (xRange instanceof Array && xRange.length < 2) {
				throw("Second argument must be an array of the form [start, end] or [start, step, end]");
			} else if (xRange instanceof Array && xRange.length == 2) {
				xRange.push(xRange[1]);
				xRange[1] = 1; // xRange: [start, step, end]
			}
			
			var x = [],
				y = [];
			
			/* Calculate the graphing area */
			var xStart = Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width),
				xEnd = Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width)-xStart,
				yStart = Math.floor((1-GRAPH.xAxisTopMargin)*this.canvas.height),
				yEnd = Math.floor(GRAPH.xAxisTopMargin*this.canvas.height)-yStart;
			
			/* Plot only a part */
			var xPlotRange = (xRange instanceof Array && xRange.length >= 2) ? true : false,
				yPlotRange = (yRange instanceof Array && yRange.length == 2) ? true : false;
			
			var follow = 0;
			
			for (var i = xRange[0]; i < xRange[2]; i+=xRange[1]) {
				y.push(f(i));
				x.push(i);
			}

			/* Max and Min values for each axis */
			var yMax = Math.max.apply(Math, y),
				yMin = Math.min.apply(Math, y),
				xMax = Math.max.apply(Math, x),
				xMin = Math.min.apply(Math, x);

			if ( ! (yRange instanceof Array)) {
				yRange = [];
				yRange.push(yMin);
				yRange.push(yMax);
			}
			
			this.context.save();

			/* Stroke style */
			this.context.strokeStyle = GRAPH.colorList[(GRAPH.colorIndex++%GRAPH.colorList.length)];
			
			this.context.translate(xStart, yStart);
			
			this.context.beginPath();

			for (var i = 0, len = y.length; i < len; i++) {
				
				if (xPlotRange && yPlotRange) {
					if (xRange[0] <= x[i] && x[i] <= xRange[2] && yRange[0] <= y[i] && y[i] <= yRange[1]) {
						if (follow > 0) {
							this.context.lineTo(xEnd*(x[i]-xRange[0])/(xRange[2]-xRange[0]), yEnd*(1-(y[i]-yRange[0])/(yRange[1]-yRange[0])));
						} else {
							this.context.moveTo(xEnd*(x[i]-xRange[0])/(xRange[2]-xRange[0]), yEnd*(1-(y[i]-yRange[0])/(yRange[1]-yRange[0])));
						}
						follow++;				
					} else {
						follow = 0;
					}
				} else if (xPlotRange && ! yPlotRange) {
					if (xRange[0] <= x[i] && x[i] <= xRange[2]) {
						if (follow > 0) {
							this.context.lineTo(xEnd*(x[i]-xRange[0])/(xRange[2]-xRange[0]), yEnd*(1-(y[i]-yMin)/(yMax-yMin)));
						} else {
							this.context.moveTo(xEnd*(x[i]-xRange[0])/(xRange[2]-xRange[0]), yEnd*(1-(y[i]-yMin)/(yMax-yMin)));
						}
						follow++;
					} else {
						follow = 0;
					}
				} else if ( ! xPlotRange && yPlotRange) {
					if (yRange[0] <= y[i] && y[i] <= yRange[1]) {
						if (follow > 0) {
							this.context.lineTo(xEnd*(x[i]-xMin)/(xMax-xMin), yEnd*(1-(y[i]-yRange[0])/(yRange[1]-yRange[0])));
						} else {
							this.context.moveTo(xEnd*(x[i]-xMin)/(xMax-xMin), yEnd*(1-(y[i]-yRange[0])/(yRange[1]-yRange[0])));
						}
						follow++;
					} else {
						follow = 0;
					}
				} else {
					this.context.lineTo(xEnd*(x[i]-xMin)/(xMax-xMin), yEnd*(1-(y[i]-yMin)/(yMax-yMin)));
				}

			}

			this.context.stroke();
			this.context.restore();

			this.drawXAxisNumbers(xRange[0],xRange[2]);
			this.drawYAxisNumbers(yRange[0],yRange[1]);

			return this;

		},

		plotPoints : function(f, x, xRange, yRange) {

		},

		drawYAxis : function() {

			this.context.save();

			/* Default left margin for y axis */
			this.context.beginPath();
			this.context.moveTo(
				Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width)-0.5,
				Math.floor((1-GRAPH.xAxisBottomMargin)*this.canvas.height));
			this.context.lineTo(
				Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width)-0.5,
				Math.floor(GRAPH.xAxisTopMargin*this.canvas.height));
			
			this.context.lineWidth = GRAPH.yAxisLineWidth;
			this.context.stroke();

			this.context.restore();

			return this;

		},

		drawXAxis : function() {

			this.context.save();

			/* Default top margin for x axis */
			this.context.beginPath();

			this.context.moveTo(
				Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width),
				Math.floor(GRAPH.xAxisTopMargin*this.canvas.height)+0.5);
			this.context.lineTo(
				Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width),
				Math.floor(GRAPH.xAxisTopMargin*this.canvas.height)+0.5);
			
			this.context.lineWidth = GRAPH.xAxisLineWidth;
			this.context.stroke();

			this.context.restore();

			return this;

		},

		drawAxis : function() {

			this.drawYAxis();

			this.drawXAxis();

			return this;

		},
		
		drawGrid : function() {
			
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

			return this;

		},

		drawXAxisNumbers : function(start, end) {

			/* Calculate the graphing area */
			var xStart = Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width),
				xEnd = Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width),
				yStart = Math.floor((1-GRAPH.xAxisTopMargin)*this.canvas.height),
				yEnd = Math.floor(GRAPH.xAxisTopMargin*this.canvas.height);
				
			this.context.save();
			
			this.context.textBaseline = GRAPH.xAxisTextBaseline;
			this.context.font = GRAPH.fontWeight+" "+GRAPH.fontSize+" "+GRAPH.fontFamily;
			this.context.textAlign = GRAPH.xAxisTextAlign;

			for (var i = 0; i <= GRAPH.xAxisNumSteps; i++) {
				this.context.fillText(
					(start+i*(end-start)/GRAPH.xAxisNumSteps).toPrecision(GRAPH.xAxisNumPrecision), 
					xStart+i*(xEnd-xStart)/GRAPH.xAxisNumSteps, 
					yEnd+3 /* 3px top margin from axis */);
			}
			
			this.context.restore();

			return this;

		},
		
		drawYAxisNumbers : function(start, end) {
			
			/* Calculate the graphing area */
			var xStart = Math.floor(GRAPH.yAxisLeftMargin*this.canvas.width),
				xEnd = Math.floor((1-GRAPH.yAxisRightMargin)*this.canvas.width),
				yStart = Math.floor((1-GRAPH.xAxisTopMargin)*this.canvas.height),
				yEnd = Math.floor(GRAPH.xAxisTopMargin*this.canvas.height);
					
			this.context.save();
			
			this.context.textBaseline = GRAPH.yAxisTextBaseline;
			this.context.font = GRAPH.fontWeight+" "+GRAPH.fontSize+" "+GRAPH.fontFamily;
			this.context.textAlign = GRAPH.yAxisTextAlign;

			for (var i = 0; i <= GRAPH.yAxisNumSteps; i++) {
				this.context.fillText(
					(end-i*(end-start)/GRAPH.yAxisNumSteps).toPrecision(GRAPH.yAxisNumPrecision), 
					xStart-5 /* 3px right margin from axis */, 
					yStart+i*(yEnd-yStart)/GRAPH.yAxisNumSteps);
			}
			
			this.context.restore();
			
			return this;

		},
		
		drawAll : function(xRange, yRange) {
			
			this.drawAxis();
			this.drawGrid();

			return this;

		}
	}

	return construct;

})();

/* Rectangles */
// context.fillRect(50 /* x */, 50 /* y */, 100 /* width */, 100 /* height */);
// context.strokeRect(50 /* x */, 50 /* y */, 100 /* width */, 100 /* height */);
		
/* Custom shapes */
// context.beginPath();
// context.moveTo(50 /* x */, 50 /* y */);
// context.lineTo(50 /* x */, 250/* y */);
// context.lineTo(250, 250);
// context.closePath();
// context.fill();
		
/* Clear canvas */
// context.clearRect(0, 0, canvas.width, canvas.height);
		
/* Drawing circles */
// context.beginPath();  
// context.arc(100 /* center x */, 100 /* center y*/, 50 /* radius */, 0 /* angle start */, Math.PI*2 /* angle stop */, false /* clockwise */);  
// context.closePath();  
// context.fill();
		
/* Bezier curves */
// context.beginPath();
// context.quadraticCurveTo();
// context.moveTo(50, 150);
// context.quadraticCurveTo(250, 50, 450 /* end point x */, 150 /* end point y */);
		
// context.quadraticCurveTo(cp1x, cp1y, x /* end point x */, y /* end point y */);
// context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x /* end point x */, y /* end point y */);
// context.stroke();
		
/* Translate */
// context.translate(100, 100);

/* Text */
// context.textBaseline = "top";
// context.font = "bold 12px sans-serif";
// context.textAlign = "right";
// context.textBaseline = "bottom";
// context.fillText("hello world", 492, 370);