function blockToTime(num){
    var b = blockTimeArray;


    var bf, bl;
    if(num < b[0][0]){
        bf = b[0];
        bl = b[1];
    }
    else if(num >= b[b.length-1][0]){
       bf = b[b.length-2];
       bl = b[b.length-1];
    }
    else{
       var n = (num - b[0][0]) / 1000;
       n = Math.floor(n);
       bf = b[n];
       bl = b[n+1];
    }
    

    var distance = 1000;
    var tdiff = bl[1] - bf[1];
    var factor = (num - bf[0])/distance;

    var t = factor * tdiff + bf[1];


    date = new Date(t * 1000);

    return date;
}

function getBarOpacity(range, time){

    var t1, t2;
    if(!time){
        t1 = blockToTime(range[0]).getTime();
        t2 = blockToTime(range[1]).getTime();
    }
    else{
        t1 = range[0].getTime();
        t2 = range[1].getTime();
    }
    
    var days = (t2-t1)/(1000*60*60*24);
    
    if(days > 3)return 1;
    if(days >1)return ((days-1)*0.5);
    return 0;

}

function get10AMIntervals(start, stop, interval){
    if(interval === undefined) interval = 24;
    var d = d3.time.hours.utc(new Date(start.getTime() - (1000*60*60*9)), new Date(stop.getTime() - (1000*60*60*9)), interval);

    d.forEach(function(e, i, h){
        h[i].setUTCHours(e.getUTCHours() + 9);
        if(h[i].getTime() > stop.getTime()){
            h[i] = new Date(h[0].getTime());
            h[i].setUTCHours(h[i].getUTCHours() - interval);

        }
    });

    return d;
}
function getNHIntervals(interval){
    return function(a,b){return get10AMIntervals(a, b, interval);}
}
function getDIntervals(start, stop, interval){
    if(interval === undefined || interval <= 0) interval = 1;
    console.log(interval);
    
    
    
    var d = [];
    var s = start;
    s.setUTCMinutes(0);
    s.setUTCSeconds(0);
    s.setUTCMilliseconds(0);
    
    if(s.getHours >= 9){
      s.getUTCDate(s.getUTCDate() + 1);
    }
    s.setUTCHours(9);
    
    console.log(s, stop);
    
    while(s.getTime() <= stop.getTime()){
      d.push(new Date(s));
      s.setUTCDate(s.getUTCDate() + interval);
    }
    
    console.log(d);
    
    return d;
    

    /*var d = d3.time.days.utc(new Date(start.getTime() - (1000*60*60*9)), new Date(stop.getTime() - (1000*60*60*9)), interval);
    d.forEach(function(e, i, h){
        h[i].setUTCHours(e.getUTCHours() + 9);

        if(h[i].getTime() > stop.getTime()){
            h[i] = new Date(h[0].getTime());
            h[i].setUTCDate(h[i].getUTCDate() - interval);
        }
    });*/

    //return d;

}

function getNDIntervals(interval){
    return function(a,b){return getDIntervals(a, b, interval);}
}

function getXRatio(range, width){
    var diff = Math.floor((range[1].getTime() - range[0].getTime())/1000)
    var r = diff/width; //Seconds per pixel

    return r;
}

var month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";

  
function bindTooltip(lines, overlay, format){
    var self = this;
    var line0data = lines[0][2];
    
    var l = function(){
        self.tooltip.style("opacity", 0);
        self.svgMarkerLineX.style("visibility", "hidden");
        self.svgMarkerLineY.style("visibility", "hidden");
    }
    
    var m = function(){
    
        coordinates = d3.mouse(this);
        var x = coordinates[0];
        var y = coordinates[1];
        
        var s = self.x.invert(x);
        
        var i = binaryIndexOf.call(line0data, s, self.xAxisMode);
        
        if(i >= line0data.length){
          l();
          return;
        }

        var trueY = self.y(line0data[i].y);
        
        var rect = self.tooltip.style("opacity", 1).html("")
            .append("rect")
        
        
        for(var j=0; j<lines.length; j++){
          var text;
          if (format === undefined){
            text = lines[j][1] + ": " + Number(lines[j][2][i].y).toLocaleString();
          }
          else text = lines[j][1] + ": " + format(lines[j][2][i].y);
          self.tooltip.append("text")
              .attr("y", 85 + j*20)
              .attr("x", 10)
              .text(text)
              //.node().getBBox().width + 20;
        }
        var ttW = 180;
        var ttH = 80 + lines.length*20;
        
        
        rect.attr("width", ttW)
            .attr("height", ttH);
            
        self.tooltip.append("text")
            .attr("y", 65)
            .attr("x", 10)
            .text("Block: " + Number(line0data[i].xNum).toLocaleString());
        
        var date = line0data[i].xTime;
        var day = date.getUTCDate();
        var monthIdx = date.getUTCMonth();
        var year = date.getUTCFullYear();
        var hour = padTime(date.getUTCHours());
        var mins = padTime(date.getUTCMinutes());
        
        self.tooltip.append("text")
            .attr("y", 20)
            .attr("x", ttW/2)
            .attr("text-anchor", "middle")
            .text(day + " " + month[monthIdx] + " " + year)
            
        self.tooltip.append("text")
            .attr("y", 40)
            .attr("x", ttW/2)
            .attr("text-anchor", "middle")
            .text(hour + ":" + mins);
            
        
        self.svgMarkerLineX.style("visibility", "visible");
        self.svgMarkerLineY.style("visibility", "visible");
            
        self.svgMarkerLineY
            .attr("x1", x)
            .attr("y1", 0)
            .attr("x2", x)
            .attr("y2", self.height);
        
        if(lines.length == 1){
        self.svgMarkerLineX
            .attr("x1", 0)
            .attr("y1", trueY)
            .attr("x2", self.width)
            .attr("y2", trueY);
        }
    }
    
    for(var i = 0; i<lines.length; i++){
      lines[i][0].on("mousemove", m)
                 .on("mouseleave", l);
    }
    
    overlay.on("mousemove", m)
           .on("mouseleave", l);
}

function bindTooltipBar(){
    var self = this;
    return function(data){
        var bar = d3.select(this);
        
        var rect = self.tooltip.style("opacity", 1).html("")
            .append("rect")
        
        self.tooltip.append("text")
            .attr("y", 65)
            .attr("x", 10)
            .text("New Volume: " + Number(data.y).toLocaleString())
            //.node().getBBox().width + 20;
        var ttW = 180;
        var ttH = 80;
        
        
        rect.attr("width", ttW)
            .attr("height", ttH);
            
        self.tooltip.append("text")
            .attr("y", 45)
            .attr("x", 10)
            .text("Block: " + Number(data.xNum).toLocaleString());
        
        var date = data.xTime;
        var day = date.getUTCDate();
        var monthIdx = date.getUTCMonth();
        var year = date.getUTCFullYear();
        var hour = padTime(date.getUTCHours());
        var mins = padTime(date.getUTCMinutes());
        
        self.tooltip.append("text")
            .attr("y", 20)
            .attr("x", ttW/2)
            .attr("text-anchor", "middle")
            .text(day + " " + month[monthIdx] + " " + year)
    
    
    };
}

function bindTooltipBarLeave(){
    var self = this;
    return function(){
        self.tooltip.style("opacity", 0);
        self.svgMarkerLineX.style("visibility", "hidden");
        self.svgMarkerLineY.style("visibility", "hidden");
    };
}

function adjustAxisLabels(axis, range, width){

    var r = getXRatio(range, width);

    var n = Math.floor(width/100);

    if (r < 15){
        axis.ticks(function(a,b){return d3.time.minutes.utc(a, b, 30)})
            .tickFormat(d3.time.format.utc("%b %d %H:%M"))
    }
    else if (r < 30){
        axis.ticks(d3.time.hours)
            .tickFormat(d3.time.format.utc("%b %d %H:%M"))
    }
    else if (r < 60){
        axis.ticks(getNHIntervals(2))
            .tickFormat(d3.time.format.utc("%b %d %H:%M"))
    }
    else if (r < 120){
        axis.ticks(function(a,b){return d3.time.hours.utc(a, b, 3)})
            .tickFormat(d3.time.format.utc("%b %d %H:%M"))
    }
    else if (r < 240){
        axis.ticks(getNHIntervals(6))
            .tickFormat(d3.time.format.utc("%b %d %H:%M"))
    }
    else if (r < 360){
        axis.ticks(getNHIntervals(12))
            .tickFormat(d3.time.format.utc("%b %d %H:%M"))
    }
    else if (r < 720){
        axis.ticks(get10AMIntervals)
            .tickFormat(d3.time.format.utc("%b %d %H:%M"))
    }
    else{
        var i = Math.ceil(r/720);
        axis.ticks(getNDIntervals(i))
            .tickFormat(d3.time.format.utc("%b %d %H:%M"))
    }


}

function getBoundaries(data){


    var bStart = data[0].xNum;
    var bEnd = data[data.length-1].xNum;
    var volMin = data[0].y;
    var volMax = data[0].y;
    for(var i=0; i<data.length; i++){
        v = data[i].y;
        if(v > volMax) volMax = v;
        else if(v < volMin) volMin = v;
    }

    return {x: [bStart, bEnd],
            y: [volMin, volMax]};

}

function plotGraph(id, lines, dd, xLabel, yLabel, yTick, options){
    var self = this;

    if (options === undefined) options = {};
    if (options.yDomainMod === undefined) options.yDomainMod = 1.1;

    
    
    var reference = lines[dd[0]];
    var refData = reference.data;
    var boundaries = getBoundaries(refData);
    
    console.log(lines[dd[0]]);
    
    if(options.yDomain !== undefined){
      boundaries.y = options.yDomain;
    }
    
    var useYRight = false;
    if (dd.length == 2){
        useYRight = true;
        boundariesR = getBoundaries(lines[dd[1]].data);
    }
    
    if(options.yRDomain !== undefined){
      boundariesR.y = options.yRDomain;
    }
    
    var wH = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;

    var boxW = parseInt(d3.select('#'+id).style('width'), 10);
    var boxH = wH - 150;

    var margin = {top: 20, right: useYRight?50:30, bottom: 55, left: 50},
        width = boxW - margin.left - margin.right,
        height = boxH - margin.top - margin.bottom;
        

    self.width = width;
    self.height = height;

    var marginBrush = {bottom: 30};
    var height2 = 50;

    xTickCount = width / 100;

    this.axisUpdateFns = [];
    this.updateAxes = function(){
        for(var i = 0; i < this.axisUpdateFns.length; i++){
            this.axisUpdateFns[i].apply(this);
        }
    }
    
    if(options.type === undefined) options.type = reference.type;

    var xNum = false;
    var xTime = false;
    if (options.type == "num" || options.type == "dual") xNum = true;
    if (options.type == "time" || options.type == "dual") xTime = true;

    var x, x2;

    var bStart = boundaries.x[0],
        bEnd = boundaries.x[1];
    if(options.blockDomain !== undefined){
      bStart = options.blockDomain[0];
      bEnd = options.blockDomain[1];
    }
    
        
    if (xNum){
        var xScaleNum = this.xScaleNum = d3.scale.linear()
            .range([0, width])
            .domain([bStart, bEnd]);

        var xScaleNum2 = this.xScaleNum2 = d3.scale.linear()
            .range([0, width])
            .domain([bStart, bEnd]);

        self.x = xScaleNum;
        self.x2 = xScaleNum2;

        self.xAxisMode = "xNum";

    }

    if(xTime){
        var d;
        if(options.timeDomain !== undefined){
          d = options.timeDomain;
        }
        else d = [blockToTime(bStart),  blockToTime(bEnd)];
        
        var xScaleTime = this.xScaleTime = d3.time.scale.utc()
            .range([0, width])
            .domain(d);

        var xScaleTime2 = this.xScaleTime2 = d3.time.scale.utc()
            .range([0, width])
            .domain(d);
            
        if(!xNum) self.xAxisMode = "xTime";

    }
    
    console.log(self.x, self.xAxisMode)

    var yDomainMod = options.yDomainMod;

    var y = self.y = d3.scale.linear()
        .domain([0, boundaries.y[1]*yDomainMod])
        .range([height, 0]);
        
    var yR;
    if (useYRight){
        var lm = boundaries.y[1]*yDomainMod;
        var rm = boundariesR.y[1]*yDomainMod;
        
        var f = lm / rm;
        if (f < 1){
            f = 1/f;
            f = Math.ceil(f);
        }
        else f = Math.floor(f);
        
        yR = self.yR = d3.scale.linear()
        .domain([0, lm / f])
        .range([height, 0]);
    }
    
    var y2 = self.y2 = d3.scale.linear()
        .domain([0, boundaries.y[1]*yDomainMod])
        .range([height2, 0]);


    var xAxis = this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom")
        .ticks(xTickCount);
        //.tickFormat(blockToTime);




    var xAxis2 = this.xAxis2 = d3.svg.axis()
        .scale(this.x2)
        .orient("bottom")
        .ticks(xTickCount);

    var yAxis = this.yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(yTick)
        .innerTickSize(-width)
        .outerTickSize(0)
        .tickPadding(10);
        
    var yAxisR = undefined;
    if (useYRight){
        yAxisR = self.yAxisR = d3.svg.axis()
        .scale(yR)
        .orient("right")
        .tickFormat(yTick)  
        .outerTickSize(10)
        .tickPadding(10);
    }
    
    var line = d3.svg.line()
        .x(function(d) { return self.x(d[self.xAxisMode]); })
        .y(function(d) { return self.y(d.y); });

    var lineBrush = d3.svg.line()
        .x(function(d) { return self.x2(d[self.xAxisMode]); })
        .y(function(d) { return self.y2(d.y); });
        
    var barXFunction = function(d){ return self.x(d[self.xAxisMode]); }
    var barWFunction = function(d){ var x = d[self.xAxisMode];
                                    var a = self.x(x);
                                    var b;
                                    if (self.xAxisMode == "xNum"){
                                        b = self.x(x + d["w" + self.xAxisMode]);
                                    }
                                    else{
                                        var nx = new Date(x.getTime() + d["wxTime"])
                                        b = self.x(nx);
                                    }
                                    
                                    
                                    return b - a;}


    this.rebrush = function(){

        self.x.domain(brush.empty() ? self.x2.domain() : brush.extent());

        
        var barOpacity = 1;
        if(self.xAxisMode == "xTime"){
            adjustAxisLabels(self.xAxis, self.x.domain(), width)
            barOpacity = getBarOpacity(self.x.domain(), true);
        }
        else barOpacity = getBarOpacity(self.x.domain());
        
        if(barOpacity < 0.3){
          d3.selectAll("#" + id + " .graphSvg .bar").classed("noPointerEvents", true)
          barOpacity *= 0.5;
        }
        else d3.selectAll("#" + id + " .graphSvg .bar").classed("noPointerEvents", false)
        

        d3.selectAll("#" + id + " .graphSvg .line").attr("d", line);
        d3.selectAll("#" + id + " .graphSvg .bar").attr("x", barXFunction).attr("width", barWFunction)
            .style("opacity", barOpacity);
        
        d3.select("#" + id + " .graphSvg .x.axis").call(self.xAxis);

    }

    var brush = self.brush = d3.svg.brush()
        .x(this.x2)
        .on("brush", self.rebrush)
        .on("brushend", self.rebrush)
    /*
    var svg = d3.select("#graphBox").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");*/

    var svgTop = d3.select("#"+id)
       .append("svg")
    .attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
       .classed("graphSvg", true);
     
    var svg = svgTop.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
    self.overlay = svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height);

    svg.append("defs").append("clipPath")
    .attr("id", "clip" + id)
  .append("rect")
    .attr("width", width)
    .attr("height", height);


    console.log(this.xAxis)
    var xAxisElem = this.xAxisElem = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(this.xAxis);

    var xAxisLabel = this.xAxisLabel = xAxisElem.append("text")
      .attr("y", 32)
      .attr("x", width/2)
      .text(xLabel);

    this.axisUpdateFns.push(function(){
       this.xAxisElem.call(this.xAxis);
    });

    this.changeTickFormat = function(scalefn, brushAxisfn, axisMode, size, label){
        var xTickCount = Math.round(width / size);

        self.xAxisMode = axisMode;

        if (scalefn !== undefined){
            var axisScale = scalefn.call(this);
            self.x = axisScale[0];
            self.x2 = axisScale[1];
        }
        else{
            self.x = self.xScaleNum;
            self.x2 = self.xScaleNum2;
        }

        self.xAxis
            .scale(self.x)
            .ticks(xTickCount)
            .tickFormat(null)

        self.xAxis2
            .scale(self.x2)
            .ticks(xTickCount)
            .tickFormat(null);

        if(brushAxisfn !== undefined){
            brushAxisfn.call(this, this.xAxis2);
        }
        else{
            this.xAxis2
                .ticks(xTickCount)
                .tickFormat(null);
        }
        
        
            //.tickSize(0)
            //.tickPadding(8);

        self.brush.x(self.x2)
        
        if(options.timeDomain !== undefined){
          d3.selectAll("#" + id + " .brushSvg .line").attr("d", lineBrush);
        }

        this.xAxisLabel.text(label);

        this.updateAxes();

        self.rebrush();
    }





    var yAxisElem = this.yAxisElem = svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);
    this.axisUpdateFns.push(function(){
       this.yAxisElem.call(this.yAxis);
    });
    
    yAxisElem.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(yLabel[0]);
      
    var yAxisRElem = undefined;
    
    if(useYRight){
        yAxisRElem = this.yAxisRElem = svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + width + " ,0)")	
          .call(yAxisR);
          
        this.axisUpdateFns.push(function(){
           this.yAxisRElem.call(this.yAxisR);
        });
        
        this.yAxisRElem.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 4)
      .attr("x", -5)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(yLabel[1]);
    }
    
    


    





    var legendSpace = 0;
    var legendItems = 0;
    var legendMap = {};
    var useBrush = false;
    lines.forEach(function(thisLine, i){
        if(thisLine.legend !== undefined){
            if (thisLine.legend.group !== undefined){
                var group = thisLine.legend.group;
                if (!(group in legendMap)){
                    legendMap[group] = {colour: thisLine.colour};
                    legendSpace += 1;
                }
            }
            else{
                legendSpace += 1;
                legendItems += 1;
            }
        }

        if(thisLine.brush !== undefined) useBrush = true;
    });
    legendSpace = width / legendSpace;

    var brushSvg;
    if(useBrush){
       brushSvg = this.brushSvg = d3.select("#"+id)
        .append("svg")
       //responsive SVG needs these 2 attributes and no width and height attr
       //class to make it responsive
       .attr("width", width + margin.left + margin.right)
       .attr("height", height2 + marginBrush.bottom)
       .classed("brushSvg", true).append("g")
        .attr("transform", "translate(" + margin.left + ",0)");



    }

    var labelContainer = svg.append("g");
    var legendCounter = 0;
    var tooltipLines = [];
    lines.forEach(function(thisLine, i){
        
        
        var colourAttrib = "stroke";
        
        if (thisLine.chart == "line"){
            var p =svg.append("path")
              .datum(thisLine.data)
              .attr("class", "line")
              .attr("clip-path", "url(#clip" + id + ")")
              .attr("d", line);

            if(thisLine.brush){
                brushSvg.append("path")
                    .datum(thisLine.data)
                    .attr("class", "line")
                    .attr("d", lineBrush);

            }
            
            if((i == dd[0] && options.ttLines === undefined) || (options.ttLines !== undefined && i in options.ttLines))
            {
              var ttName = thisLine.ttName;
              if(ttName === undefined) ttName = thisLine.name;
              tooltipLines.push([p, ttName, thisLine.data]);
            }
        }
        else{
            var pos = thisLine.position;
            
            var p =svg.selectAll(".bar")
              .data(thisLine.data)
              .enter().append("rect")
              .attr("class", "bar")
              .attr("clip-path", "url(#clip" + id + ")")
              .attr("x", barXFunction)
              .attr("width", barWFunction)  
              .attr("y", pos == "l"?function(d) { return self.y(d.y); }:function(d) { return self.yR(d.y); } )
              .attr("height",  pos == "l"?function(d) { return  height - self.y(d.y); }:function(d) { return  height - self.yR(d.y); }   )
              .on("mousemove", bindTooltipBar.call(self))
              .on("mouseleave", bindTooltipBarLeave.call(self))
        
            colourAttrib = "fill";
        }

        if(thisLine.colour !== undefined){
            p.style(colourAttrib, thisLine.colour);
        }

        var tg = false;
        if(thisLine.textLabel !== undefined){
            var l = thisLine.textLabel;
            tg = labelContainer.append("g")
            var r = tg.append("rect");
            
            var t = tg.append("text")
               .text(l["text"] === undefined ? thisLine.name : l["text"]);

            if (l.link == "abs"){
                t.attr("y", y(l["y"]) - l["py"])
            }
            else if (l.link == "right"){
                var d = thisLine.data;
                t.attr("y", y(d[d.length-1].y) + l["py"]);
            }

            if (l.x == "right"){
                t.attr("x", boxW - margin.right + l.px);
            }
            else if (l.x == "left"){
                var d = thisLine.data[t.y];
                t.attr("x", 10 + l.px);
            }

            if(l.c !== undefined){
                t.classed(l.c, true);
            }
            
            var bbox = t.node().getBBox();
            var tWidth = bbox.width-1
            var tHeight = bbox.height-1
            
            r.attr("x", t.attr("x"))
             .attr("y", t.attr("y") - tHeight+1)
             .attr("width", tWidth)
             .attr("height", tHeight)
             .classed("labelBackground", true)
            
        }

        if(thisLine.legend !== undefined){
            if(thisLine.legend.group === undefined){
                var label = svg.append("text")
                    .attr("x", (legendSpace/2)+legendCounter*legendSpace)  // space legend
                    .attr("y", height + (margin.bottom) - 5)
                    .attr("class", "legend")    // style the legend
                    .style("fill", thisLine.colour)
                    .text("Click to hide")
                    .style("opacity", 1);

                
                    
                legendCounter++;
                    
                    

                if (thisLine.legend.toggle){
                    label.transition()
                    .style("opacity", 0)
                    .duration(1000)
                    .delay(500)
                    .transition()
                    .duration(1000)
                    .style("opacity", 1)
                    .text(thisLine.name);
                
                    label.on("click", (function(lineDOM){return function(){
                        // Determine if current line is visible
                        console.log(lineDOM);
                        var active   = lineDOM.active ? false : true,
                        newVisibility = active ? "hidden" : "visible";
                        newOpacity = active ? 0 : 1;
                        // Hide or show the elements based on the ID
                        lineDOM
                            .style("visibility", newVisibility);

                        d3.select(this).style("opacity", newOpacity*0.5 + 0.5);
                        // Update whether or not the elements are active
                        lineDOM.active = active;
                        }}(p)))
                     .classed("clickable", true);
                }
                else{
                    label.text(thisLine.name);
                }
            }
            else{
                p.classed("lineGroup-" + cleanGraphClass(thisLine.legend.group), true);
                if(tg != false) tg.classed("lineGroup-" + cleanGraphClass(thisLine.legend.group), true);
            }
        }

    });
    
    if(tooltipLines.length != 0){
      bindTooltip.call(self, tooltipLines, self.overlay, options.ttFormat);
    }

    Object.keys(legendMap).forEach(function(lGroup, j){
        var i = j + legendItems;

        var label = svg.append("text")
            .attr("x", (legendSpace/2)+i*legendSpace)  // space legend
            .attr("y", height + (margin.bottom) - 5)
            .attr("class", "legend")    // style the legend
            .style("fill", legendMap[lGroup].colour)
            .text("Click to hide")
            .classed("clickable", true);
        
        label.transition()
                    .style("opacity", 0)
                    .delay(500)
                    .duration(1000)
                    .transition()
                    .duration(1000)
                    .style("opacity", 1)
                    .text(lGroup);
            


        label.on("click", function(){
            // Determine if current line is visible
            l = legendMap[lGroup];
            console.log(l);
            lClass = "lineGroup-" + cleanGraphClass(lGroup);

            var active   = l.active ? false : true;

            console.log(active, l.active);
            newOpacity = active ? 0 : 1;
            // Hide or show the elements based on the ID
            d3.selectAll("." + lClass)
                .style("opacity", newOpacity);


            d3.select(this).style("opacity", newOpacity*0.5 + 0.5);
            // Update whether or not the elements are active
            l.active = active;
            console.log(l);
        });
    }, this);
    if(useBrush){

      var brushAxisElem = this.brushAxisElem = this.brushSvg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height2 + ")")
          .call(this.xAxis2);

      this.axisUpdateFns.push(function(){
        this.brushAxisElem.call(this.xAxis2);
      });

      brushSvg.append("g")
          .attr("class", "x brush")
          .call(brush)
        .selectAll("rect")
          .attr("y", -6)
          .attr("height", height2 + 7);
    }

    self.svgMarkerLineY = svg.append("line")
            .classed("markerLine", true)
    self.svgMarkerLineX = svg.append("line")
            .classed("markerLine", true)
            
    self.tooltip = svg.append("g")
        .attr("transform", "translate(55,50)")
        .style("opacity", 1)
        
        .classed("tooltip", true)


    var rectSize = function(r, w, h, m, yr){
            r
                .attr("width", w)
                .attr("x", width - w - m)
                
            if(yr === undefined) yr = r;
            
            yr  .attr("height", h)
                .attr("y", height - h - m);
            
            
    };


    if(options.button !== undefined){
        var gThis = this;

        var button = options.button;

        var buttonMargin = 10;
        var buttonWidth = 16;
        var buttonHeight = 16;
        var buttonFullWidth = 100;
        var buttonFullHeight = 20;
        var optionItem = svg.append("g")
            .style("opacity", 0.5);

            optionItem.append("rect")
            .classed("optionButton", true)
            .attr("x", width - buttonWidth - buttonMargin)
            .attr("y", height - buttonHeight - buttonMargin)
            .attr("width", buttonWidth)
            .attr("height", buttonHeight);

            optionItem.on("mouseover", function(dur, after){
                if(dur === undefined) dur = 500;
                
                rectSize(d3.select(this).select(".optionButton").transition().duration(dur), buttonFullWidth, buttonFullHeight, buttonMargin);
                rectSize(d3.select(this).select(".optionActive").transition().duration(dur), buttonWidth/2, buttonFullHeight, buttonMargin);
                optionItem.style("opacity", 0.9);
                var tsn = d3.select(this).select(".optionLabel").transition().delay(200).duration(dur).style("opacity", 1);
                
                if(after !== undefined)tsn.each("end", after);
            })
            .on("mouseout", function(){
                rectSize(d3.select(this).select(".optionButton").transition().duration(500), buttonWidth, buttonHeight, buttonMargin);
                rectSize(d3.select(this).select(".optionActive").transition().duration(500), buttonWidth/2, buttonHeight, buttonMargin);
                optionItem.style("opacity", 0.5);
                d3.select(this).select(".optionLabel").transition().duration(500).style("opacity", 0);
            })
            .on("click", function(){
                this.active = !this.active;

                var active = d3.select(this).select(".optionActive");


                if(this.active){
                        active.style("opacity", 0.5);

                        button.enable.apply(gThis, gThis);
                        //changeTickFormat.apply(blockToTime, 200);

                }
                else{
                    active.style("opacity", 0);

                    button.disable.apply(gThis, gThis);
                }

                //console.log(this.active);

            });
            optionItem.append("rect")
            .classed("optionActive", true)
            .attr("x", width - buttonWidth/2 - buttonMargin)
            .attr("y", height - buttonHeight - buttonMargin)
            .attr("width", buttonWidth/2)
            .attr("height", buttonHeight)
            .style("opacity", 0)
            optionItem.append("text")
            .classed("optionLabel", true)
            .attr("text-anchor", "middle")
            .attr("x", width - buttonFullWidth/2 - buttonMargin)
            .attr("y", height - buttonFullHeight/2 + 4 - buttonMargin)
            .style("opacity", 0)
            .text(button.text);
            
            optionItem.on("mouseover").call(optionItem.node(), 900, function(){
            optionItem.on("mouseout").call(optionItem.node());});
    }

}



function genLine(data, name, colour, textLabel){

    var d = []

    for(var i=0; i<data.length; i++){
        d.push({
            xNum: data[i][0],
            xTime: blockToTime(data[i][0]),
            y: data[i][1]
        })
    }

    return genLineDict(d, name, colour, textLabel);
}

function genLineDict(data, name, colour, textLabel){

    return {
        data: data,
        name: name,
        colour: colour,
        textLabel: textLabel,
        chart: "line",
        position: "l"
    };
}

function genBarsDict(data, name, colour, textLabel){
    return {
        data: data,
        name: name,
        colour: colour,
        textLabel: textLabel,
        chart: "bars",
        position: "l"
    };


}
