/*
 * @author dhuertas
 * @email huertas.dani@gmail.com
 */

var Graph = (function() {

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

  function log(value, base) {

    return Math.log(value)/Math.log(base ? base : 10);
  }

  function min(arr) {

    if ( ! isArray(arr))
      return undefined;
    else if (arr.length == 1)
      return arr[0];

    var min = arr[0];
    for (var i = 1; i < arr.length; i++)
      if (arr[i] < min) 
        min = arr[i];

    return min;
  }

  function max(arr) {

    if ( ! isArray(arr))
      return undefined;
    else if (arr.length == 1)
      return arr[0];

    var max = arr[0];
    for (var i = 1; i < arr.length; i++)
      if (arr[i] > max) 
        max = arr[i];

    return max;
  }

  function parseDate(date, format) {

    var d = new Date(parseFloat(date)*1000);
    var len = (typeof format !== 'undefined') ? format.length : 0;
    var str = "";
    var i = 0, j = 0, v = 0;

    while (i < len) {

      if (format[i] != '%') {
        str = str.concat(format[i]);
        i++;
        continue;
      }

      i++;
      switch(format[i]) {
        case '%': str = str.concat('%'); break;
        case 'H': v = d.getHours(); str = str.concat(v<10 ? "0"+v : v); break;
        case 'M': v = d.getMinutes(); str = str.concat(v<10 ? "0"+v : v); break;
        case 's': v = d.getSeconds(); str = str.concat(v<10 ? "0"+v : v); break;
        case 'Y': v = d.getFullYear(); str = str.concat(v<10 ? "0"+v : v); break;
        case 'm': v = d.getMonth()+1; str = str.concat(v<10 ? "0"+v : v); break;
        case 'd': v = d.getDate(); str = str.concat(v<10 ? "0"+v : v); break;
      }
      i++;
    }

    return str;
  }

  function computeTimeStep(interval) {
    if (interval < 12*3600) {
      return 3600;
    } else if (12*3600 <= interval && interval < 86400) {
      return 2*3600;
    } else if (86400 <= interval && interval < 2*86400) {
      return 4*3600;
    } else if (2*86400 <= interval && interval < 15*86400) {
      // align to every day change
      return 86400;
    } else if (15*86400 <= interval && interval < 60*86400) {
      // align to every week change
      return 7*86400;
    } else if (60*86400 <= interval && interval < 180*86400) {
      // align to every month change
    } else if (180*86400 <= interval && interval < 2*360*86400) {
      // align to every 4 months change
    } else {
      // align to every year
    }
  }

  function construct(options) {

    this.GRAPH = {
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

      colorList : ["#0000FF","#8B00FF","#FF0000","#FF7F00","#FFFF00","#00FF00","#00FFFF",],
      colorIndex : 0,

      bgColor : "#FFF",

      showValues : true, // show a small div following the cursor with the values

      drawTitle : true,
      drawYAxis : 3, // 0: none, 1: left, 2: right, 3: both
      drawYAxisNumbers : true,
      drawYAxisMarks : true,
      drawYAxisTitle : true,
      drawXAxis : 3, // 0: none, 1: bottom, 2: top, 3: both
      drawXAxisNumbers : true,
      drawXAxisMarks : true,
      drawXAxisTitle : true,
      drawGrid : true,
      drawPolarGrid : false,
      drawPolarAxis : false,

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
      yAxisColor : "#000",
      yAxisTextBaseline : "middle",
      yAxisTextAlign : "right",
      yAxisTextRotate : 0,
      yAxisDatetimeFormat : "",
      yAxisDatetimeAlignment : false, // align y axis tics with date time (00:00)
      yAxisNumSteps : 6, // same as yGridNumLines
      yAxisNumDecimals : 2,
      yAxisMarkLength : 3, // Mark length in pixels
      yAxisTitle : "",
      yAxisScale : "lin", // options are: "lin", "log"
      yAxisLogBase : 10,

      xAxisTopMargin : 0.9285714286, // 92.86 % height (15 mm from bottom)
      xAxisBottomMargin : 0.9285714286, // 92.86 % height (15 mm from top)
      xAxisLineWidth : 1,
      xAxisColor : "#000",
      xAxisTextBaseline : "top",
      xAxisTextAlign : "center",
      xAxisTextRotate : 0,
      xAxisDatetimeFormat : "",
      xAxisDatetimeAlignment : false, // align x axis tics with date time (00:00)
      xAxisNumSteps : 8, // same as xGridNumLines
      xAxisNumDecimals : 2,
      xAxisMarkLength : 3, // Mark length in pixels
      xAxisTitle : "",
      xAxisScale : "lin", // options are: "lin", "log"
      xAxisLogBase : 10,

      yGridNumLines : 6,
      yGridLineLength : 1,
      yGridSpaceLength : 4,
      yGridLineColor : "#999",

      xGridNumLines : 8,
      xGridLineLength : 1,
      xGridSpaceLength : 4,
      xGridLineColor : "#999",

      polarGridNumLines : 24, // Number of lines (360 deg / 15 deg = 24)
      polarGridLineLength : 1,
      polarGridSpaceLength : 4,
      polarGridColor : "#999",
      polarAxisColor : "#222",
      polarAxisMargin : 0.75, // Margin to the closest axis
      polarAxisNumFormat : "deg" // options are: "deg" for degree, "rad" for radian
    };

    /* min and max values */
    this.xMin = 0;
    this.xMax = 0;
    this.xMin = 0;
    this.yMax = 0;

    /* Start and end points of the graph area */
    this.xStart = 0;
    this.xEnd = 0;
    this.yStart = 0;
    this.yEnd = 0;

    var haystack = [];

    for (var elem in this.GRAPH) {
      haystack.push(elem);
    }

    if (options instanceof Object) {
      for (var elem in options) {
        if (inArray(elem, haystack)) {
          this.GRAPH[elem] = options[elem];
        }
      }
    }

    var width = this.GRAPH.canvasWidth+40,
      height = this.GRAPH.canvasHeight+20,
      id = this.GRAPH.canvasId;

    /* Create canvas for new graph */
    this.canvas = document.createElement("canvas");

    this.canvas.setAttribute("width", this.GRAPH.canvasWidth + "px");
    this.canvas.setAttribute("height", this.GRAPH.canvasHeight + "px");

    this.canvas.setAttribute("id", id);

    if (this.GRAPH.newWindow) {
      /* append graph in a new window */
      this.graphWindow = window.open('','',"width="+width+",height="+height);
      this.elem = this.graphWindow.document.body;
      this.elem.appendChild(this.canvas);
    } else if (this.GRAPH.appendTo) {
      this.elem = document.getElementById(this.GRAPH.appendTo);
      this.elem.appendChild(this.canvas);
    }

    this.context = this.canvas.getContext("2d");

    /* Set the background color */
    this.context.save();

    this.context.fillStyle = this.GRAPH.bgColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.restore();

    /* Number of plotted graphs */
    this.numberOfGraphs = 0;

    /* Start and end points of the graph area */
    this.xStart = Math.floor(this.GRAPH.yAxisLeftMargin*this.canvas.width);
    this.xEnd = Math.floor((1-this.GRAPH.yAxisRightMargin)*this.canvas.width);
    this.yStart = Math.floor((1-this.GRAPH.xAxisTopMargin)*this.canvas.height);
    this.yEnd = Math.floor(this.GRAPH.xAxisBottomMargin*this.canvas.height);

    if (this.GRAPH.showValues) {
      var self = this,
        div = document.createElement("div");

      div.setAttribute("id", "values");
      div.style.position = "absolute";
      div.style.backgroundColor = "rgba(255,255,255,0.9)";
      div.style.border = "1px solid #666";
      div.style.fontSize = this.GRAPH.fontSize+"px";
      div.style.lineHeight = (this.GRAPH.fontSize+4)+"px";
      div.style.padding = "5px";
      div.style.display = "none";

      document.getElementsByTagName("body")[0].appendChild(div);

      this.canvas.addEventListener('mousemove', function(e) {

        var rect = self.canvas.getBoundingClientRect(),
          x = e.clientX-rect.left, 
          y = e.clientY-rect.top,
          p = self.getCoordinates(x, y);

          div.style.top = (e.pageY+10)+"px";
          div.style.left = (e.pageX+20)+"px";

          div.innerHTML = ""+
            "x: "+(self.GRAPH.xAxisDatetimeFormat != "" ? parseDate(p[0], self.GRAPH.xAxisDatetimeFormat) : p[0].toFixed(4))+" "+
            "y: "+(self.GRAPH.yAxisDatetimeFormat != "" ? parseDate(p[1], self.GRAPH.yAxisDatetimeFormat) : p[1].toFixed(4))+"</br>"+
            "r: "+p[2].toFixed(4)+" "+
            "t: "+p[3].toFixed(4)+"º";
      }, false);
      
      this.canvas.addEventListener('mouseout', function(e) {
        div.style.display = "none";
      }, false);

      this.canvas.addEventListener('mouseover', function(e) {
        div.style.display = "block";
      }, false);
    }
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

        switch (this.GRAPH.yAxisScale) {  
          case 'log':
          case 'logarithm':
            this.yMax = log(max(y), this.GRAPH.yAxisLogBase);
            this.yMin = log(min(y), this.GRAPH.yAxisLogBase);

            if (yRange instanceof Array) {
              this.yMin = log(yRange[0], this.GRAPH.yAxisLogBase);
              this.yMax = log(yRange[1], this.GRAPH.yAxisLogBase);
            }
            break;
          case 'lin':
          case 'linear':
          default:
            this.yMax = max(y);
            this.yMin = min(y);

            if (yRange instanceof Array) {
              this.yMin = yRange[0];
              this.yMax = yRange[1];
            }
            break;
        }

        switch (this.GRAPH.xAxisScale) {
          case 'log':
          case 'logarithm':
            this.xMax = log(max(x), this.GRAPH.xAxisLogBase);
            this.xMin = log(min(x), this.GRAPH.xAxisLogBase);

            if (xRange instanceof Array) {
              this.xMin = log(xRange[0], this.GRAPH.xAxisLogBase);
              this.xMax = log(xRange[1], this.GRAPH.xAxisLogBase);
            }
            break;
          case 'lin':
          case 'linear':
          default:
            this.xMax = max(x);
            this.xMin = min(x);

            if (xRange instanceof Array) {
              this.xMin = xRange[0];
              this.xMax = xRange[1];
            }
            break;
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

      this.drawGrid(this.yMin, this.yMax, this.xMin, this.xMax);

      this.context.save();

      /* Stroke style */
      this.context.strokeStyle = this.GRAPH.colorList[(this.GRAPH.colorIndex++%this.GRAPH.colorList.length)];

      this.context.translate(this.xStart, this.yStart);

      this.context.beginPath();

      for (var i = 0, len = y.length; i < len; i++) {

        if (xRange[0] <= (this.GRAPH.xAxisScale == "log" ? log(x[i], this.GRAPH.xAxisLogBase) : x[i]) && 
          (this.GRAPH.xAxisScale == "log" ? log(x[i], this.GRAPH.xAxisLogBase) : x[i]) <= xRange[1] && 
          yRange[0] <= (this.GRAPH.yAxisScale == "log" ? log(y[i], this.GRAPH.yAxisLogBase) : y[i]) && 
          (this.GRAPH.yAxisScale == "log" ? log(y[i], this.GRAPH.yAxisLogBase) : y[i]) <= yRange[1]) {

          switch (this.GRAPH.yAxisScale) {  
            case 'log':
            case 'logarithm':
              py = (this.yEnd-this.yStart)*
                (1-(log(y[i], this.GRAPH.yAxisLogBase)-this.yMin)/
                (this.yMax-this.yMin));
              break;
            case 'lin':
            case 'linear':
            default:
              py = (this.yEnd-this.yStart)*(1-(y[i]-this.yMin)/(this.yMax-this.yMin));
              break;
          }

          switch (this.GRAPH.xAxisScale) {
            case 'log':
            case 'logarithm':
              px = (this.xEnd-this.xStart)*
                (log(x[i], this.GRAPH.xAxisLogBase)-this.xMin)/
                (this.xMax-this.xMin);
              break;
            case 'lin':
            case 'linear':
            default:
              px = (this.xEnd-this.xStart)*(x[i]-this.xMin)/(this.xMax-this.xMin);
              break;
          }

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

      this.context.lineWidth = this.GRAPH.lineWidth;
      this.context.stroke();

      if (this.GRAPH.lineShowPoints) {

        for (var i = 0, len = y.length; i < len; i++) {
          if (xRange[0] <= (this.GRAPH.xAxisScale == "log" ? log(x[i], this.GRAPH.xAxisLogBase) : x[i]) && 
            (this.GRAPH.xAxisScale == "log" ? log(x[i], this.GRAPH.xAxisLogBase) : x[i]) <= xRange[1] && 
            yRange[0] <= (this.GRAPH.yAxisScale == "log" ? log(y[i], this.GRAPH.yAxisLogBase) : y[i]) && 
            (this.GRAPH.yAxisScale == "log" ? log(y[i], this.GRAPH.yAxisLogBase) : y[i]) <= yRange[1]) {

            switch (this.GRAPH.yAxisScale) {
              case 'log':
              case 'logarithm':
                py = (this.yEnd-this.yStart)*
                  (1-(log(y[i], this.GRAPH.yAxisLogBase)-this.yMin)/
                  (this.yMax-this.yMin));
                break;
              case 'lin':
              case 'linear':
              default:
                py = (this.yEnd-this.yStart)*(1-(y[i]-this.yMin)/(this.yMax-this.yMin));
                break;
            }

            switch (this.GRAPH.xAxisScale) {
              case 'log':
              case 'logarithm':
                px = (this.xEnd-this.xStart)*
                  (log(x[i], this.GRAPH.xAxisLogBase)-this.xMin)/
                  (this.xMax-this.xMin);
                break;
              case 'lin':
              case 'linear':
                px = (this.xEnd-this.xStart)*(x[i]-this.xMin)/(this.xMax-this.xMin);
              default:
                break;
            }

            this.context.beginPath();
            this.context.arc(px, py, this.GRAPH.pointRadius, 0, Math.PI*2, false);

            if (this.GRAPH.pointStroke) {
              this.context.lineWidth = this.GRAPH.lineWidth;
              this.context.stroke();
            }

            if (this.GRAPH.pointFill) {
              this.context.fill();
            }

            this.context.closePath();
          }
        }
      }

      this.context.restore();

      this.drawTitle();
      this.drawAxis(this.yMin, this.yMax, this.xMin, this.xMax);
      this.drawXAxisTitle();
      this.drawYAxisTitle();
      this.drawXAxisNumbers(this.xMin, this.xMax);
      this.drawYAxisNumbers(this.yMin, this.yMax);

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
    points : function(y, x, xRange, yRange) {

      var px = 0, py = 0;

      if (this.numberOfGraphs == 0) {
        /* Max and Min values for each axis */
        this.xMax = max(x);
        this.xMin = min(x);
        this.yMax = max(y);
        this.yMin = min(y);

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

      this.drawGrid(this.yMin, this.yMax, this.xMin, this.xMax);
      this.GRAPH.drawGrid = false;

      this.context.save();

      /* Stroke style */
      this.context.strokeStyle = this.GRAPH.colorList[(this.GRAPH.colorIndex++%this.GRAPH.colorList.length)];

      this.context.translate(this.xStart, this.yStart);

      for (var i = 0, len = y.length; i < len; i++) {

        if (xRange[0] <= x[i] && x[i] <= xRange[1] && yRange[0] <= y[i] && y[i] <= yRange[1]) {
          px = (this.xEnd-this.xStart)*(x[i]-this.xMin)/(this.xMax-this.xMin);
          py = (this.yEnd-this.yStart)*(1-(y[i]-this.yMin)/(this.yMax-this.yMin));

          this.context.beginPath();
          this.context.arc(px, py, this.GRAPH.pointRadius, 0, Math.PI*2, false);

          if (this.GRAPH.pointStroke) {
            this.context.lineWidth = this.GRAPH.lineWidth;
            this.context.stroke();
          }

          if (this.GRAPH.pointFill) {
            this.context.fill();
          }

          this.context.closePath();
        }
      }

      this.context.lineWidth = this.GRAPH.lineWidth;
      this.context.stroke();

      this.context.restore();

      this.drawTitle();

      this.drawAxis(this.yMin, this.yMax, this.xMin, this.xMax);

      this.drawXAxisTitle();
      this.drawYAxisTitle();

      this.drawXAxisNumbers(this.xMin, this.xMax);
      this.drawYAxisNumbers(this.yMin, this.yMax);

      this.numberOfGraphs++;

      return this;

    },

    /* 
     * Plot a polar graph 
     * @param {array} y (values)
     * @param {array} x (bar labels)
     * @param {float} rmax (max value for x and y axes)
     */
    polar : function(y, x, rmax) {

      this.set({
        drawGrid : false,
        drawPolarGrid : true,
        drawPolarAxis : true
      });

      if (typeof rmax == "undefined") rmax = 1;

      return this.plot(y, x, [-rmax, rmax], [-rmax,rmax]);
    },

    /* 
     * Plot a bars graph 
     * @param {array} y (values)
     * @param {array} x (bar labels)
     * @param {array} yRange (min and max values for y axis)
     */
    bars : function(y, x, yRange) {

      if (this.numberOfGraphs == 0) {
        /* Max and Min values for each axis */
        this.xMax = max(x);
        this.xMin = min(x);
        this.yMax = max(y);
        this.yMin = min(y);

        if (yRange instanceof Array) {
          this.yMin = yRange[0];
          this.yMax = yRange[1];
        }
      } else {
        if (yRange instanceof Array) {
          yRange[0] = yRange[0] < this.yMin ? this.yMin : yRange[0];
          yRange[1] = yRange[1] > this.yMax ? this.yMax : yRange[1];
        }
      }

      if ( ! (yRange instanceof Array)) {
        yRange = [];
        yRange.push(this.yMin);
        yRange.push(this.yMax);
      }

      this.drawYAxisNumbers(this.yMin > 0 ? 0 : this.yMin, this.yMax);
      this.drawYGrid(this.yMin, this.yMax);
      this.drawLabels(x);

      this.context.save();
      this.context.translate(this.xStart, this.yStart);

      for (var i = 0; i < y.length; i++) {
        /* top left corner position */
        px = i*(this.xEnd-this.xStart)/y.length;
        py = (this.yEnd-this.yStart)*(1-y[i]/this.yMax);

        switch (this.GRAPH.barPosition) {
          case "center":
            px += (1-this.GRAPH.barWidth)*(this.xEnd-this.xStart)/y.length/2;
            break;
          case "right":
            px += (1-this.GRAPH.barWidth)*(this.xEnd-this.xStart)/y.length;
            break;
          case "left":
          default:
            px += 0;
            break;
        }

        /* width and height of the rectangle */
        width = this.GRAPH.barWidth*(this.xEnd-this.xStart)/y.length;
        height = (this.yEnd-this.yStart)*y[i]/this.yMax;
        
        this.context.beginPath();
        this.context.rect(px, py, width, height);
        
        this.context.fillStyle = this.GRAPH.colorList[(this.GRAPH.colorIndex++%this.GRAPH.colorList.length)];
        this.context.fill();
      }

      this.context.restore();

      this.drawTitle();
      this.drawAxis(this.yMin, this.yMax, this.xMin, this.xMax);
      this.drawXAxisTitle();
      this.drawYAxisTitle();

      this.numberOfGraphs++;

      return this;

    },

    /*
     * Shows the distribution of data values
     * @param {array} y (values)
     * @param {array} x (array of bar centers | number of bars)
     */
    histogram : function(y, x) {

      /* Max and Min values for each axis */
      this.yMax = max(y);
      this.yMin = min(y);

      var frec = [], bins = [], index;

      if (this.numberOfGraphs == 0) {
        /* Max and Min values for each axis */
        this.yMax = max(y);
        this.yMin = min(y);
      }

      if (x instanceof Array) {
        this.xMax = max(x);
        this.xMin = min(x);
        // x is an array: plot x.length bars, each centered in x[i]

      } else if (typeof x == "number") {
        // x is a number: create x bars
        this.xMax = max(y);
        this.xMin = min(y);
        
        for (var i = 0; i < x; i++) {
          frec.push(0);
          bins.push((this.yMax-this.yMin)*i/x);
        }

        for (var i = 0, len = y.length; i < len; i++) {
          index = Math.floor((x)*(y[i]-this.yMin)/(this.yMax-this.yMin));
          frec[index]++;
        }

        /* Remove the upper bound frec. and add it to the last element */
        frec.pop();
        frec[frec.length-1]++;
      }

      this.yMax = max(frec);
      this.yMin = min(frec);

      this.drawYAxisNumbers( this.yMin > 0 ? 0 : this.yMin, this.yMax);
      this.drawXAxisNumbers(this.xMin, this.xMax);

      this.drawYGrid(this.yMin, this.yMax);

      this.context.save();

      this.context.translate(this.xStart, this.yStart);

      for (var i = 0; i < frec.length; i++) {
        /* top left corner position */
        px = i*(this.xEnd-this.xStart)/frec.length;
        py = (this.yEnd-this.yStart)*(1-frec[i]/this.yMax);

        switch (this.GRAPH.barPosition) {
          case "center":
            px += (1-this.GRAPH.barWidth)*(this.xEnd-this.xStart)/frec.length/2;
            break;
          case "right":
            px += (1-this.GRAPH.barWidth)*(this.xEnd-this.xStart)/frec.length;
            break;
          case "left":
          default:
            px += 0;
            break;
        }

        /* width and height of the rectangle */
        width = this.GRAPH.barWidth*(this.xEnd-this.xStart)/frec.length;
        height = (this.yEnd-this.yStart)*frec[i]/this.yMax;

        this.context.beginPath();
        this.context.rect(px, py, width, height);
        
        this.context.fillStyle = this.GRAPH.colorList[(this.GRAPH.colorIndex++%this.GRAPH.colorList.length)];
        this.context.fill();
      }

      this.context.restore();

      this.drawTitle();

      this.drawAxis(this.yMin, this.yMax, this.xMin, this.xMax);

      this.drawXAxisTitle();
      this.drawYAxisTitle();

      this.numberOfGraphs++;

      return this;
    },

    /*
     * Draws the y axis. This function uses this.GRAPH.drawYAxis:
     *   0: no axis is drawn
     *   1: left side y axis is drawn
     *   2: right side y axis is drawn
     *   3: both y axis are drawn
     */
    drawYAxis : function() {

      var px = 0,
        py = 0;

      this.context.save();

      switch (this.GRAPH.drawYAxis) {
        default:
        case 1: // left y axis
          this.context.beginPath();
          this.context.moveTo(this.xStart-0.5, this.yStart);
          this.context.lineTo(this.xStart-0.5, this.yEnd);

          this.context.lineWidth = this.GRAPH.yAxisLineWidth;
          this.context.strokeStyle = this.GRAPH.yAxisColor;
          this.context.stroke();

          /* draw marks */
          if (this.GRAPH.drawYAxisMarks) {
            this.context.beginPath();
            for (var i = 0; i < this.GRAPH.yAxisNumSteps; i++) {
              px = this.xStart+0.5;
              py = this.yStart+Math.floor(i*(this.yEnd-this.yStart)/this.GRAPH.yAxisNumSteps);
              this.context.moveTo(px, py+0.5);
              this.context.lineTo(px+this.GRAPH.yAxisMarkLength, py+0.5);

              this.context.lineWidth = this.GRAPH.yAxisLineWidth;
              this.context.strokeStyle = this.GRAPH.yAxisColor;
              this.context.stroke();
            }
          }
          break;
        case 2: // right y axis
          this.context.beginPath();
          this.context.moveTo(this.xEnd+0.5, this.yStart);
          this.context.lineTo(this.xEnd+0.5, this.yEnd);

          this.context.lineWidth = this.GRAPH.yAxisLineWidth;
          this.context.strokeStyle = this.GRAPH.yAxisColor;
          this.context.stroke();

          /* draw marks */
          if (this.GRAPH.drawYAxisMarks) {
            this.context.beginPath();
            for (var i = 0; i < this.GRAPH.yAxisNumSteps; i++) {
              px = this.xEnd-0.5;
              py = this.yStart+Math.floor(i*(this.yEnd-this.yStart)/this.GRAPH.yAxisNumSteps);
              this.context.moveTo(px, py+0.5);
              this.context.lineTo(px-this.GRAPH.yAxisMarkLength, py+0.5);

              this.context.lineWidth = this.GRAPH.yAxisLineWidth;
              this.context.strokeStyle = this.GRAPH.yAxisColor;
              this.context.stroke();
            }
          }
          break;
        case 3: 
          // left and right y axis
          this.context.beginPath();
          this.context.moveTo(this.xStart-0.5, this.yStart);
          this.context.lineTo(this.xStart-0.5, this.yEnd);

          this.context.lineWidth = this.GRAPH.yAxisLineWidth;
          this.context.strokeStyle = this.GRAPH.yAxisColor;
          this.context.stroke();

          // right y axis
          this.context.beginPath();
          this.context.moveTo(this.xEnd+0.5, this.yStart);
          this.context.lineTo(this.xEnd+0.5, this.yEnd);

          this.context.lineWidth = this.GRAPH.yAxisLineWidth;
          this.context.strokeStyle = this.GRAPH.yAxisColor;
          this.context.stroke();

          /* draw marks */
          if (this.GRAPH.drawYAxisMarks) {
            this.context.beginPath();
            for (var i = 1; i < this.GRAPH.yAxisNumSteps; i++) {
              px = this.xStart+0.5;
              py = this.yStart+Math.floor(i*(this.yEnd-this.yStart)/this.GRAPH.yAxisNumSteps);
              this.context.moveTo(px, py+0.5);
              this.context.lineTo(px+this.GRAPH.yAxisMarkLength, py+0.5);

              this.context.lineWidth = this.GRAPH.yAxisLineWidth;
              this.context.strokeStyle = this.GRAPH.yAxisColor;
              this.context.stroke();

              px = this.xEnd-0.5;
              py = this.yStart+Math.floor(i*(this.yEnd-this.yStart)/this.GRAPH.yAxisNumSteps);
              this.context.moveTo(px, py+0.5);
              this.context.lineTo(px-this.GRAPH.yAxisMarkLength, py+0.5);

              this.context.lineWidth = this.GRAPH.yAxisLineWidth;
              this.context.strokeStyle = this.GRAPH.yAxisColor;
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
     * Draws the x axis. This function uses this.GRAPH.drawXAxis:
     *   0: no axis is drawn
     *   1: bottom x axis is drawn
     *   2: top x axis is drawn
     *   3: both x axis are drawn
     */
    drawXAxis : function(start, end) {

      var px = 0,
        py = 0;

      this.context.save();

      switch (this.GRAPH.drawXAxis) {
        default:
        case 1:
          // bottom x axis
          this.context.beginPath();

          this.context.moveTo(this.xStart-0.5, this.yEnd+0.5);
          this.context.lineTo(this.xEnd+0.5, this.yEnd+0.5);

          this.context.lineWidth = this.GRAPH.xAxisLineWidth;
          this.context.strokeStyle = this.GRAPH.xAxisColor;
          this.context.stroke();

          /* draw marks */
          if (this.GRAPH.drawXAxisMarks) {
            this.context.beginPath();
            if (this.GRAPH.xAxisDatetimeAlignment) {
              // draw x grid lines at specific times (e.g. at 00:00)
              var current = new Date(start*1000),
                tsEnd = new Date(end*1000)

              var diff = end - start;
              var timeStep = computeTimeStep(diff);
              current.setTime( (parseInt(current.getTime()/1000) + timeStep 
                + (timeStep >= 86400 ? current.getTimezoneOffset()*60 : 0) 
                - parseInt(current.getTime()/1000) % timeStep)*1000);
              timeStep *= 1000;

              while (current < tsEnd) {

                px = this.xStart+Math.floor( (current.getTime()/1000 - start)*(this.xEnd - this.xStart)/(end-start) )+0.5;
                py = this.yEnd-0.5;
                this.context.moveTo(px, py);
                this.context.lineTo(px, py-this.GRAPH.xAxisMarkLength);

                this.context.lineWidth = this.GRAPH.yAxisLineWidth;
                this.context.strokeStyle = this.GRAPH.xAxisColor;
                this.context.stroke();

                // next round date time
                current.setTime(current.getTime() + timeStep);
              }
            } else {
              for (var i = this.GRAPH.xAxisNumSteps; i > 0; i--) {
                px = this.xStart+Math.floor(i*(this.xEnd-this.xStart)/this.GRAPH.xAxisNumSteps)+0.5;
                py = this.yEnd-0.5;
                this.context.moveTo(px, py);
                this.context.lineTo(px, py-this.GRAPH.xAxisMarkLength);

                this.context.lineWidth = this.GRAPH.yAxisLineWidth;
                this.context.strokeStyle = this.GRAPH.xAxisColor;
                this.context.stroke();
              }
            }
          }
          break;
        case 2:
          // top x axis
          this.context.beginPath();

          this.context.moveTo(this.xStart-0.5, this.yStart-0.5);
          this.context.lineTo(this.xEnd+0.5, this.yStart-0.5);

          this.context.lineWidth = this.GRAPH.xAxisLineWidth;
          this.context.strokeStyle = this.GRAPH.xAxisColor;
          this.context.stroke();

          /* draw marks */
          if (this.GRAPH.drawXAxisMarks) {
            this.context.beginPath();
            if (this.GRAPH.xAxisDatetimeAlignment) {
              // draw x grid lines at specific times (e.g. at 00:00)
              var current = new Date(start*1000),
                tsEnd = new Date(end*1000)

              var diff = end - start;
              var timeStep = computeTimeStep(diff);
              current.setTime( (parseInt(current.getTime()/1000) + timeStep 
                + (timeStep >= 86400 ? current.getTimezoneOffset()*60 : 0) 
                - parseInt(current.getTime()/1000) % timeStep)*1000);
              timeStep *= 1000;

              while (current < tsEnd) {

                px = this.xStart+Math.floor( (current.getTime()/1000 - start)*(this.xEnd - this.xStart)/(end-start) )+0.5;
                py = this.yStart+0.5;
                this.context.moveTo(px, py);
                this.context.lineTo(px, py+this.GRAPH.yAxisMarkLength);

                this.context.lineWidth = this.GRAPH.yAxisLineWidth;
                this.context.strokeStyle = this.GRAPH.xAxisColor;
                this.context.stroke();

                // next round date time
                current.setTime(current.getTime() + timeStep);
              }
            } else {
              for (var i = this.GRAPH.xAxisNumSteps; i > 0; i--) {
                px = this.xStart+Math.floor(i*(this.xEnd-this.xStart)/this.GRAPH.xAxisNumSteps)+0.5;
                py = this.yStart+0.5;
                this.context.moveTo(px, py);
                this.context.lineTo(px, py+this.GRAPH.yAxisMarkLength);

                this.context.lineWidth = this.GRAPH.yAxisLineWidth;
                this.context.strokeStyle = this.GRAPH.xAxisColor;
                this.context.stroke();
              }
            }
          }
          break;
        case 3:
          // bottom x axis
          this.context.beginPath();

          this.context.moveTo(this.xStart-0.5, this.yEnd+0.5);
          this.context.lineTo(this.xEnd+0.5, this.yEnd+0.5);

          this.context.lineWidth = this.GRAPH.xAxisLineWidth;
          this.context.strokeStyle = this.GRAPH.xAxisColor;
          this.context.stroke();

          // top x axis
          this.context.beginPath();

          this.context.moveTo(this.xStart-0.5, this.yStart-0.5);
          this.context.lineTo(this.xEnd+0.5, this.yStart-0.5);

          this.context.lineWidth = this.GRAPH.xAxisLineWidth;
          this.context.strokeStyle = this.GRAPH.xAxisColor;
          this.context.stroke();

          /* draw marks */
          if (this.GRAPH.drawXAxisMarks) {
            this.context.beginPath();
            if (this.GRAPH.xAxisDatetimeAlignment) {
              // draw x grid lines at specific times (e.g. at 00:00)
              var current = new Date(start*1000),
                tsEnd = new Date(end*1000)

              var diff = end - start;
              var timeStep = computeTimeStep(diff);
              current.setTime( (parseInt(current.getTime()/1000) + timeStep 
                + (timeStep >= 86400 ? current.getTimezoneOffset()*60 : 0) 
                - parseInt(current.getTime()/1000) % timeStep)*1000);
              timeStep *= 1000;

              while (current < tsEnd) {

                px = this.xStart+Math.floor( (current.getTime()/1000 - start)*(this.xEnd - this.xStart)/(end-start) )+0.5;
                py = this.yEnd-0.5;
                this.context.moveTo(px, py);
                this.context.lineTo(px, py-this.GRAPH.xAxisMarkLength);

                this.context.lineWidth = this.GRAPH.yAxisLineWidth;
                this.context.strokeStyle = this.GRAPH.xAxisColor;
                this.context.stroke();

                py = this.yStart+0.5;
                this.context.moveTo(px, py);
                this.context.lineTo(px, py+this.GRAPH.yAxisMarkLength);

                this.context.lineWidth = this.GRAPH.yAxisLineWidth;
                this.context.strokeStyle = this.GRAPH.xAxisColor;
                this.context.stroke();

                // next round date time
                current.setTime(current.getTime() + timeStep);
              }
            } else {
              for (var i = this.GRAPH.xAxisNumSteps; i > 0; i--) {
                px = this.xStart+Math.floor(i*(this.xEnd-this.xStart)/this.GRAPH.xAxisNumSteps)+0.5;
                py = this.yEnd-0.5;
                this.context.moveTo(px, py);
                this.context.lineTo(px, py-this.GRAPH.xAxisMarkLength);

                this.context.lineWidth = this.GRAPH.yAxisLineWidth;
                this.context.strokeStyle = this.GRAPH.xAxisColor;
                this.context.stroke();

                py = this.yStart+0.5;
                this.context.moveTo(px, py);
                this.context.lineTo(px, py+this.GRAPH.yAxisMarkLength);

                this.context.lineWidth = this.GRAPH.yAxisLineWidth;
                this.context.strokeStyle = this.GRAPH.xAxisColor;
                this.context.stroke();
              }
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
    drawAxis : function(yMin, yMax, xMin, xMax) {

      if (this.GRAPH.drawYAxis) {
        this.drawYAxis(yMin, yMax);
      }

      /* draw y axis only one time */
      this.GRAPH.drawYAxis = false;

      if (this.GRAPH.drawXAxis) {
        this.drawXAxis(xMin, xMax); 
      }

      /* draw x axis only one time */
      this.GRAPH.drawXAxis = false;

      if (this.GRAPH.drawPolarAxis) {
        this.drawPolarAxis();
      }
      
      /* draw ploar axis only one time */
      this.GRAPH.drawPolarAxis = false;

      return this;

    },

    drawYGrid : function(start, end) {

      var drawed = 0,
        yPos = 0,
        xPos = 0,
        k = 0;

      if (this.GRAPH.drawGrid) {

        this.context.save();

        this.context.translate(this.xStart, this.yStart);

        this.context.beginPath();

        switch (this.GRAPH.yAxisScale) {
          case 'log':
          case 'logarithmic':

            var a = Math.floor(this.yMin),
              b = Math.pow(this.GRAPH.yAxisLogBase, a),
              c = Math.pow(this.GRAPH.yAxisLogBase, this.yMax),
              num, i = 1;

            while (b < c) {
              b = i*Math.pow(this.GRAPH.yAxisLogBase, a);
              num = log(b, this.GRAPH.yAxisLogBase);

              yPos = Math.floor((this.yEnd-this.yStart)*(1-(num-this.yMin)/(this.yMax-this.yMin)));

              if (yPos <= this.yEnd-this.yStart) {

                drawed = 0;
                this.context.moveTo(this.xStart, yPos);
                k = 0;

                while (drawed < (this.xEnd-this.xStart)) {
                  /* Move from left to right */
                  switch (k%2) {
                    case 0:
                      drawed = ((this.xEnd-this.xStart)-drawed < this.GRAPH.xGridSpaceLength) ? (this.xEnd-this.xStart) : drawed+this.GRAPH.xGridSpaceLength;
                      this.context.moveTo((this.xEnd-this.xStart)-drawed, yPos+0.5);
                      break;
                    case 1:
                      drawed = ((this.xEnd-this.xStart)-drawed < this.GRAPH.xGridLineLength) ? (this.xEnd-this.xStart) : drawed+this.GRAPH.xGridLineLength;
                      this.context.lineTo((this.xEnd-this.xStart)-drawed, yPos+0.5);
                      break;
                  }
                  k++;
                }
              }

              if (i%this.GRAPH.yAxisLogBase == 0) {
                a++;
                i = 1;
              } else {
                i++
              }
            }

            break;
          case 'lin':
          case 'linear':
          default:
            for (var i = 1; i <= this.GRAPH.yGridNumLines-1; i++) {

              yPos = Math.floor(i*(this.yEnd-this.yStart)/this.GRAPH.yGridNumLines);
              drawed = 0;
              this.context.moveTo(this.xStart, yPos);
              k = 0;

              while (drawed < (this.xEnd-this.xStart)) {
                /* Move from left to right */
                switch (k%2) {
                  case 0:
                    drawed = ((this.xEnd-this.xStart)-drawed < this.GRAPH.xGridSpaceLength) ? (this.xEnd-this.xStart) : drawed+this.GRAPH.xGridSpaceLength;
                    this.context.moveTo((this.xEnd-this.xStart)-drawed, yPos+0.5);
                    break;
                  case 1:
                    drawed = ((this.xEnd-this.xStart)-drawed < this.GRAPH.xGridLineLength) ? (this.xEnd-this.xStart) : drawed+this.GRAPH.xGridLineLength;
                    this.context.lineTo((this.xEnd-this.xStart)-drawed, yPos+0.5);
                    break;
                }
                k++;
              }
            }
            break;
        }

        this.context.strokeStyle = this.GRAPH.yGridLineColor;
        this.context.stroke();
        this.context.restore();
      }

      this.GRAPH.drawPolarGrid = false;

      return this;
    },
    
    drawXGrid : function(start, end) {

      var drawed = 0,
        yPos = 0,
        xPos = 0,
        k = 0;

      if (this.GRAPH.drawGrid) {

        this.context.save();

        this.context.translate(this.xStart, this.yStart);

        this.context.beginPath();

        switch (this.GRAPH.xAxisScale) {
          case 'log':
          case 'logarithmic':
            var a = Math.floor(this.xMin),
              b = Math.pow(this.GRAPH.xAxisLogBase, a),
              c = Math.pow(this.GRAPH.xAxisLogBase, this.xMax),
              num, i = 1;

            while (b < c) {
              b = i*Math.pow(this.GRAPH.xAxisLogBase, a);
              num = log(b, this.GRAPH.xAxisLogBase);

              xPos = Math.floor((this.xEnd-this.xStart)*(num-this.xMin)/(this.xMax-this.xMin));

              if (this.xMin <= num && num <= this.xMax) {

                drawed = 0;
                this.context.moveTo(xPos, (this.yEnd-this.yStart));
                k = 0;

                while (drawed < (this.yEnd-this.yStart)) {
                  /* Move from bottom to top */
                  switch (k%2) {
                    case 0:
                      drawed = ((this.yEnd-this.yStart)-drawed < this.GRAPH.yGridSpaceLength) ? (this.yEnd-this.yStart) : drawed+this.GRAPH.yGridSpaceLength;
                      this.context.moveTo(xPos+0.5, (this.yEnd-this.yStart)-drawed);
                      break;
                    case 1:
                      drawed = ((this.yEnd-this.yStart)-drawed < this.GRAPH.yGridLineLength) ? (this.yEnd-this.yStart) : drawed+this.GRAPH.yGridLineLength;
                      this.context.lineTo(xPos+0.5, (this.yEnd-this.yStart)-drawed);
                      break;
                  }
                  k++;
                }
              }

              if (i%this.GRAPH.xAxisLogBase == 0) {
                a++;
                i = 1;
              } else {
                i++
              }
            }

            break;
          case 'lin':
          case 'linear':
          default:
            if (this.GRAPH.xAxisDatetimeAlignment) {
              // draw x grid lines at specific times (e.g. at 00:00)
              var current = new Date(start*1000),
                tsEnd = new Date(end*1000)

              var diff = end - start;
              var timeStep = computeTimeStep(diff);
              current.setTime( (parseInt(current.getTime()/1000) + timeStep 
                + (timeStep >= 86400 ? current.getTimezoneOffset()*60 : 0) 
                - parseInt(current.getTime()/1000) % timeStep)*1000);
              timeStep *= 1000;

              while (current < tsEnd) {

                xPos = Math.floor( (current.getTime()/1000 - start)*(this.xEnd - this.xStart)/(end-start) );
                drawed = 0;
                this.context.moveTo(xPos, (this.yEnd-this.yStart));
                k = 0;

                while (drawed < (this.yEnd-this.yStart)) {
                  // Move from bottom to top
                  switch (k%2) {
                    case 0:
                      drawed = ((this.yEnd-this.yStart)-drawed < this.GRAPH.yGridSpaceLength) ? (this.yEnd-this.yStart) : drawed+this.GRAPH.yGridSpaceLength;
                      this.context.moveTo(xPos+0.5, (this.yEnd-this.yStart)-drawed);
                      break;
                    case 1:
                      drawed = ((this.yEnd-this.yStart)-drawed < this.GRAPH.yGridLineLength) ? (this.yEnd-this.yStart) : drawed+this.GRAPH.yGridLineLength;
                      this.context.lineTo(xPos+0.5, (this.yEnd-this.yStart)-drawed);
                      break;
                  }
                  k++;
                }

                // next round date time
                current.setTime(current.getTime() + timeStep);
              }
            } else {
              for (var i = 1; i <= this.GRAPH.xGridNumLines-1; i++) {

                xPos = Math.floor(i*(this.xEnd-this.xStart)/this.GRAPH.xGridNumLines);
                drawed = 0;
                this.context.moveTo(xPos, (this.yEnd-this.yStart));
                k = 0;

                while (drawed < (this.yEnd-this.yStart)) {
                  // Move from bottom to top
                  switch (k%2) {
                    case 0:
                      drawed = ((this.yEnd-this.yStart)-drawed < this.GRAPH.yGridSpaceLength) ? (this.yEnd-this.yStart) : drawed+this.GRAPH.yGridSpaceLength;
                      this.context.moveTo(xPos+0.5, (this.yEnd-this.yStart)-drawed);
                      break;
                    case 1:
                      drawed = ((this.yEnd-this.yStart)-drawed < this.GRAPH.yGridLineLength) ? (this.yEnd-this.yStart) : drawed+this.GRAPH.yGridLineLength;
                      this.context.lineTo(xPos+0.5, (this.yEnd-this.yStart)-drawed);
                      break;
                  }
                k++;
                }
              }
            }
            break;
        }

        this.context.strokeStyle = this.GRAPH.xGridLineColor;
        this.context.stroke();
        this.context.restore();
      }

      return this;
    },

    /*
     * Draws the grid using the specified options
     */
    drawGrid : function(yStart, yEnd, xStart, xEnd) {

      if (this.GRAPH.drawGrid) {
        this.drawXGrid(xStart, xEnd);
        this.drawYGrid(yStart, yEnd);
      }

      this.GRAPH.drawGrid = false;

      if (this.GRAPH.drawPolarGrid) {
        this.drawPolarGrid();
      }

      return this;

    },

    drawPolarAxis : function() {

      var alpha = 0,
        beta = Math.atan2(this.yEnd-this.yStart,this.xEnd-this.xStart),
        text = "";

      var px, py, rad, npx, npy;

      if (this.GRAPH.drawPolarAxis) {

        this.context.save();

        this.context.translate(
          this.xStart+(this.xEnd-this.xStart)/2, 
          this.yStart+(this.yEnd-this.yStart)/2);

        rad = this.GRAPH.polarAxisMargin*Math.min(
          (this.xEnd-this.xStart)/2, 
          (this.yEnd-this.yStart)/2);

        this.context.beginPath();
        this.context.arc(0, 0, rad, 0, Math.PI*2, false);

        this.context.strokeStyle = this.GRAPH.polarAxisColor;
        this.context.stroke();

        for (var alpha = 0; alpha < Math.PI*2; alpha += Math.PI*2/this.GRAPH.polarGridNumLines) {

          px = this.xMax;
          py = this.yMax;

          if (0 <= alpha && alpha < Math.PI/4) {
            px *= (this.xEnd-this.xStart)/(this.xMax-this.xMin);
            py *= Math.tan(alpha)*(this.yEnd-this.yStart)/(this.yMax-this.yMin);
            npx = rad*Math.sqrt(1/(1+Math.pow((py/px), 2)));
            npy = rad*Math.abs(py/px)*Math.sqrt(1/(1+Math.pow((py/px), 2)));
          } else if (Math.PI/4 <= alpha && alpha <= 3*Math.PI/4) {
            px *= Math.tan(Math.PI/2-alpha)*(this.xEnd-this.xStart)/(this.xMax-this.xMin);
            py *= -(this.yEnd-this.yStart)/(this.yMax-this.yMin);
            if (px == 0) {
              px = 1e-16;
            }
            if (alpha < Math.PI/2) {
              npx = rad*Math.sqrt(1/(1+Math.pow((py/px), 2)));
              npy = rad*Math.abs(py/px)*Math.sqrt(1/(1+Math.pow((py/px), 2)));
            } else {
              npx = -rad*Math.sqrt(1/(1+Math.pow((py/px), 2)));
              npy = rad*Math.abs(py/px)*Math.sqrt(1/(1+Math.pow((py/px), 2)));
            }
          } else if (3*Math.PI/4 <= alpha && alpha <= 5*Math.PI/4) {
            px *= -(this.xEnd-this.xStart)/(this.xMax-this.xMin);
            py *= Math.tan(Math.PI-alpha)*(this.yEnd-this.yStart)/(this.yMax-this.yMin);
            if (alpha < Math.PI) {
              npx = -rad*Math.sqrt(1/(1+Math.pow((py/px), 2)));
              npy = rad*Math.abs(py/px)*Math.sqrt(1/(1+Math.pow((py/px), 2)));
            } else {
              npx = -rad*Math.sqrt(1/(1+Math.pow((py/px), 2)));
              npy = -rad*Math.abs(py/px)*Math.sqrt(1/(1+Math.pow((py/px), 2)));
            }
          } else if (5*Math.PI/4 <= alpha && alpha <= 7*Math.PI/4) {
            px *= Math.tan(3*Math.PI/2-alpha)*(this.xEnd-this.xStart)/(this.xMax-this.xMin); 
            py *= (this.yEnd-this.yStart)/(this.yMax-this.yMin);
            if (px == 0) {
              px = 1e-16;
            }
            if (alpha < Math.PI*3/2) {
              npx = -rad*Math.sqrt(1/(1+Math.pow((py/px), 2)));
              npy = -rad*Math.abs(py/px)*Math.sqrt(1/(1+Math.pow((py/px), 2)));
            } else {
              npx = rad*Math.sqrt(1/(1+Math.pow((py/px), 2)));
              npy = -rad*Math.abs(py/px)*Math.sqrt(1/(1+Math.pow((py/px), 2)));
            }
          } else {
            px *= (this.xEnd-this.xStart)/(this.xMax-this.xMin);
            py *= Math.tan(alpha)*(this.yEnd-this.yStart)/(this.yMax-this.yMin);
            npx = rad*Math.sqrt(1/(1+Math.pow((py/px), 2)));
            npy = -rad*Math.abs(py/px)*Math.sqrt(1/(1+Math.pow((py/px), 2)));
          }

          if (0 <= alpha && alpha <= Math.PI/2) {
            this.context.textAlign = "left";
            this.context.textBaseline = "top";
          } else if (Math.PI/2 < alpha && alpha <= Math.PI) {
            this.context.textAlign = "right";
            this.context.textBaseline = "top";
          } else if (Math.PI < alpha && alpha <= Math.PI*3/2) {
            this.context.textAlign = "right";
            this.context.textBaseline = "bottom";
          } else {
            this.context.textAlign = "left";
            this.context.textBaseline = "bottom";
          }

          if (this.GRAPH.polarAxisNumFormat == "deg") {
            text = (360-alpha*180/Math.PI).toFixed(0)+" º";
          } else if (this.GRAPH.polarAxisNumFormat == "rad") {
            text = (2-alpha/Math.PI).toFixed(2)+" 𝜋";
          } else {
            text = (Math.PI*2-alpha).toFixed(2);
          }

          this.context.fillText(text, npx, npy);
        }

        this.context.restore();
      }

      return this;
    },

    /*
     * Draws a polar grid
     */
    drawPolarGrid : function drawPolarGrid() {

      var alpha = 0,
        beta = Math.atan2(this.yEnd-this.yStart,this.xEnd-this.xStart),
        h, 
        k, 
        drawLine = 0, 
        drawed = 0;

      var px, py;

      if (this.GRAPH.drawPolarGrid) {

        this.context.save();

        this.context.translate(
          this.xStart+(this.xEnd-this.xStart)/2, 
          this.yStart+(this.yEnd-this.yStart)/2);

        for (var alpha = 0; alpha <= Math.PI*2; alpha += Math.PI*2/this.GRAPH.polarGridNumLines) {

          if (0 <= alpha && alpha < Math.PI/4) {
            px = (this.xEnd-this.xStart)/(this.xMax-this.xMin);
            py = Math.tan(alpha)*(this.yEnd-this.yStart)/(this.yMax-this.yMin);
          } else if (Math.PI/4 <= alpha && alpha <= 3*Math.PI/4) {
            px = Math.tan(Math.PI/2-alpha)*(this.xEnd-this.xStart)/(this.xMax-this.xMin);
            py = -(this.yEnd-this.yStart)/(this.yMax-this.yMin);
          } else if (3*Math.PI/4 <= alpha && alpha <= 5*Math.PI/4) {
            px = -(this.xEnd-this.xStart)/(this.xMax-this.xMin);
            py = Math.tan(Math.PI-alpha)*(this.yEnd-this.yStart)/(this.yMax-this.yMin);
          } else if (5*Math.PI/4 <= alpha && alpha <= 7*Math.PI/4) {
            px = Math.tan(3*Math.PI/2-alpha)*(this.xEnd-this.xStart)/(this.xMax-this.xMin); 
            py = (this.yEnd-this.yStart)/(this.yMax-this.yMin);
          } else {
            px = (this.xEnd-this.xStart)/(this.xMax-this.xMin);
            py = Math.tan(alpha)*(this.yEnd-this.yStart)/(this.yMax-this.yMin);
          }

          px *= this.xMax;
          py *= this.yMax;

          this.context.beginPath();
          this.context.moveTo(0, 0);
          
          this.context.lineTo(px, py);
          this.context.strokeStyle = "#ccc";
          this.context.stroke();

        }

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

      var number, rad = 0, px, py;

      if (this.GRAPH.drawXAxisNumbers) {

        this.context.save();

        this.context.textBaseline = this.GRAPH.xAxisTextBaseline;
        this.context.font = this.GRAPH.fontWeight+" "+this.GRAPH.fontSize+"px "+this.GRAPH.fontFamily;
        this.context.textAlign = this.GRAPH.xAxisTextAlign;

        if (this.GRAPH.xAxisTextRotate == 0) {
          rad = 0;
        } else if (Math.abs(this.GRAPH.xAxisTextRotate) < 90) {
          rad = this.GRAPH.xAxisTextRotate*Math.PI/180;
        } else {
          rad = -Math.PI+this.GRAPH.xAxisTextRotate*Math.PI/180;
        }

        switch (this.GRAPH.xAxisScale) {
          case 'log':
          case 'logarithm':
            for (var i = 0; i <= this.GRAPH.xAxisNumSteps; i++) {
              number = Math.pow(this.GRAPH.xAxisLogBase, (start+i*(end-start)/this.GRAPH.xAxisNumSteps)
                  .toFixed(this.GRAPH.xAxisNumDecimals));

              if (this.GRAPH.xAxisDatetimeFormat != "") {
                number = parseDate(number, this.GRAPH.xAxisDatetimeFormat);
              }

              px = this.xStart+i*(this.xEnd-this.xStart)/this.GRAPH.xAxisNumSteps;
              py = this.yEnd+3;

              this.context.translate(px, py);
              this.context.rotate(rad);
              this.context.fillText(number.toPrecision(4), 0, 0);
              this.context.rotate(-rad);
              this.context.translate(-px, -py);
            }
            break;
          case 'lin':
          case 'linear':
          default:

            if (this.GRAPH.xAxisDatetimeAlignment) {
              // draw tic labels at specific times (e.g. at 00:00)
              var current = new Date(start*1000),
                tsEnd = new Date(end*1000)

              var diff = end - start;
              var timeStep = computeTimeStep(diff);
              current.setTime( (parseInt(current.getTime()/1000) + timeStep 
                + (timeStep >= 86400 ? current.getTimezoneOffset()*60 : 0) 
                - parseInt(current.getTime()/1000) % timeStep)*1000);
              timeStep *= 1000;

              while (current < tsEnd) {

                number = parseDate(current.getTime()/1000, this.GRAPH.xAxisDatetimeFormat);

                px = this.xStart + (current.getTime()/1000 - start)*(this.xEnd - this.xStart)/(end-start);
                py = this.yEnd+3;

                this.context.translate(px, py);
                this.context.rotate(rad);
                this.context.fillText(number, 0, 0);
                this.context.rotate(-rad);
                this.context.translate(-px, -py);

                // next round date time
                current.setTime(current.getTime() + timeStep);
              }
            } else {

              for (var i = 0; i <= this.GRAPH.xAxisNumSteps; i++) {
                number = (start+i*(end-start)/this.GRAPH.xAxisNumSteps)
                  .toFixed(this.GRAPH.xAxisNumDecimals);

                if (this.GRAPH.xAxisDatetimeFormat != "") {
                  number = parseDate(number, this.GRAPH.xAxisDatetimeFormat);
                }
                px = this.xStart+i*(this.xEnd-this.xStart)/this.GRAPH.xAxisNumSteps;
                py = this.yEnd+3;

                this.context.translate(px, py);
                this.context.rotate(rad);
                this.context.fillText(number, 0, 0);
                this.context.rotate(-rad);
                this.context.translate(-px, -py);
              }
            }
            break;
        }

        this.context.restore();
      }

      /* Disable redrawing again the axis numbers. The first plot will set the scale */
      this.GRAPH.drawXAxisNumbers = false;

      return this;

    },

    /*
     * Draws the left side y axis numbers
     * @param {start} number (the lowest number for the y axis)
     * @param {end} number (the highest number for the y axis)
     */
    drawYAxisNumbers : function(start, end) {

      var number;

      if (this.GRAPH.drawYAxisNumbers) {
        this.context.save();

        this.context.textBaseline = this.GRAPH.yAxisTextBaseline;
        this.context.font = this.GRAPH.fontWeight+" "+this.GRAPH.fontSize+"px "+this.GRAPH.fontFamily;
        this.context.textAlign = this.GRAPH.yAxisTextAlign;

        switch (this.GRAPH.yAxisScale) {
          case 'log':
          case 'logarithm':
            for (var i = 0; i <= this.GRAPH.yAxisNumSteps; i++) {
              number = Math.pow(this.GRAPH.yAxisLogBase, (end-i*(end-start)/this.GRAPH.yAxisNumSteps)
                  .toFixed(this.GRAPH.yAxisNumDecimals));

              if (this.GRAPH.yAxisDatetimeFormat != "") {
                number = parseDate(number, this.GRAPH.yAxisDatetimeFormat);
              }

              this.context.fillText(number.toPrecision(4), 
                this.xStart-5 /* 3px right margin from axis */, 
                this.yStart+i*(this.yEnd-this.yStart)/this.GRAPH.yAxisNumSteps);
            }
            break;
          case 'lin':
          case 'linear':
          default:
            for (var i = 0; i <= this.GRAPH.yAxisNumSteps; i++) {
              number = (end-i*(end-start)/this.GRAPH.yAxisNumSteps)
                  .toFixed(this.GRAPH.yAxisNumDecimals);

              if (this.GRAPH.yAxisDatetimeFormat != "") {
                number = parseDate(number, this.GRAPH.yAxisDatetimeFormat);
              }

              this.context.fillText(number, 
                this.xStart-5 /* 3px right margin from axis */, 
                this.yStart+i*(this.yEnd-this.yStart)/this.GRAPH.yAxisNumSteps);
            }
            break;
        }

        this.context.restore();
      }

      /* Disable redrawing again the axis numbers. The first plot will set the scale */
      this.GRAPH.drawYAxisNumbers = false;

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

      if (this.GRAPH.barLabelRotate == 0) {
        this.context.textAlign = "center";
      } else if (Math.abs(this.GRAPH.barLabelRotate) < 90) {
        this.context.textAlign = "left";
        rad = this.GRAPH.barLabelRotate*Math.PI/180;
      } else {
        this.context.textAlign = "right";
        rad = -Math.PI+this.GRAPH.barLabelRotate*Math.PI/180;
      }

      var m = 1;

      if (this.yEnd-this.yStart < labels.length*8) {
        // Labels do not fit!
        // This 10/250 constant has been calculated by trial and error
        m = Math.floor(labels.length*10/250);
      }

      for (var i = 0, len = labels.length; i < len; i+=m) {
        this.context.save();

        px = this.xStart+i*(this.xEnd-this.xStart)/len+(this.xEnd-this.xStart)/len/2;
        py = this.yEnd+this.GRAPH.fontSize+3;

        this.context.translate(px, py);
        this.context.font = this.GRAPH.fontWeight+" "+this.GRAPH.fontSize+"px "+this.GRAPH.fontFamily;
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

      if (this.GRAPH.drawTitle) {

        this.context.save();

        this.context.textAlign = "center";
        this.context.font = this.GRAPH.titleFontWeight+" "+this.GRAPH.titleFontSize+"px "+this.GRAPH.fontFamily;

        px = Math.floor(this.xStart + (this.xEnd-this.xStart)/2);
        py = Math.floor((1-this.GRAPH.xAxisBottomMargin)*this.canvas.height/2);

        this.context.fillText((title ? title : this.GRAPH.title), px, py);

        this.context.restore();
      }

      this.GRAPH.drawTitle = false;

      return this;
    },

    drawXAxisTitle : function(title) {

      var px = 0,
        py = 0;

      if (this.GRAPH.drawXAxisTitle) {

        this.context.save();

        this.context.textBaseline = "middle";
        this.context.textAlign = "center";
        this.context.font = this.GRAPH.fontWeight+" "+this.GRAPH.fontSize+"px "+this.GRAPH.fontFamily;

        px = this.xStart + (this.xEnd-this.xStart)/2;
        py = this.canvas.height - 
          (1-this.GRAPH.xAxisTopMargin)*this.canvas.height/2
          + this.GRAPH.fontSize; // top margin for x axis title

        this.context.fillText((title ? title : this.GRAPH.xAxisTitle), px, py);

        this.context.restore(); 
      }

      this.GRAPH.drawXAxisTitle = false;

      return this;
    },

    drawYAxisTitle : function(title) {

      var px = 0,
        py = 0;

      if (this.GRAPH.drawYAxisTitle) {

        this.context.save();

        this.context.textBaseline = "middle";
        this.context.textAlign = "center";
        this.context.font = this.GRAPH.fontWeight+" "+this.GRAPH.fontSize+"px "+this.GRAPH.fontFamily;

        px = this.GRAPH.yAxisLeftMargin*this.canvas.width/3;
        py = this.yStart+(this.yEnd-this.yStart)/2;

        this.context.translate(px, py);
        this.context.rotate(-Math.PI/2);
        this.context.fillText((title ? title : this.GRAPH.yAxisTitle), 0, 0);

        this.context.restore(); 
      }

      this.GRAPH.drawYAxisTitle = false;

      return this;
    },

    set : function(options) {

      var haystack = [];

      for (var elem in this.GRAPH) {
        haystack.push(elem);
      }

      if (options instanceof Object) {
        for (var elem in options) {
          if (inArray(elem, haystack)) {
            this.GRAPH[elem] = options[elem];
          }
        }
      }

      /* Start and end points of the graph area */
      this.xStart = Math.floor(this.GRAPH.yAxisLeftMargin*this.canvas.width);
      this.xEnd = Math.floor((1-this.GRAPH.yAxisRightMargin)*this.canvas.width);
      this.yStart = Math.floor((1-this.GRAPH.xAxisTopMargin)*this.canvas.height);
      this.yEnd = Math.floor(this.GRAPH.xAxisBottomMargin*this.canvas.height);

      return this;
    },

    /*
     * Removes everything from the canvas
     */
    clear : function(options) {

      this.GRAPH.colorIndex = 0;
      this.GRAPH.pointColorIndex = 0;
      this.GRAPH.drawYAxis = 3;
      this.GRAPH.drawYAxisNumbers = true;
      this.GRAPH.drawYAxisTitle = true;
      this.GRAPH.drawXAxis = 3;
      this.GRAPH.drawXAxisNumbers = true;
      this.GRAPH.drawXAxisTitle = true;
      this.GRAPH.drawGrid = true;
      this.GRAPH.drawTitle = true;

      this.yMax = 0;
      this.yMin = 0;
      this.xMax = 0;
      this.xMin = 0;

      if (options instanceof Object) {
        for (var elem in options) {
          if (this.GRAPH[elem] != null) {

            if (elem == "canvasWidth") {
              this.canvas.setAttribute("width", options[elem]);
            }

            if (elem == "canvasHeight") {
              this.canvas.setAttribute("height", options[elem]);
            }

            this.GRAPH[elem] = options[elem];

          }
        }
      }

      /* Start and end points of the graph area */
      this.xStart = Math.floor(this.GRAPH.yAxisLeftMargin*this.canvas.width);
      this.xEnd = Math.floor((1-this.GRAPH.yAxisRightMargin)*this.canvas.width);
      this.yStart = Math.floor((1-this.GRAPH.xAxisTopMargin)*this.canvas.height);
      this.yEnd = Math.floor(this.GRAPH.xAxisBottomMargin*this.canvas.height);

      this.numberOfGraphs = 0;

      this.context.save();

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.context.restore();

      return this;
    },

    toImage : function(mime) {

      var image = new Image();

      image.src = this.canvas.toDataURL(mime ? mime : "image/png");

      return image;
    },

    getCoordinates : function(x, y) {
      var yOffset = 0, 
        xOffset = 0,
        px, py, r , t;

      x -= xOffset;
      y -= yOffset;

      switch (this.GRAPH.yAxisScale) {
        case 'log':
        case 'logarithm':
          py = Math.pow(this.GRAPH.yAxisLogBase, 
            this.yMin+(this.yMax-this.yMin)*(y-this.yEnd)/(this.yStart-this.yEnd));
          break;
        case 'lin':
        case 'linear':
        default:
          py = this.yMin+(this.yMax-this.yMin)*(y-this.yEnd)/(this.yStart-this.yEnd);
          break;
      }

      switch (this.GRAPH.xAxisScale) {
        case 'log':
        case 'logarithm':
          px = Math.pow(this.GRAPH.xAxisLogBase,
            this.xMin+(this.xMax-this.xMin)*(x-this.xStart)/(this.xEnd-this.xStart));
          break;
        case 'lin':
        case 'linear':
        default:
          px = this.xMin+(this.xMax-this.xMin)*(x-this.xStart)/(this.xEnd-this.xStart);
          break;
      }

      r = Math.sqrt(Math.pow(px, 2)+Math.pow(py, 2));
      t = Math.atan2(py, px)*180/Math.PI;

      return [px, py, r, t];
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
 * | yMax |           |                                                  A           |<-->|              |
 * |      |           |                                                  |           |  yAxisRightMargin |
 * |      |           |                                                  |           |    |   (%)        |
 * |      |           | xAxisTopMargin (%)                               |           |    |              |
 * |<---->|           |                                                  |           |    |              |
 * | yAxisLeftMargin  |                                                  |           |    |              |
 * |      |(%)        |                                                  |           |    |              |
 * |      |           |                                                  |           |    |              |
 * |      |           |                   this.GRAPHING AREA             |           |    |        canvas height
 * |      |           |                                                  |           |    |              |
 * |      |           |                                                  |           |    |              |
 * |      |           |                                                  |           |    |              |
 * |      |           |                                                  |           |    |              |
 * |      |           |                            xAxisBottomMargin (%) |           |    |              |
 * |      |           |                                                  |           |    |              |
 * |      |           |                                                  |           |    |              |
 * | yMin |___________V__________________________________________________|___________|    |              |
 * |            xMin                                                     |       xMax     |              |
 * |_____________________________________________________________________V________________|              V
 *
 * <------------------------------------ canvas width ------------------------------------>
 */
